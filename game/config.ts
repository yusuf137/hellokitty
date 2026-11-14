export const gameText = {
  intro: "Bir prensesin doğum gününe yetişmemiz lazım! 💗",
  final: "İyi ki doğdun aşkım! ❤️",
};

export const levels = [
  {
    name: "Çiçek Bahçesi",
    title: "Seninle başlayan bahar",
    message:
      "Sen gülünce en sıradan gün bile çiçek açıyor. İyi ki yollarımız kesişmiş, sevgilim.",
    photo: "/memories/1.jpg",
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
    photo: "/memories/2.jpg",
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
    photo: "/memories/3.jpg",
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
