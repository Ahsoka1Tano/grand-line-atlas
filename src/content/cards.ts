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
};

export const initialCards: CharacterCard[] = [
  { ...characters.luffy, id: "eb-001-ssr", rarity: "SSR", number: "001" },
  { ...characters.zoro, id: "eb-002-sr", rarity: "SR", number: "002" },
  { ...characters.nami, id: "eb-003-r", rarity: "R", number: "003" },
  { ...characters.luffy, id: "eb-004-c", rarity: "C", number: "004" },
  { ...characters.zoro, id: "eb-005-r", rarity: "R", number: "005" },
  { ...characters.nami, id: "eb-006-sr", rarity: "SR", number: "006" },
];

// Stage A uses a fixed presentation; this is not a random drop table.
export const demoBoxCards: CharacterCard[] = [initialCards[2], initialCards[1], initialCards[0]];

export const rarityLabels: Record<Rarity, string> = {
  C: "Обычная",
  R: "Редкая",
  SR: "Суперредкая",
  SSR: "Легендарная",
};
