import type { AtlasPlace, AtlasPoint } from "./atlas";
import reference from "./atlas-reference.json";

const referenceByName = new Map(reference.rows.map((row) => [row.name, row]));
const lerp = (v: number, a: number, b: number, c: number, d: number) =>
  c + ((v - a) / (b - a)) * (d - c);
const interpolate = (value: number, anchors: number[][]) => {
  const found = anchors.findIndex((a, i) => i < anchors.length - 1 && value <= anchors[i + 1][0]);
  const index = found < 0 ? anchors.length - 2 : found;
  const [a, b] = [anchors[index], anchors[index + 1]];
  return lerp(value, a[0], b[0], a[1], b[1]);
};
/** Registers the observed fan chart to our projection. No random positioning. */
export function projectReferencePoint(name: string, region: AtlasPlace["region"]): AtlasPoint {
  const row = referenceByName.get(name);
  if (!row) throw new Error(`Missing observed OP Maps marker: ${name}`);
  let x = 0,
    y = 0;
  if (region === "north-blue") {
    x = lerp(row.x, -600, 250, 280, 760);
    y = lerp(row.y, -400, 150, 170, 640);
  } else if (region === "west-blue") {
    x = lerp(row.x, -600, 250, 310, 870);
    y = lerp(row.y, 550, 1050, 1080, 1440);
  } else if (region === "south-blue") {
    x = lerp(row.x, 800, 1950, 1450, 2100);
    y = lerp(row.y, 550, 1050, 1100, 1420);
  } else if (region === "paradise") {
    x = interpolate(row.x, [
      [808, 1335],
      [874, 1445],
      [903, 1575],
      [1041, 1720],
      [1172, 1870],
      [1329, 2010],
      [1562, 2085],
      [1908, 2285],
    ]);
    y = lerp(row.y, 250, 510, 767, 927);
  } else if (region === "new-world") {
    x = interpolate(row.x, [
      [-800, 500],
      [-594, 670],
      [-52, 910],
      [390, 1120],
    ]);
    y = lerp(row.y, 250, 510, 768, 927);
  } else {
    x = interpolate(row.x, [
      [870, 1425],
      [1192, 1620],
      [1525, 1820],
      [1783, 1940],
      [2100, 2170],
    ]);
    const baseline = interpolate(row.x, [
      [870, 655],
      [1192, 330],
      [1525, 520],
      [1783, 424],
      [2100, 325],
    ]);
    const sourceBaseline = interpolate(row.x, [
      [870, 122],
      [1192, -268],
      [1525, -210],
      [1783, -264],
      [2100, -350],
    ]);
    y = Math.min(660, Math.max(135, baseline + (row.y - sourceBaseline) * 0.8));
  }
  return { x: Math.round(x), y: Math.round(y) };
}

type RefIsland = [
  string,
  string,
  string,
  AtlasPlace["region"],
  string,
  number?,
  AtlasPlace["terrain"]?,
];
const islands: RefIsland[] = [
  [
    "ukkari",
    "Остров горячих источников Уккари",
    "Ukkari Island",
    "paradise",
    "Остров курорта Гэдацу и Горо из истории на обложках; соединён тоннелем с Алабастой.",
    11,
  ],
  [
    "baltigo",
    "Балтиго",
    "Baltigo",
    "new-world",
    "Бывшая база Революционной армии на Grand Line. Мировая позиция здесь следует фанатскому атласу.",
    14,
    "desert",
  ],
  [
    "mirror-ball",
    "Миррор-Болл",
    "Mirror Ball Island",
    "east-blue",
    "Остров Джанго и Фуллбоди из истории на обложках.",
    17,
  ],
  [
    "minion",
    "Остров Минион",
    "Minion Island",
    "north-blue",
    "Остров, где разворачивается история Ло и Корасона.",
    23,
    "snow",
  ],
  [
    "deul",
    "Королевство Деул",
    "Deul Kingdom",
    "north-blue",
    "Королевство North Blue, связанное с Мировым правительством.",
    23,
    "city",
  ],
  [
    "ballywood",
    "Королевство Балливуд",
    "Ballywood Kingdom",
    "west-blue",
    "Королевство West Blue; его правитель участвует в Ревери.",
    28,
    "city",
  ],
  [
    "toroa",
    "Остров Тороа",
    "Toroa Island",
    "west-blue",
    "Остров West Blue, связанный с прошлым Байрона.",
    22,
  ],
  [
    "briss",
    "Королевство Брисс",
    "Kingdom of Briss",
    "south-blue",
    "Королевство South Blue; название встречается в истории корабля St. Briss.",
    25,
    "city",
  ],
  [
    "kyuka",
    "Остров Кьюка",
    "Kyuka Island",
    "paradise",
    "Остров отдыха, появляющийся в историях на обложках.",
    12,
  ],
  [
    "nanimonai",
    "Остров Нанимонаи",
    "Nanimonai Island",
    "paradise",
    "Небольшой остров Paradise, показанный во время плавания к Алабасте.",
    11,
  ],
  [
    "renaisse",
    "Ренесс",
    "Renaisse",
    "paradise",
    "Здесь Смокер и Тасиги задержали агента Mr. 11.",
    12,
  ],
  [
    "boin",
    "Архипелаг Боин",
    "Boin Archipelago",
    "paradise",
    "Растительные острова-ловушки, где тренировался Усопп.",
    17,
  ],
  [
    "banaro",
    "Остров Банаро",
    "Banaro Island",
    "paradise",
    "Место столкновения Эйса и Чёрной Бороды.",
    15,
  ],
  [
    "foolshout",
    "Фулшаут",
    "Foolshout Island",
    "paradise",
    "Остров Paradise, связанный с путешествием Коалы.",
    12,
  ],
  [
    "namakura",
    "Остров Намакура",
    "Namakura Island",
    "paradise",
    "Остров, на который Кума отправил Брука; здесь находится Харахэттания.",
    16,
  ],
  [
    "kenzan",
    "Остров Кэндзан",
    "Kenzan Island",
    "paradise",
    "Остров королевства Тэхна-Гэхна, связанный с племенем Длинноруких.",
    15,
  ],
  [
    "san-faldo",
    "Сан-Фальдо",
    "San Faldo",
    "paradise",
    "Остановка морского поезда, известная как карнавальный город.",
    12,
    "city",
  ],
  [
    "pucci",
    "Пуччи",
    "Pucci Island",
    "paradise",
    "Остров-город на сети морского поезда Уотер-Севен.",
    12,
    "city",
  ],
  [
    "st-poplar",
    "Сент-Поплар",
    "St Poplar",
    "paradise",
    "Город Королевы Весны, связанный с Уотер-Севен морским поездом.",
    12,
    "city",
  ],
  [
    "shift-station",
    "Шифт-Стейшн",
    "Shift Station",
    "paradise",
    "Станция на пути морского поезда к Эниес-Лобби.",
    6,
    "city",
  ],
  [
    "karai-bari",
    "Остров Карай-Бари",
    "Karai Bari Island",
    "new-world",
    "Остров, связанный с организацией Багги и Cross Guild.",
    16,
  ],
  [
    "foodvalten",
    "Фудвалтен",
    "Foodvalten Island",
    "new-world",
    "Остров Нового мира из истории о смене влияния после войны.",
    15,
  ],
  [
    "yukiryu",
    "Остров Юкирю",
    "Yukiryu Island",
    "new-world",
    "Зимний остров Grand Line, на котором показаны Красноволосые пираты.",
    15,
    "snow",
  ],
  [
    "sphinx",
    "Остров Сфинкс",
    "Sphinx Island",
    "new-world",
    "Родина Белоуса и остров, который защищает Марко.",
    17,
  ],
  [
    "winner",
    "Остров Виннер",
    "Winner Island",
    "new-world",
    "Остров, у которого встретились команды Ло и Чёрной Бороды.",
    14,
    "snow",
  ],
  [
    "g-14",
    "База G-14",
    "G-14",
    "new-world",
    "База Морского дозора, связанная с событиями у Эггхеда.",
    12,
    "city",
  ],
];
const tottoNames = [
  ["hundred-percent", "Остров 100%", "100% Island"],
  ["biscuits", "Бисквитный остров", "Biscuits"],
  ["black", "Чёрный остров", "Black Island"],
  ["cacao", "Какао", "Cacao"],
  ["candy", "Конфетный остров", "Candy"],
  ["cheese", "Сырный остров", "Cheese"],
  ["cutlery", "Остров столовых приборов", "Cutlery Island"],
  ["flavor", "Остров Флейвор", "Flavor"],
  ["fruits", "Фруктовый остров", "Fruits Island"],
  ["funwari", "Остров Фунвари", "Funwari"],
  ["futoru", "Остров Футору", "Futoru Island"],
  ["ice", "Ледяной остров", "Ice"],
  ["jam", "Джемовый остров", "Jam"],
  ["jelly", "Желейный остров", "Jelly"],
  ["kibo", "Остров Кибо", "Kibo"],
  ["kimi", "Остров Кими", "Kimi"],
  ["kinko", "Остров Кинко", "Kinko"],
  ["komugi", "Комуги", "Komugi Island"],
  ["liqueur", "Ликёрный остров", "Liqueur"],
  ["loving", "Остров Лавинг", "Loving Island"],
  ["margarine", "Маргариновый остров", "Margarine"],
  ["milenge", "Остров Миленге", "Milenge"],
  ["noko", "Остров Ноко", "Noko"],
  ["nuts", "Ореховый остров", "Nuts"],
  ["package", "Остров Пэкедж", "Package"],
  ["piepie", "Остров Пайпай", "Piepie Island"],
  ["poripori", "Остров Порипори", "Poripori"],
  ["potato", "Картофельный остров", "Potato"],
  ["rokumitsu", "Остров Рокумицу", "Rokumitsu"],
  ["sanshoku", "Остров Сансёку", "Sanshoku Island"],
  ["tanega", "Остров Танега", "Tanega Island"],
  ["topping", "Остров Топпинг", "Topping Island"],
  ["unique", "Остров Юник", "Unique Island"],
  ["yakigashi", "Остров Якигаси", "Yakigashi"],
];
type LocalPlace = [string, string, string, string, number, number, string];
const towns: LocalPlace[] = [
  [
    "gray-terminal",
    "Серый терминал",
    "Gray Terminal",
    "dawn",
    -19,
    -38,
    "Свалка за стенами Гоа, связанная с детством Луффи, Эйса и Сабо.",
  ],
  [
    "gosa",
    "Деревня Госа",
    "Villa Gosa",
    "conomi",
    -8,
    -24,
    "Деревня архипелага Кономи, пострадавшая от Арлонга.",
  ],
  [
    "alubarna",
    "Алубарна",
    "Alubarna",
    "alabasta",
    29,
    -32,
    "Столица Алабасты и резиденция семьи Нефертари.",
  ],
  [
    "nanohana",
    "Нанохана",
    "Nanohana",
    "alabasta",
    16,
    63,
    "Порт Алабасты, куда прибыла команда с Виви.",
  ],
  ["rainbase", "Рейнбейс", "Rainbase", "alabasta", -49, -39, "Город оазиса с казино Rain Dinners."],
  ["erumalu", "Эрумалу", "Elumalu", "alabasta", -44, 29, "Город Алабасты, пострадавший от засухи."],
  ["tamarisk", "Тамариск", "Tamarisk", "alabasta", 57, 33, "Город на побережье Алабасты."],
  ["yuba", "Юба", "Yuba", "alabasta", -55, -4, "Оазис Алабасты, где команда встретила Тото."],
  [
    "katorea",
    "Катория",
    "Katorea",
    "alabasta",
    14,
    37,
    "Город Алабасты, связанный с армией повстанцев.",
  ],
  [
    "mock-town",
    "Мок-таун",
    "Mock Town",
    "jaya",
    -9,
    9,
    "Пиратский порт Джая, где команда столкнулась с Беллами.",
  ],
  [
    "upper-yard",
    "Верхний двор",
    "Upper Yard",
    "skypiea",
    -19,
    -8,
    "Поднятая в небо часть Джая, ставшая священной землёй Скайпии.",
  ],
  [
    "angel-island",
    "Ангельский остров",
    "Angel Island",
    "skypiea",
    24,
    13,
    "Облачный остров со столицей Ангел-Бич.",
  ],
  [
    "hidden-cloud",
    "Скрытая облачная деревня",
    "Hidden Cloud Village",
    "skypiea",
    -23,
    16,
    "Поселение шандийцев в облаках Скайпии.",
  ],
  [
    "shandora",
    "Шандора",
    "Shandora",
    "skypiea",
    -14,
    -19,
    "Золотой город шандийцев и его древний колокол.",
  ],
  [
    "harahettania",
    "Харахэттания",
    "Harahettania",
    "namakura",
    1,
    2,
    "Поселение на Намакуре, где оказался Брук.",
  ],
  ["udon", "Удон", "Udon", "wano", -28, 34, "Один из регионов Вано; известен тюрьмой и шахтами."],
  ["hakumai", "Хакумай", "Hakumai", "wano", 44, 19, "Регион Вано с портом Хабу."],
  ["kibi", "Киби", "Kibi", "wano", -14, -26, "Один из шести регионов Вано."],
  ["kuri", "Кури", "Kuri", "wano", -57, -29, "Регион Вано, связанный с Одэном и деревней Амигаса."],
  [
    "ringo",
    "Ринго",
    "Ringo",
    "wano",
    36,
    -27,
    "Снежный северный регион Вано с кладбищами самураев.",
  ],
  ["flower-capital", "Цветочная столица", "Flower Capital", "wano", 1, 4, "Главный город Вано."],
  ["sweet-city", "Сладкий город", "Sweet City", "whole-cake", 0, 1, "Столица на Пирожном острове."],
  [
    "seducing-woods",
    "Соблазняющий лес",
    "Alluring Forest",
    "whole-cake",
    -12,
    13,
    "Лес хомис на Пирожном острове.",
  ],
  ["acacia", "Акация", "Acacia", "dressrosa", -8, 7, "Портовый город Дрессрозы."],
  [
    "tontatta",
    "Королевство Тонтатта",
    "Tontatta Kingdom",
    "green-bit",
    0,
    0,
    "Поселение гномов на Грин-Бит.",
  ],
];
const catalogOnly: [string, string, string, AtlasPlace["region"], string][] = [
  ["micqueot", "Миккэот", "Micqueot", "north-blue", "Город North Blue, известный своим вином."],
  [
    "swallow",
    "Остров Суоллоу",
    "Swallow Island",
    "north-blue",
    "Остров North Blue, связанный с Шачи и Пингвином.",
  ],
  [
    "rubeck",
    "Остров Рубек",
    "Rubeck Island",
    "north-blue",
    "Остров из истории сделки с плодом Опэ Опэ.",
  ],
  [
    "whiteland",
    "Королевство Уайтленд",
    "Whiteland Kingdom",
    "north-blue",
    "Королевство North Blue, участвующее в Ревери.",
  ],
  ["downs", "Даунс", "Downs", "north-blue", "Место из прошлого семьи Донкихот."],
  ["kuen", "Деревня Куэн", "Kuen Village", "north-blue", "Родная деревня Бэби-5."],
  [
    "las-camp",
    "Лас-Камп",
    "Las Camp",
    "west-blue",
    "Остров West Blue, упоминаемый в новостях о пиратах.",
  ],
  [
    "centaurea",
    "Центауреа",
    "Centaurea",
    "south-blue",
    "Остров South Blue, связанный с Революционной армией.",
  ],
  [
    "karakuri",
    "Остров Каракури",
    "Karakuri Island",
    "paradise",
    "Зимний остров Вегапанка, где тренировался Фрэнки.",
  ],
  [
    "momoiro",
    "Остров Момоиро",
    "Momoiro Island",
    "paradise",
    "Остров королевства Камабакка, где тренировался Санджи.",
  ],
  [
    "kuraigana",
    "Остров Курайгана",
    "Kuraigana Island",
    "paradise",
    "Остров с руинами Сиккэару; здесь тренировался Зоро.",
  ],
  [
    "lulusia",
    "Королевство Лулусия",
    "Lulusia Kingdom",
    "paradise",
    "Королевство, связанное с историей Сабо. Уничтоженное место учитывается в историческом атласе.",
  ],
  ["g-2", "База G-2", "G-2", "paradise", "База Морского дозора в Paradise."],
  ["g-5", "База G-5", "G-5", "new-world", "База Морского дозора в Новом мире."],
  [
    "new-marineford",
    "Новый Маринфорд",
    "New Marineford",
    "new-world",
    "Штаб-квартира Дозора после переноса в Новый мир.",
  ],
  [
    "raijin",
    "Остров Райдзин",
    "Raijin Island",
    "new-world",
    "Остров с постоянными молниями, один из вариантов Log Pose после подводного перехода.",
  ],
  [
    "risky-red",
    "Риски-Ред",
    "Risky Red Island",
    "new-world",
    "Остров из вариантов маршрута в начале Нового мира.",
  ],
  [
    "mystoria",
    "Мистория",
    "Mystoria Island",
    "new-world",
    "Остров из вариантов маршрута в начале Нового мира.",
  ],
  [
    "prodence",
    "Королевство Проденс",
    "Prodence Kingdom",
    "new-world",
    "Королевство Нового мира, связанное с королём Элизабелло II.",
  ],
  [
    "broc-coli",
    "Остров Брок-Коли",
    "Broc Coli Island",
    "new-world",
    "Остров Нового мира из истории Дзимбэя на обложках.",
  ],
];

export function expandAtlas(base: AtlasPlace[]): AtlasPlace[] {
  const places = base.map((p) => ({ ...p }));
  const byId = new Map(places.map((p) => [p.id, p]));
  const add = (p: AtlasPlace) => {
    if (byId.has(p.id)) throw new Error(`Duplicate atlas place ${p.id}`);
    places.push(p);
    byId.set(p.id, p);
  };
  for (const [id, name, english, region, description, radius = 16, terrain = "forest"] of islands) {
    add({
      id,
      name,
      english,
      region,
      description,
      radius,
      terrain,
      point: projectReferencePoint(english, region),
      source: "opmaps",
      placement: "reference",
      reference: english,
      kind: id === "boin" ? "archipelago" : "island",
      detail: ["minion", "deul", "ballywood", "toroa", "briss", "sphinx", "winner"].includes(id)
        ? 1
        : 2,
    });
  }
  const promotions = {
    "rare-animals": "Rare Animal Island",
    oikot: "Kingdom of Oykot",
    lvneel: "Kingdom of Lvneel",
    ohara: "Ohara",
    "god-valley": "God Valley",
    torino: "Kingdom of Turin",
    egghead: "Egghead",
    elbaf: "Elbaf",
    hachinosu: "Hachinosu",
    lodestar: "Lodestar Island",
  };
  for (const [id, ref] of Object.entries(promotions)) {
    const p = byId.get(id)!;
    if (!p) throw new Error(`Missing original atlas place: ${id}`);
    Object.assign(p, {
      placement: "reference",
      source: "opmaps",
      reference: ref,
      point: projectReferencePoint(ref, p.region),
      radius: ["egghead", "elbaf"].includes(id) ? 21 : 16,
      terrain: id === "egghead" ? "city" : "forest",
      detail: id === "rare-animals" ? 2 : 1,
    });
  }
  for (const [id, name, ref] of [
    ["notice", "Нотис", "Notice Town"],
    ["rakesh", "Ракэш", "Rakesh"],
  ]) {
    add({
      id,
      name,
      english: ref,
      region: "north-blue",
      description:
        id === "notice"
          ? "Родной город Беллами в North Blue."
          : "Порт North Blue из истории пиратов Донкихота.",
      kind: "city",
      terrain: "city",
      point: projectReferencePoint(ref, "north-blue"),
      radius: 13,
      detail: 2,
      source: "opmaps",
      placement: "reference",
      reference: ref,
    });
  }
  add({
    id: "totto-land",
    name: "Тотто-Лэнд",
    english: "Totto Land",
    region: "new-world",
    kind: "archipelago",
    description:
      "Пирожный остров и 34 окружающих острова. Именованные острова раскрываются при увеличении; неизвестные позиции остаются в указателе.",
    point: { x: 723, y: 781 },
    radius: 0,
    detail: 1,
    source: "cw9",
    placement: "route",
    focusBounds: { x: 580, y: 765, width: 270, height: 205 },
  });
  Object.assign(byId.get("whole-cake")!, { parent: "totto-land", radius: 22 });
  const wano = byId.get("wano")!.point!;
  const wanoReference = referenceByName.get("Wano Country")!;
  const onigashimaReference = referenceByName.get("Onigashima")!;
  Object.assign(byId.get("onigashima")!, {
    point: {
      x: Math.round(wano.x + (onigashimaReference.x - wanoReference.x) * 1.2),
      y: Math.round(wano.y + (onigashimaReference.y - wanoReference.y) * 1.9),
    },
    radius: 12,
    source: "opmaps",
    placement: "reference",
    reference: "Onigashima",
  });
  for (const [id, name, ref] of tottoNames) {
    const old = byId.get(id);
    if (old) {
      old.parent = "totto-land";
      old.radius = 8;
      if (id === "cacao") old.reference = ref;
      continue;
    }
    const observed = referenceByName.get(ref);
    const point = observed
      ? {
          x: Math.round(670 + (observed.x + 594) * 1.2),
          y: Math.round(849 + (observed.y - 308) * 0.68),
        }
      : undefined;
    add({
      id,
      name,
      english: ref.endsWith("Island") ? ref : ref + " Island",
      region: "new-world",
      parent: "totto-land",
      description: "Именованный остров архипелага Тотто-Лэнд.",
      kind: "island",
      terrain: "cake",
      radius: point ? 6 : undefined,
      point,
      source: point ? "opmaps" : "manga",
      placement: point ? "reference" : "unknown",
      reference: observed ? ref : undefined,
      detail: 2,
      aliases: id === "cheese" ? ["Milk", "Milk Island", "Молочный остров"] : undefined,
      note:
        id === "cheese"
          ? "Milk Island — прежняя подпись, исправленная на Cheese Island в One Piece Magazine 5. Отдельный остров-дубль не добавлен."
          : undefined,
    });
  }
  const whisky = byId.get("whisky-peak")!;
  add({
    ...whisky,
    id: "cactus",
    name: "Остров Кактус",
    english: "Cactus Island",
    kind: "island",
    parent: undefined,
    description: "Остров с кактусообразными скалами; поселение Виски-Пик находится на нём.",
    reference: "Cactus Island",
  });
  Object.assign(whisky, {
    parent: "cactus",
    kind: "city",
    placement: "local",
    radius: 0,
    detail: 2,
  });
  for (const [id, name, english, parent, dx, dy, description] of towns) {
    const home = byId.get(parent)!;
    add({
      id,
      name,
      english,
      parent,
      description,
      region: home.region,
      kind: "city",
      point: home.point ? { x: home.point.x + dx, y: home.point.y + dy } : undefined,
      radius: 0,
      detail: 2,
      source: "manga",
      placement: home.point ? "local" : "unknown",
      reference: referenceByName.has(english) ? english : undefined,
    });
  }
  for (const [id, name, english, region, description] of catalogOnly)
    add({
      id,
      name,
      english,
      region,
      description,
      kind: "island",
      detail: 2,
      source: "manga",
      placement: "unknown",
    });
  for (const [id, name, english, region, description] of [
    [
      "weatheria",
      "Везерия",
      "Weatheria",
      "paradise",
      "Движущийся небесный остров учёных-погодоведов, где тренировалась Нами.",
    ],
    [
      "balloon-terminal",
      "Баллон-Терминал",
      "Ballon Terminal",
      "new-world",
      "Небесный терминал, на котором Урудж встретил Кайдо. Высотное место без фиксированной точки в этом атласе.",
    ],
  ] as const)
    add({
      id,
      name,
      english,
      region,
      description,
      kind: "sky",
      detail: 2,
      source: "manga",
      placement: "moving",
      reference: english,
      note: "OP Maps показывает условную позицию; её не превращаем в постоянные координаты движущегося небесного места.",
    });
  byId.get("winner")!.aliases = ["Winter Island", "Винтер", "Зимний остров"];
  byId.get("winner")!.note =
    "В референсе Winter Island и Winner Island занимают одну точку. В каталоге это одна запись, без двух наложенных меток.";
  byId.get("germa")!.reference = "Kingdom of Germa";
  for (const id of ["baltigo", "yukiryu"])
    byId.get(id)!.note =
      "Манга подтверждает Grand Line. Размещение именно в Новом мире здесь следует OP Maps и не выдается за подтверждённую половину маршрута.";
  byId.get("zou")!.reference = "Zou";
  const aliases: Record<string, string[]> = {
    alabasta: ["Kingdom of Alabasta", "Alabasta", "Arabasta", "Sandy Island"],
    organ: ["Organ Island"],
    torino: ["Kingdom of Turin", "Torino Kingdom"],
    cocoyasi: ["Villa Cocoyasi"],
    syrup: ["Villa Syrup"],
    "seducing-woods": ["Seducing Woods"],
  };
  for (const [id, names] of Object.entries(aliases)) {
    const p = byId.get(id);
    if (p) p.aliases = [...(p.aliases ?? []), ...names];
  }
  return places;
}
