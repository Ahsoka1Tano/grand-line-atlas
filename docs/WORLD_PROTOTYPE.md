# Прототип карты East Blue

> Актуальная версия карты — векторный анимированный атлас мира. См. [ATLAS_DIRECTION.md](ATLAS_DIRECTION.md). Ниже сохранена документация первого прототипа и промпты панорам; его изометрический фон больше не используется в основной карте.

Дата: 7 октября 2026. Самостоятельный визуальный этап до подключения аккаунтов и боёв.

## Что реализовано

- Отдельная страница /world и работающий пункт навигации «Карта мира».
- Пять локаций: деревня Фуша, Шеллз-таун, Орандж-таун, Барати, Арлонг-парк.
- Перемещение карты, zoom с сохранением точки под указателем, пределы масштаба, возврат к обзору.
- Колесо, кнопки, клавиатура и pointer-события; pinch реализован для двух касаний.
- Панель острова, шесть морских связей, выбор маршрута, корабль, прогресс плавания и отмена.
- Вход в текущую локацию: панорама, атмосферное описание, три точки интереса с переключением.
- Журнал посещений; текущий причал и посещённые места сохраняются локально. Наград и валюты нет.

## Устройство

Карта — самостоятельный модуль src/features/world. Данные островов и связей находятся в src/content/world.ts. Контроллер камеры, алгоритм маршрутов и UI разделены.

На этом этапе используется оптимизированный растровый арт, SVG-маршруты и HTML-метки. Такая сцена с пятью узлами не требует игрового движка. Её данные и интерфейсы можно сохранить при переходе к PixiJS, если понадобятся сложные сцены, много объектов и графические эффекты.

Маршрут выбирается по графу с положительными весами морских связей; веса основаны на расстоянии между портами в координатах рисунка. Это геометрия игрового прототипа, не реальные морские расстояния. Корабль следует квадратичным кривым SVG через requestAnimationFrame. В reduced-motion режиме плавание сразу завершается. При отмене корабль возвращается к исходному причалу, посещение назначения не записывается. При уходе с экрана незавершённая анимация прекращается.

Кнопки и список локаций остаются обычным доступным HTML. Стрелки двигают карту, + и - меняют масштаб, Home возвращает обзор. При отсутствии localStorage путешествие работает в памяти текущего сеанса. При перезагрузке во время плавания восстанавливается последний причал; незавершённый путь не считается прибытием.

География и панорамы — авторские иллюстрации по мотивам East Blue. Они не заявляются точной реконструкцией расположения островов и архитектуры канона.

## Арты

Все шесть изображений созданы встроенным image_gen, визуально проверены и сохранены в проект. Надписи, метки, маршруты и корабль добавляются интерфейсом.

| Арт         | PNG-мастер                          | Версия для интерфейса         |
| ----------- | ----------------------------------- | ----------------------------- |
| east-blue   | assets/source-world/east-blue.png   | public/world/east-blue.webp   |
| foosha      | assets/source-world/foosha.png      | public/world/foosha.webp      |
| shells-town | assets/source-world/shells-town.png | public/world/shells-town.webp |
| orange-town | assets/source-world/orange-town.png | public/world/orange-town.webp |
| baratie     | assets/source-world/baratie.png     | public/world/baratie.webp     |
| arlong-park | assets/source-world/arlong-park.png | public/world/arlong-park.webp |

Карта: 1536×1024 PNG/WebP. Панорамы: мастера 1672×941, WebP 1400×788. Оптимизированная карта около 463 KB, панорамы 325–403 KB. Source PNG сохраняются без изменений.

## Проверки

- TypeScript и production-сборка.
- Все 25 пар локаций дают корректный маршрут; проверены прямой и составной курс, несуществующий узел, отсутствие циклов и нечисловых координат.
- Камера: ограничения масштаба и сохранение мировой точки при zoom вокруг указателя.
- В браузере: выбор всех пяти локаций, zoom кнопками, колесо, перетаскивание, клавиатура и Home.
- Плавание Фуша → Барати: прибытие, доступ к панораме, запись в журнал.
- Барати → Арлонг-парк: отмена сохраняет прежний причал и не записывает посещение.
- Точки интереса переключаются; Escape закрывает локацию.
- Причал и журнал восстанавливаются после перезагрузки. Повторное посещение не дублирует запись.
- Журнал позволяет выбрать берег и начать демопутешествие заново.
- Desktop 1440×900, мобильная компоновка 390×844: карта, панель, журнал и локация без горизонтального переполнения.

Pinch реализован и проверен по коду; отдельная проверка на физическом сенсорном устройстве не выполнялась. Reduced-motion проверен по коду, без переключения системной настройки. FPS на физических устройствах пока не измерялся.

Скриншоты находятся в игнорируемой папке artifacts: world-desktop.png, world-mobile.png, world-location.png.

## Следующий шаг

Подключить первую активность к выбранной локации и команду к её результату. Дальнейшая серверная модель прогресса заменит локальный журнал прототипа.

## Точные промпты

### east-blue

```text
Use case: stylized-concept. Asset: background artwork for a premium interactive One Piece East Blue adventure map, an original fan-world interpretation. Wide landscape 3:2 atlas illustration, orthographic aerial/isometric hybrid, magnificent hand-painted anime game world map. Deep midnight navy and teal ocean, intricate hand-painted turquoise shore reefs, subtle ocean currents, lush green islands and warm ivory architecture, warm morning sunlight, refined fine ink details, premium console JRPG world-map polish, cohesive proportions and atmospheric depth. Exactly FIVE distinct main locations, with large empty ocean between them for route overlays: 1) lower LEFT around x=20%, y=73%: lush elongated tropical Dawn Island with a tiny peaceful red-roof coastal windmill village and forested hill; 2) upper LEFT around x=28%, y=27%: a separate craggy island with a white-and-blue naval fortress, towers, harbor and terraced seaside town; 3) CENTER around x=48%, y=50%: compact emerald island, orange/red roof seaside town, tiny colorful circus tent; 4) lower RIGHT around x=64%, y=77%: a single elaborate floating ship restaurant with a broad green multi-tier roof and fish-shaped prow, surrounded by water, not a land island; 5) upper RIGHT around x=79%, y=28%: a lush irregular island with orange groves, dramatic jagged rocks, a walled pagoda-like coastal palace and an enclosed pool. A few tiny uninhabited rocks and islets can embellish the sea, but do not add more main towns. Organic irregular coastlines, clear readable silhouettes. Full-bleed map fills the entire image, no outer parchment frame. NO text, NO labels, NO compass rose, NO UI, NO route lines, NO markers, NO character portraits, NO watermark. This is geography art behind HTML markers, therefore respect the five requested locations and approximate positions.
```

### foosha

```text
Use case: illustration-story. Asset: cinematic location panorama for a premium One Piece fan adventure interface. Wide landscape 16:9 environment artwork. Recognizable One Piece anime world atmosphere, crisp hand-painted anime background, refined ink outlines, beautiful cel-shaded architecture, richly detailed but readable environment, warm luminous sun and deep navy/teal shadows, exquisite immersive anime-film scenery. No text, no lettering, no logo, no UI, no watermark. No foreground characters. Original fan illustration of the location, not a screenshot. Foosha Village, Dawn Island, East Blue: a peaceful tropical port village viewed from across a small bay at golden morning light. Red-roof cream wooden houses, wooden quay, charming traditional windmill on a green hillside, distant lush mountains, moored fishing boats, calm turquoise sea, soft white clouds. A gentle starting-place feeling, windswept grass, atmospheric perspective, village itself prominent at center-left.
```

### shells-town

```text
Use case: illustration-story. Asset: cinematic location panorama for a premium One Piece fan adventure interface. Wide landscape 16:9 environment artwork. Recognizable One Piece anime world atmosphere, crisp hand-painted anime background, refined ink outlines, beautiful cel-shaded architecture, richly detailed but readable environment, warm luminous sun and deep navy/teal shadows, exquisite immersive anime-film scenery. No text, no lettering, no logo, no UI, no watermark. No foreground characters. Original fan illustration of the location, not a screenshot. Shells Town, East Blue: impressive coastal naval fortress above a sunlit bustling seaside town. White plaster fortress walls, square white towers with blue roofs, orderly harbor, stone coastal steps, terraced pastel buildings with blue roofs, jagged green island cliffs, clean turquoise sea. Naval authority and a sense of adventure, daytime grand establishing shot from harbor level.
```

### orange-town

```text
Use case: illustration-story. Asset: cinematic location panorama for a premium One Piece fan adventure interface. Wide landscape 16:9 environment artwork. Recognizable One Piece anime world atmosphere, crisp hand-painted anime background, refined ink outlines, beautiful cel-shaded architecture, richly detailed but readable environment, warm luminous sun and deep navy/teal shadows, exquisite immersive anime-film scenery. No text, no lettering, no logo, no UI, no watermark. No foreground characters. Original fan illustration of the location, not a screenshot. Orange Town, East Blue: quirky bright seaside pirate-adventure town with warm orange terracotta roofs and white timber walls, cobblestone lanes, colorful circus tent visible behind buildings, coastal wind, inviting harbor and emerald hills. A quiet town before a pirate encounter, cinematic sunlit elevated street view with ocean in the distance.
```

### baratie

```text
Use case: illustration-story. Asset: cinematic location panorama for a premium One Piece fan adventure interface. Wide landscape 16:9 environment artwork. Recognizable One Piece anime world atmosphere, crisp hand-painted anime background, refined ink outlines, beautiful cel-shaded architecture, richly detailed but readable environment, warm luminous sun and deep navy/teal shadows, exquisite immersive anime-film scenery. No text, no lettering, no logo, no UI, no watermark. No foreground characters. Original fan illustration of the location, not a screenshot. Baratie floating restaurant, East Blue: the iconic grand floating restaurant ship at sea, enormous elegant white and warm ivory restaurant structure with broad green tiered roofs mounted on a wooden seagoing hull, clearly readable fish-shaped figurehead and decorative fins at the prow, balconies, golden windows and restaurant decks, smaller boats moored alongside, expansive turquoise ocean, dramatic warm afternoon light. Wide cinematic three-quarter ship portrait, restaurant occupies the center with open sea around it.
```

### arlong-park

```text
Use case: illustration-story. Asset: cinematic location panorama for a premium One Piece fan adventure interface. Wide landscape 16:9 environment artwork. Recognizable One Piece anime world atmosphere, crisp hand-painted anime background, refined ink outlines, beautiful cel-shaded architecture, richly detailed but readable environment, warm luminous sun and deep navy/teal shadows, exquisite immersive anime-film scenery. No text, no lettering, no logo, no UI, no watermark. No foreground characters. Original fan illustration of the location, not a screenshot. Arlong Park, East Blue, original fan setting: a imposing walled coastal compound on a tropical island, a tall multi-tier pagoda-like palace with dark navy-blue roofs and white plaster, orange groves around the outer walls, rectangular sunlit water courtyard/pool opening toward the ocean, massive jagged coastal rocks and a stone gateway, turquoise surf, lush palms. Afternoon light, beautiful but slightly ominous atmosphere, cinematic establishing shot from coastal water.
```
