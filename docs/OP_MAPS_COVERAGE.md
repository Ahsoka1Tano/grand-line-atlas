# Расширение атласа по OP Maps

Обновление 9 октября 2026. Исходный реестр: 67 мест; расширенный: 176. На карту нанесены 130 мест, 46 остаются в указателе без фиксированной точки. Новые игровые активности в этот этап не добавлялись.

Сверка [OP Maps](https://www.op-maps.com/en), версия 0.70.1, наблюдение 8 октября 2026: **84 островных маркера и 23 места интереса, все 107 учтены**. Исходные видимые имена и DOM-позиции записаны в [atlas-reference.json](../src/content/atlas-reference.json). Это координаты фанатской иллюстрации в одном неизменном viewport, не официальные широты или долготы.

## География и качество данных

- Дополнительные точки регистрируются в нашей проекции относительно существующих ориентиров. Они имеют placement=reference, собственный источник и отключаемый слой «Дополнения по OP Maps». Расстояния и берега иллюстративны.
- Тотто-Лэнд содержит 35 островов: Пирожный и 34 окружающих; 25 имеют позиции, остальные доступны в каталоге. Безымянные декоративные островки вокруг Whole Cake заменены именованными. Неподтверждённые позиции не сгенерированы случайно.
- [Milk Island исправлен на Cheese Island](https://onepiece.fandom.com/wiki/Cheese_Island), согласно разбору с указанием One Piece Magazine 5. Поиск старой подписи ведёт к Сырному острову. Winter Island и Winner Island в предоставленном референсе стоят в одной точке и объединены в одну запись.
- Виски-Пик теперь поселение на острове Кактус. Добавлены города Алабасты, регионы Вано, поселения Скайпии и Gray Terminal. Их локальные точки соответствуют нашей иллюстрации, а не точной канонической съёмке.
- Зоу и Джерма остаются движущимися местами без постоянной метки. Небесные Везерия и Баллон-Терминал также учтены без постоянной мировой точки. Для Балтиго и Юкирю отдельно указано, что положение именно в Новом мире следует фанатской карте: манга подтверждает Grand Line, а не такую точную привязку.
- Все три моря, ранее почти пустые, теперь имеют дополнительные острова по референсу. Названия и связи проверялись по [перечню мест](https://onepiece.fandom.com/wiki/List_of_Locations), [North Blue](https://onepiece.fandom.com/wiki/North_Blue), [Totto Land](https://onepiece.fandom.com/wiki/Totto_Land) и [официальной истории Вано](https://one-piece.com/story/land_of_wano2/index.html).

## Интерфейс и иллюстрации

Превью: [Тотто-Лэнд](preview-totto-land.png). Онигасима дополнительно привязана относительно Вано по референсу: старая условная точка накладывалась на Эггхед. Размеры иллюстраций в плотных участках уменьшены без смещения географических меток.

При плотном размещении названия уступают место интерактивным меткам. Наведение или клавиатурный фокус показывает имя; выбранное место всегда получает полную подпись. Все места сохраняют кнопки и доступны через поиск. Выбор архипелага открывает его подробную область и список островов.

Добавлены два новых арта: Пирожный остров до разрушения Whole Cake Chateau и Эггхед до атаки. Генерация встроенным imagegen, transparent_background=true; оригиналы [whole-cake-vignette.png](../assets/source-world/atlas/whole-cake-vignette.png) и [egghead-vignette.png](../assets/source-world/atlas/egghead-vignette.png), браузерные версии в public/world/atlas. Оба результата просмотрены; альфа подтверждена, выполнено только WebP-кодирование и изменение размера. **Точные промпты и режим:** [expansion-art.json](../public/world/atlas/expansion-art.json).

## Проверка

Production-сборка и TypeScript проходят; 20 тестов проходят, включая 10 проверок атласа. Новые проверки контролируют покрытие всех 107 записей референса, 35 уникальных островов Тотто-Лэнда, исправленные алиасы, отключение зависимых точек и приоритет выбранной подписи.

## Полная сверка референса

chart — опубликованная карта; route — схема маршрута; local — локальная иллюстративная точка; reference — фанатская реконструкция; moving — без постоянной мировой точки.

| Имя в OP Maps        | Место в нашем атласе             | ID               | Размещение |
| -------------------- | -------------------------------- | ---------------- | ---------- |
| Upper Yard           | Верхний двор                     | upper-yard       | local      |
| Flavor               | Остров Флейвор                   | flavor           | reference  |
| Wano Country         | Страна Вано                      | wano             | route      |
| Weatheria            | Везерия                          | weatheria        | moving     |
| 100% Island          | Остров 100%                      | hundred-percent  | reference  |
| Kingdom of Alabasta  | Алабаста                         | alabasta         | route      |
| Angel Island         | Ангельский остров                | angel-island     | local      |
| Ballon Terminal      | Баллон-Терминал                  | balloon-terminal | moving     |
| Ballywood Kingdom    | Королевство Балливуд             | ballywood        | reference  |
| Baltigo              | Балтиго                          | baltigo          | reference  |
| Banaro Island        | Остров Банаро                    | banaro           | reference  |
| Baratie              | Барати                           | baratie          | chart      |
| Biscuits             | Бисквитный остров                | biscuits         | reference  |
| Boin Archipelago     | Архипелаг Боин                   | boin             | reference  |
| G-14                 | База G-14                        | g-14             | reference  |
| Kingdom of Briss     | Королевство Брисс                | briss            | reference  |
| Cacao                | Какао                            | cacao            | route      |
| Cactus Island        | Остров Кактус                    | cactus           | route      |
| Candy                | Конфетный остров                 | candy            | reference  |
| Cheese               | Сырный остров                    | cheese           | reference  |
| Conomi Islands       | Острова Кономи                   | conomi           | chart      |
| Deul Kingdom         | Королевство Деул                 | deul             | reference  |
| Drum Island          | Остров Драм                      | drum             | route      |
| Egghead              | Эггхед                           | egghead          | reference  |
| Whole Cake Island    | Пирожный остров                  | whole-cake       | route      |
| Elbaf                | Эльбаф                           | elbaf            | reference  |
| Foodvalten Island    | Фудвалтен                        | foodvalten       | reference  |
| Foolshout Island     | Фулшаут                          | foolshout        | reference  |
| Winner Island        | Остров Виннер                    | winner           | reference  |
| Funwari              | Остров Фунвари                   | funwari          | reference  |
| Gecko Islands        | Острова Гекко                    | gecko            | chart      |
| Kingdom of Germa     | Королевство Джерма               | germa            | moving     |
| God Valley           | Год-Валли                        | god-valley       | reference  |
| Hachinosu            | Хатиносу                         | hachinosu        | reference  |
| Hidden Cloud Village | Скрытая облачная деревня         | hidden-cloud     | local      |
| Ice                  | Ледяной остров                   | ice              | reference  |
| Rare Animal Island   | Остров редких животных           | rare-animals     | reference  |
| Jam                  | Джемовый остров                  | jam              | reference  |
| Jaya                 | Джая                             | jaya             | route      |
| Jelly                | Желейный остров                  | jelly            | reference  |
| Karai Bari Island    | Остров Карай-Бари                | karai-bari       | reference  |
| Kenzan Island        | Остров Кэндзан                   | kenzan           | reference  |
| Kibo                 | Остров Кибо                      | kibo             | reference  |
| Kimi                 | Остров Кими                      | kimi             | reference  |
| Kinko                | Остров Кинко                     | kinko            | reference  |
| Nuts                 | Ореховый остров                  | nuts             | reference  |
| Kyuka Island         | Остров Кьюка                     | kyuka            | reference  |
| Liqueur              | Ликёрный остров                  | liqueur          | reference  |
| Little Garden        | Литтл-Гарден                     | little-garden    | route      |
| Lodestar Island      | Лодстар                          | lodestar         | reference  |
| Long Ring Long Land  | Лонг-Ринг-Лонг-Лэнд              | long-ring        | route      |
| Kingdom of Lvneel    | Львнил                           | lvneel           | reference  |
| Margarine            | Маргариновый остров              | margarine        | reference  |
| Milenge              | Остров Миленге                   | milenge          | reference  |
| Milk                 | Сырный остров                    | cheese           | reference  |
| Ohara                | Охара                            | ohara            | reference  |
| Minion Island        | Остров Минион                    | minion           | reference  |
| Mirror Ball Island   | Миррор-Болл                      | mirror-ball      | reference  |
| Namakura Island      | Остров Намакура                  | namakura         | reference  |
| Nanimonai Island     | Остров Нанимонаи                 | nanimonai        | reference  |
| Noko                 | Остров Ноко                      | noko             | reference  |
| Onigashima           | Онигасима                        | onigashima       | reference  |
| Organ Island         | Острова Орган                    | organ            | chart      |
| Kingdom of Oykot     | Королевство Ойкот                | oikot            | reference  |
| Package              | Остров Пэкедж                    | package          | reference  |
| Polestar Islands     | Остров Полстар                   | polestar         | chart      |
| Poripori             | Остров Порипори                  | poripori         | reference  |
| Potato               | Картофельный остров              | potato           | reference  |
| Pucci Island         | Пуччи                            | pucci            | reference  |
| Renaisse             | Ренесс                           | renaisse         | reference  |
| Reverse Mountain     | Реверс-Маунтин                   | reverse-mountain | route      |
| Rokumitsu            | Остров Рокумицу                  | rokumitsu        | reference  |
| Winter Island        | Остров Виннер                    | winner           | reference  |
| Yakigashi            | Остров Якигаси                   | yakigashi        | reference  |
| San Faldo            | Сан-Фальдо                       | san-faldo        | reference  |
| Shift Station        | Шифт-Стейшн                      | shift-station    | reference  |
| Skypiea              | Скайпия                          | skypiea          | route      |
| Sphinx Island        | Остров Сфинкс                    | sphinx           | reference  |
| St Poplar            | Сент-Поплар                      | st-poplar        | reference  |
| Kingdom of Turin     | Торино                           | torino           | reference  |
| Toroa Island         | Остров Тороа                     | toroa            | reference  |
| Ukkari Island        | Остров горячих источников Уккари | ukkari           | reference  |
| Yukiryu Island       | Остров Юкирю                     | yukiryu          | reference  |
| Zou                  | Зоу                              | zou              | moving     |
| Udon                 | Удон                             | udon             | local      |
| Alubarna             | Алубарна                         | alubarna         | local      |
| Arlong Park          | Арлонг-парк                      | arlong-park      | local      |
| Villa Cocoyasi       | Деревня Кокояси                  | cocoyasi         | local      |
| Elumalu              | Эрумалу                          | erumalu          | local      |
| Villa Gosa           | Деревня Госа                     | gosa             | local      |
| Hakumai              | Хакумай                          | hakumai          | local      |
| Harahettania         | Харахэттания                     | harahettania     | local      |
| Kibi                 | Киби                             | kibi             | local      |
| Kuri                 | Кури                             | kuri             | local      |
| Loguetown            | Логтаун                          | loguetown        | local      |
| Mock Town            | Мок-таун                         | mock-town        | local      |
| Nanohana             | Нанохана                         | nanohana         | local      |
| Notice Town          | Нотис                            | notice           | reference  |
| Orange Town          | Орандж-таун                      | orange-town      | local      |
| Rainbase             | Рейнбейс                         | rainbase         | local      |
| Rakesh               | Ракэш                            | rakesh           | reference  |
| Ringo                | Ринго                            | ringo            | local      |
| Alluring Forest      | Соблазняющий лес                 | seducing-woods   | local      |
| Sweet City           | Сладкий город                    | sweet-city       | local      |
| Villa Syrup          | Деревня Сироп                    | syrup            | local      |
| Tamarisk             | Тамариск                         | tamarisk         | local      |
| Twin Cape            | Мыс Близнецов                    | twin-cape        | route      |
