export const gameText = {
  intro: "Bir prensesin doğum gününe yetişmemiz lazım! 💗",
};

export const levels = [
  {
    name: "Çiçek Bahçesi",
    title: "Seninle başlayan bahar",
    message:
      "Sen gülünce en sıradan gün bile çiçek açıyor. İyi ki yollarımız kesişmiş, sevgilim.",
    width: 1480,
    gaps: [
      [440, 496],
      [1020, 1092],
    ],
    ledges: [
      [180, 230, 98],
      [320, 204, 78],
      [646, 226, 105],
      [844, 212, 95],
      [1162, 228, 90],
    ],
    hazards: [790],
    checkpoint: 615,
  },
  {
    name: "Kiraz Korusu",
    title: "El ele, yan yana",
    message:
      "Birlikte kaybolduğumuz sokakları, gülmekten bitiremediğimiz cümleleri seviyorum. En güzel anılarımda hep sen varsın.",
    width: 1620,
    gaps: [
      [348, 414],
      [858, 934],
      [1274, 1348],
    ],
    ledges: [
      [155, 231, 90],
      [450, 223, 100],
      [580, 196, 78],
      [1010, 228, 88],
      [1150, 203, 86],
      [1410, 230, 82],
    ],
    hazards: [697, 1070],
    checkpoint: 772,
  },
  {
    name: "Pasta Tepesi",
    title: "Dileğini tut",
    message:
      "Bugün mumlarını üflerken tuttuğun bütün dilekler gerçek olsun. Benim en güzel dileğim zaten yanımda. Seni çok seviyorum!",
    width: 1730,
    gaps: [
      [350, 420],
      [730, 800],
      [1250, 1328],
    ],
    ledges: [
      [160, 229, 85],
      [465, 230, 100],
      [596, 202, 84],
      [846, 229, 90],
      [1054, 224, 96],
      [1380, 230, 90],
      [1500, 206, 80],
    ],
    hazards: [552, 1074],
    checkpoint: 966,
  },
];

export const ending = {
  wish: "Bir dilek tut aşkım... ❤️",
  blow: "Mumları üfle 🎂",
  title: "İYİ Kİ DOĞDUN AŞKIM! ❤️",
  lines: [
    "Seninle geçirdiğim her an benim için çok özel.",
    "Hayatıma kattığın bütün güzellikler için teşekkür ederim.",
    "İyi ki varsın, iyi ki benimlesin.",
    "Seni çok seviyorum. ❤️",
  ],
  goodbye: "Bu oyunun sonuna geldik...",
  story: "Ama bizim hikâyemiz daha yeni başlıyor. ❤️",
  note: "Nice güzel yaşlarına birlikte...",
  love: "❤️ Seni Seviyorum",
  reply: "Ben de seni çok seviyorum aşkım! ❤️",
  replay: "🔄 Tekrar Oyna",
  photos: [
    { src: "/memories/1.jpg", compliment: "Paylaştığımız ilk fotoğraf... Nasıl unutulur ki?" },
    { src: "/memories/2.jpg", compliment: "Her öptüğünde aynı heyecan aynı kalp atışı..." },
    { src: "/memories/3.jpg", compliment: "Çok güzel gülüyosun ya.." },
    { src: "/memories/4.jpg", compliment: "Sen gülerken ben her şeyimi unutuyorum." },
    { src: "/memories/5.jpg", compliment: "İyi ki doğdun, bakmaya doyamadığım sevgilim." },
  ],
  sound: { file: "", volume: 0.5 }, // İsteğe bağlı: /audio/kutlama.mp3
  ms: {
    camera: 950,
    reveal: 650,
    celebration: 1700,
    line: 1350,
    read: 3200,
    photo: 4400,
    photoLoadLimit: 6000,
    lastLine: 1300,
    hearts: 2100,
    flicker: 550,
    twinkle: 3000,
    float: 8000,
    cloud: 18000,
  },
};
