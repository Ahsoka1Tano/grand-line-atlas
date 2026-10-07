# Анимированный атлас мира

Дата: 7 октября 2026. Визуальное направление уточнено по предоставленному пользователем референсу: морской атлас на пергаменте, географические контуры, подписи и отдельные анимированные детали.

## Общий вид

Карта открывается как обзор мира: North Blue, East Blue, West Blue, South Blue; Red Line; Grand Line с New World и Paradise; полосы Calm Belt и Reverse Mountain. Острова обозначены контурами с внутренними линиями рельефа. Названия, розы ветров, картуш и шкала рисуются в SVG.

Это авторская схема мира по мотивам One Piece. Расположение и масштабы отдельных островов условны; шкала декоративная, без заявления реальных морских расстояний.

## Устройство

- География: src/features/world/atlas-chart.tsx. Векторные кривые сохраняют чёткость при зуме; контуры сглаживаются и имеют небольшие детерминированные вариации.
- Пергамент: public/world/atlas-parchment.webp, мастер assets/source-world/atlas-parchment.png.
- Линии течений анимируются через CSS, два гравированных корабля — через SVG animateMotion. Мельница на Dawn Island вращается.
- Кнопки «Весь мир» и «East Blue» переключают обзор и приближение к региону. Название East Blue на карте также интерактивно.
- Геометрия региона и игровых портов обновлена под атлас 2400×1600. Камера умеет фокусироваться на ограничивающем прямоугольнике региона; максимальный zoom — 600%.
- В East Blue сохранены пять игровых точек, морские маршруты, плавание с отменой, панель берега, журнал и вход в локацию.
- Панорамы остаются отдельными сценами локаций. Предыдущий изометрический арт east-blue.webp сохранён как исходный материал, но в атласе не используется.
- Идентификаторы посещений сохраняются, поэтому журнал не требует миграции после изменения координат.

## Проверка

Production-сборка и TypeScript проходят. Проверены 25 пар маршрутов, пределы зума и сохранение точки под указателем. В браузере проверены общий обзор, переход к East Blue, пять активных меток, плавание, возврат к обзору и управление камерой. Мобильная компоновка проверена на 390×844, desktop — на 1440×900.

Декоративные анимации учитывают prefers-reduced-motion: корабли становятся статичными, CSS-анимации отключаются. Проверка этой ветки выполнена по коду; физическое сенсорное устройство и измерения FPS пока не использовались.

## Генерация пергамента

Текстура создана встроенным image_gen и сохранена в проект. PNG — 1536×1024; WebP — около 277 KB. География, буквы, метки и движение создаются кодом.

Точный промпт:

```text
Use case: stylized-concept. Asset type: seamless-looking background parchment texture for an interactive antique nautical atlas. Create a flat, directly overhead, full-bleed landscape 3:2 sheet of premium old cartographer's parchment, warm pale honey ivory center, softly mottled natural paper fibers and subtle foxing, restrained cinnamon and russet weathering toward the very edges, lovely sophisticated hand-made paper texture, bright enough to print crisp dark brown ink lines over. The center should be pale cream rather than dark orange, avoid distracting grunge. Completely flat lighting, no perspective, no curled corners, no table or surrounding objects. Absolutely NO map, NO geography, NO symbols, NO text, NO letters, NO coastlines, NO islands, NO compass, NO drawings, NO watermark. Only the elegant softly weathered parchment material. This texture will sit behind code-rendered animated vector geography and nautical lettering.
```
