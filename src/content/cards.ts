export type Rarity = "C" | "R" | "SR" | "SSR";

export type CharacterCard = {
  id: string;
  characterId: string;
  name: string;
  latinName: string;
  epithet: string;
  role: string;
  image: string;
  rarity: Rarity;
  number: string;
  quote: string;
  ability: string;
  description: string;
  accent: string;
};

const characters = {
  luffy: {
    characterId: "luffy",
    name: "Монки Д. Луффи",
    latinName: "MONKEY D. LUFFY",
    epithet: "Соломенная шляпа",
    role: "Капитан",
    image: "/art/luffy.webp",
    quote: "Я стану Королём пиратов!",
    ability: "Gomu Gomu no Pistol",
    description:
      "Безграничная свобода, несгибаемая воля и вера в свою команду. Каждое большое приключение начинается с мечты.",
    accent: "#ee7651",
  },
  zoro: {
    characterId: "zoro",
    name: "Ророноа Зоро",
    latinName: "RORONOA ZORO",
    epithet: "Охотник на пиратов",
    role: "Мечник",
    image: "/art/zoro.webp",
    quote: "Я стану величайшим мечником в мире.",
    ability: "Santoryu: Oni Giri",
    description:
      "Три клинка. Одно обещание. Мечник, который прокладывает свой путь силой характера и никогда не отступает от мечты.",
    accent: "#83bca0",
  },
  nami: {
    characterId: "nami",
    name: "Нами",
    latinName: "NAMI",
    epithet: "Кошка-воровка",
    role: "Навигатор",
    image: "/art/nami.webp",
    quote: "Я нарисую карту всего мира.",
    ability: "Чутьё навигатора",
    description:
      "Она читает ветер, видит путь сквозь шторм и знает цену настоящему сокровищу. С ней даже неизвестный океан становится ближе.",
    accent: "#efa85c",
  },
  usopp: {
    characterId: "usopp",
    name: "Усопп",
    latinName: "USOPP",
    epithet: "Храбрый воин моря",
    role: "Стрелок",
    image: "/art/usopp.webp",
    quote: "Моя мечта — стать храбрым воином моря.",
    ability: "Звезда пороха",
    description:
      "Меткий выстрел, невероятная история и храбрость, которая появляется именно тогда, когда нужна друзьям. Его фантазия способна изменить любое приключение.",
    accent: "#cfaa70",
  },
  sanji: {
    characterId: "sanji",
    name: "Санджи",
    latinName: "SANJI",
    epithet: "Чёрная нога",
    role: "Кок",
    image: "/art/sanji.webp",
    quote: "Когда-нибудь я найду All Blue.",
    ability: "Concassé",
    description:
      "Элегантность, стремительный удар и уважение к каждому, кто голоден. Кок, с которым команда всегда готова идти навстречу следующему морю.",
    accent: "#8ab3d1",
  },
};

export const cardCatalog: CharacterCard[] = [
  { ...characters.luffy, id: "eb-001-ssr", rarity: "SSR", number: "001" },
  { ...characters.zoro, id: "eb-002-sr", rarity: "SR", number: "002" },
  { ...characters.nami, id: "eb-003-r", rarity: "R", number: "003" },
  { ...characters.luffy, id: "eb-004-c", rarity: "C", number: "004" },
  { ...characters.zoro, id: "eb-005-r", rarity: "R", number: "005" },
  { ...characters.nami, id: "eb-006-sr", rarity: "SR", number: "006" },
  { ...characters.zoro, id: "eb-007-c", rarity: "C", number: "007" },
  { ...characters.nami, id: "eb-008-c", rarity: "C", number: "008" },
  { ...characters.usopp, id: "eb-009-c", rarity: "C", number: "009" },
  { ...characters.sanji, id: "eb-010-c", rarity: "C", number: "010" },
  { ...characters.usopp, id: "eb-011-r", rarity: "R", number: "011" },
  { ...characters.sanji, id: "eb-012-sr", rarity: "SR", number: "012" },
];

export const rarityLabels: Record<Rarity, string> = {
  C: "Обычная",
  R: "Редкая",
  SR: "Суперредкая",
  SSR: "Легендарная",
};
