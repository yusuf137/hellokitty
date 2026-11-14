import * as Phaser from "phaser";
import { levels } from "./config";

export type Action = "left" | "right" | "jump";
export type Sound = "heart" | "jump" | "checkpoint" | "finish";
export type GameEvents = {
  onHeart(total: number): void;
  onLevelEnd(levelIndex: number): void;
  onReady?(): void;
  onCheckpoint?(): void;
  onSound?(kind: Sound): void;
};

const floorY = 272;
const viewportHeight = 320;
const speed = 182;
const heartPixels = [
  ".rr.rr.",
  "rppprpr",
  "rwhpppr",
  ".rpppr.",
  "..rpr..",
  "...r...",
];

export function createGame(parent: HTMLElement, events: GameEvents) {
  let levelIndex = 0;
  let total = 0;
  let ready = false;
  let disposed = false;
  let manualPause = false;
  let jumpRequested = false;
  const touch = { left: false, right: false, jump: false };
  const clearInput = () => {
    touch.left = touch.right = touch.jump = jumpRequested = false;
  };
  const width = () =>
    Phaser.Math.Clamp(
      Math.round(
        (parent.clientWidth * viewportHeight) /
          Math.max(1, parent.clientHeight),
      ),
      220,
      1200,
    );

  class Journey extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private keys!: Record<string, Phaser.Input.Keyboard.Key>;
    private finishX = 0;
    private spawnX = 42;
    private grace = 0;
    private jumpBuffer = 0;
    private ended = false;
    private taken = new Set<number>();
    private checkpointFlag!: Phaser.GameObjects.Graphics;
    private backdrop!: Phaser.GameObjects.TileSprite;
    private lastSafeTime = 0;

    preload() {
      this.load.image("traveler", "/art/player.png");
      this.load.image("cake", "/art/cake.png");
      this.load.image("hills", "/art/hills.png");
    }

    create() {
      if (disposed) return;
      this.ended = false;
      this.spawnX = 42;
      this.grace = this.jumpBuffer = this.lastSafeTime = 0;
      this.taken.clear();
      clearInput();
      const level = levels[levelIndex];
      const camera = this.cameras.main;
      camera.setBackgroundColor(0xffd9d5);
      this.backdrop = this.add
        .tileSprite(0, 0, this.scale.width, viewportHeight, "hills")
        .setOrigin(0)
        .setScrollFactor(0);
      const hillsHeight = this.textures.get("hills").getSourceImage().height;
      this.backdrop.setTileScale(viewportHeight / hillsHeight);
      const terrain = this.physics.add.staticGroup();
      const decor = this.add.graphics();
      for (let x = 100; x < level.width - 110; x += 147) {
        if (level.gaps.some(([a, b]) => x > a - 18 && x < b + 18)) continue;
        const canopy = levelIndex === 1 ? 0xe79cab : 0xa4b98c;
        const light = levelIndex === 1 ? 0xffced2 : 0xc3d49c;
        const top = floorY - 49 - (x % 21);
        decor
          .fillStyle(0xb59582)
          .fillRect(x - 3, top + 18, 7, floorY - top - 18);
        decor.fillStyle(0xc6aa91).fillRect(x, top + 18, 3, floorY - top - 18);
        decor
          .fillStyle(canopy)
          .fillRect(x - 24, top + 9, 47, 18)
          .fillRect(x - 18, top + 3, 39, 27)
          .fillRect(x - 12, top - 2, 26, 36);
        decor
          .fillStyle(light)
          .fillRect(x - 19, top + 5, 14, 5)
          .fillRect(x - 13, top + 1, 19, 6)
          .fillRect(x + 6, top + 10, 10, 3);
        if (levelIndex === 2) {
          decor
            .lineStyle(1, 0xaf8193)
            .beginPath()
            .moveTo(x, top + 20)
            .lineTo(x + 36, top + 26)
            .lineTo(x + 73, top + 21)
            .strokePath();
          decor
            .fillStyle(0xf6a2b1)
            .fillTriangle(x + 8, top + 22, x + 18, top + 24, x + 12, top + 33);
          decor
            .fillStyle(0xffda8e)
            .fillTriangle(x + 27, top + 25, x + 37, top + 26, x + 32, top + 35);
          decor
            .fillStyle(0xc3aad2)
            .fillTriangle(x + 46, top + 25, x + 56, top + 24, x + 52, top + 34);
          decor
            .fillStyle(0xb59582)
            .fillRect(x + 72, top + 18, 2, floorY - top - 18);
        }
      }
      const texture = this.make.graphics({ x: 0, y: 0 }, false);
      if (!this.textures.exists("love")) {
        const palette: Record<string, number> = {
          r: 0xa34560,
          p: 0xf87994,
          w: 0xffebe6,
          h: 0xffa2b1,
        };
        heartPixels.forEach((row, y) =>
          [...row].forEach((pixel, x) => {
            if (palette[pixel])
              texture.fillStyle(palette[pixel]).fillRect(x * 2, y * 2, 2, 2);
          }),
        );
        texture.generateTexture("love", 14, 12);
      }
      texture.destroy();

      const platform = (
        x: number,
        y: number,
        length: number,
        height: number,
        floating = false,
      ) => {
        const soil = this.add
          .rectangle(x, y, length, height, floating ? 0xc58e85 : 0xc99185)
          .setOrigin(0);
        this.physics.add.existing(soil, true);
        terrain.add(soil);
        const body = soil.body as Phaser.Physics.Arcade.StaticBody;
        body.updateFromGameObject();
        if (floating)
          body.checkCollision.down =
            body.checkCollision.left =
            body.checkCollision.right =
              false;
        const detail = this.add.graphics();
        detail.fillStyle(0x967268).fillRect(x, y + height - 2, length, 2);
        detail.fillStyle(0x76926b).fillRect(x, y, length, 7);
        detail.fillStyle(0xc4d79a).fillRect(x, y, length, 3);
        for (let i = 4; i < length - 4; i += 14) {
          detail.fillStyle(0x92b278).fillRect(x + i, y + 4, 7, 6);
          detail
            .fillStyle(0xdfa99a)
            .fillRect(x + i + 2, y + 13 + (i % 5), 5, 2);
          if (!floating)
            detail.fillStyle(0xb7837d).fillRect(x + i, y + 24 + (i % 11), 4, 2);
        }
      };
      let start = 0;
      for (const [left, right] of level.gaps) {
        platform(start, floorY, left - start, 52);
        start = right;
      }
      platform(start, floorY, level.width - start, 52);
      for (const [x, y, length] of level.ledges)
        platform(x, y, length, 19, true);

      for (let x = 8; x < level.width; x += 19) {
        if (level.gaps.some(([a, b]) => x + 5 > a && x - 2 < b)) continue;
        const h = 4 + (x % 7);
        decor
          .fillStyle(0x829f75)
          .fillRect(x, floorY - h, 2, h)
          .fillRect(x - 2, floorY - 4, 3, 2);
        if (x % 3 !== 0) {
          decor
            .fillStyle(x % 2 ? 0xff9ba8 : 0xffefe0)
            .fillRect(x - 3, floorY - h - 2, 7, 3)
            .fillRect(x - 1, floorY - h - 4, 3, 7);
          decor.fillStyle(0xffcf7d).fillRect(x, floorY - h - 1, 2, 2);
        }
      }
      const hazards = this.physics.add.staticGroup();
      for (const x of level.hazards) {
        for (let i = 0; i < 3; i++) {
          const left = x + i * 7;
          decor
            .fillStyle(0x805769)
            .fillTriangle(
              left,
              floorY,
              left + 4,
              floorY - 12,
              left + 8,
              floorY,
            );
          decor
            .fillStyle(0xd58caa)
            .fillTriangle(
              left + 2,
              floorY - 2,
              left + 4,
              floorY - 8,
              left + 6,
              floorY - 2,
            );
        }
        const sensor = this.add
          .rectangle(x + 11, floorY - 4, 17, 8)
          .setVisible(false);
        this.physics.add.existing(sensor, true);
        hazards.add(sensor);
      }
      this.checkpointFlag = this.add.graphics();
      this.drawFlag(level.checkpoint, false);
      this.finishX = level.width - 72;
      if (levelIndex === levels.length - 1) {
        this.add
          .image(this.finishX, floorY, "cake")
          .setOrigin(0.5, 1)
          .setDisplaySize(64, 70);
      } else {
        // A sealed love letter marks the end of the garden.
        const x = this.finishX;
        decor.fillStyle(0x996e6c).fillRect(x - 3, floorY - 28, 6, 28);
        decor.fillStyle(0x9c6471).fillRect(x - 16, floorY - 44, 32, 23);
        decor.fillStyle(0xffe9d9).fillRect(x - 14, floorY - 42, 28, 19);
        decor
          .lineStyle(2, 0xcf9297)
          .beginPath()
          .moveTo(x - 14, floorY - 41)
          .lineTo(x, floorY - 30)
          .lineTo(x + 14, floorY - 41)
          .strokePath();
        this.add.image(x, floorY - 30, "love").setScale(0.6);
      }
      this.player = this.physics.add.sprite(
        this.spawnX,
        floorY - 22,
        "traveler",
      );
      this.player.setDisplaySize(27, 34);
      this.player.body!.setSize(
        this.player.width * 0.58,
        this.player.height * 0.87,
        true,
      );
      this.player.setDepth(3).setMaxVelocity(speed, 470);
      this.physics.add.collider(this.player, terrain);
      this.physics.add.overlap(this.player, hazards, () => this.respawn());
      const heartPositions = level.ledges.map(([x, y, length]) => [
        x + length / 2,
        y - 18,
      ]);
      for (const [left, right] of level.gaps)
        heartPositions.push([(left + right) / 2, floorY - 54]);
      heartPositions.forEach(([x, y], i) => {
        const heart = this.physics.add.staticImage(x, y, "love");
        this.tweens.add({
          targets: heart,
          y: y - 3,
          yoyo: true,
          repeat: -1,
          duration: 540 + i * 27,
          ease: "Sine.inOut",
        });
        this.physics.add.overlap(this.player, heart, () => {
          if (this.taken.has(i) || this.ended) return;
          this.taken.add(i);
          heart.disableBody(true, true);
          this.spark(x, y);
          events.onHeart(++total);
          events.onSound?.("heart");
        });
      });
      camera.setBounds(0, 0, level.width, viewportHeight);
      camera.startFollow(
        this.player,
        true,
        0.13,
        1,
        -Math.min(58, this.scale.width * 0.08),
        0,
      );
      camera.roundPixels = true;
      this.keys = this.input.keyboard!.addKeys(
        "LEFT,RIGHT,UP,A,D,W,SPACE",
      ) as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.keyboard!.resetKeys();
      ready = true;
      events.onReady?.();
    }

    private drawFlag(x: number, lit: boolean) {
      const g = this.checkpointFlag.clear();
      g.fillStyle(0x8b706f).fillRect(x, floorY - 49, 3, 49);
      g.fillStyle(lit ? 0xe5648e : 0xb394ac).fillRect(
        x + 3,
        floorY - 45,
        19,
        13,
      );
      g.fillStyle(lit ? 0xffcad5 : 0xe9cadc).fillRect(
        x + 3,
        floorY - 45,
        16,
        3,
      );
      g.fillStyle(0xffeddd)
        .fillRect(x + 9, floorY - 40, 5, 4)
        .fillRect(x + 10, floorY - 36, 3, 2);
    }

    private spark(x: number, y: number) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const p = this.add
          .rectangle(x, y, 3, 3, i % 2 ? 0xffe8aa : 0xfc9eaf)
          .setDepth(4);
        this.tweens.add({
          targets: p,
          x: x + Math.cos(a) * 22,
          y: y + Math.sin(a) * 20 - 6,
          alpha: 0,
          duration: 340,
          onComplete: () => p.destroy(),
        });
      }
    }

    private respawn() {
      if (this.ended || this.time.now - this.lastSafeTime < 280) return;
      this.lastSafeTime = this.time.now;
      this.player.setVelocity(0).setPosition(this.spawnX, floorY - 28);
      this.grace = this.jumpBuffer = 0;
      this.cameras.main.flash(160, 255, 220, 228);
    }

    update(time: number, delta: number) {
      if (this.ended || !this.keys || disposed) return;
      this.backdrop.width = this.scale.width;
      this.backdrop.tilePositionX = this.cameras.main.scrollX * 0.13;
      const k = this.keys;
      const dir =
        Number(touch.right || k.RIGHT.isDown || k.D.isDown) -
        Number(touch.left || k.LEFT.isDown || k.A.isDown);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const grounded = body.blocked.down || body.touching.down;
      const step = Math.min(delta, 40) / 1000;
      const diff = dir * speed - body.velocity.x;
      this.player.setVelocityX(
        body.velocity.x +
          Math.sign(diff) *
            Math.min(Math.abs(diff), (dir ? 1150 : 1700) * step),
      );
      if (dir) this.player.setFlipX(dir < 0);
      if (grounded && dir) this.player.setAngle(Math.sin(time / 68) * 3);
      else this.player.setAngle(0);
      const jump = [k.UP, k.W, k.SPACE]
        .map((key) => Phaser.Input.Keyboard.JustDown(key))
        .some(Boolean);
      if (jump || jumpRequested) this.jumpBuffer = time + 115;
      jumpRequested = false;
      if (grounded) this.grace = time + 90;
      if (this.jumpBuffer > time && this.grace > time) {
        this.player.setVelocityY(-378);
        this.grace = this.jumpBuffer = 0;
        events.onSound?.("jump");
      }
      if (this.player.x < 12) this.player.setX(12);
      if (this.player.y > viewportHeight + 28) this.respawn();
      const level = levels[levelIndex];
      if (
        this.spawnX !== level.checkpoint &&
        this.player.x >= level.checkpoint
      ) {
        this.spawnX = level.checkpoint;
        this.drawFlag(this.spawnX, true);
        this.spark(this.spawnX + 10, floorY - 39);
        events.onSound?.("checkpoint");
        events.onCheckpoint?.();
      }
      if (this.player.x >= this.finishX - 22) {
        this.ended = true;
        clearInput();
        this.player.setAngle(0).setVelocity(0);
        this.physics.pause();
        events.onSound?.("finish");
        events.onLevelEnd(levelIndex);
      }
    }
  }

  const scene = new Journey("journey");
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: width(),
    height: viewportHeight,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#ffd9d5",
    audio: { noAudio: true },
    fps: { target: 60 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 920 } } },
    scene,
  });
  const resize = new ResizeObserver(() => {
    if (
      !disposed &&
      game.isBooted &&
      parent.clientWidth > 0 &&
      parent.clientHeight > 0
    )
      game.scale.setGameSize(width(), viewportHeight);
  });
  resize.observe(parent);
  const focus = () => {
    clearInput();
    if (ready) scene.input.keyboard?.resetKeys();
  };
  window.addEventListener("blur", focus);
  return {
    startLevel(index: number) {
      if (disposed || !levels[index]) return;
      levelIndex = index;
      if (index === 0) {
        total = 0;
        events.onHeart(0);
      }
      if (ready) {
        if (manualPause) game.scene.resume("journey");
        manualPause = false;
        scene.scene.restart();
      }
    },
    input(action: Action, down: boolean) {
      if (action === "jump" && down && !touch.jump) jumpRequested = true;
      touch[action] = down;
    },
    pause(paused: boolean) {
      focus();
      manualPause = paused;
      if (ready && paused) game.scene.pause("journey");
      else if (ready) game.scene.resume("journey");
    },
    destroy() {
      disposed = true;
      resize.disconnect();
      window.removeEventListener("blur", focus);
      game.destroy(true);
    },
  };
}
