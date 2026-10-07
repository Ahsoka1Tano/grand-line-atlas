# Stage A — арт и визуальное направление

Три иллюстрации созданы встроенным image_gen 7 октября 2026 года. Они проверены визуально и интегрированы в прототип; окончательное художественное одобрение остаётся за владельцем проекта.

## Файлы

| Персонаж | Исходник | Оптимизированный арт |
| --- | --- | --- |
| Луффи | assets/source-art/luffy.png | public/art/luffy.webp |
| Зоро | assets/source-art/zoro.png | public/art/zoro.webp |
| Нами | assets/source-art/nami.png | public/art/nami.webp |

Мастера — 1024×1536 PNG, версии для интерфейса — 900×1350 WebP. Надписи, рамки и фольга рисуются в UI отдельно от иллюстраций.

## Проверка персонажей

- Луффи: соломенная шляпа с красной лентой, чёрные волосы, улыбка, шрам под левым глазом, красная жилетка; отсутствуют поздние трансформации и шрам на груди.
- Зоро: зелёные волосы, оба глаза открыты, три серьги в левом ухе, три меча, зелёный пояс. В текущем арте есть пуговицы на белой рубашке, а бандана находится у пояса — эти отклонения от исходного промпта можно уточнить при следующей художественной итерации.
- Нами: короткие оранжевые волосы, полосатый верх, свиток карты и цитрусовое окружение. Использован ранний образ.

## Общий язык

Морской фон, тёплый свет, отчётливые контуры и единая плотность детализации. Интерфейс сдержанный: глубокий синий, латунное золото, крупные иллюстрации. Редкость различается цветом рамки, обозначением и характером блика: C — серебристая, R — голубая, SR — призматическая, SSR — золотая.

Шесть изданий в демо используют три исходных арта. Различия изданий демонстрируют оформление редкости; дополнительные уникальные арты пока не создавались.

## Точные промпты

### Луффи

```text
Use case: illustration-story. Asset type: finished collectible card character illustration for a premium One Piece fan game. Portrait 2:3 composition, character fully recognizable as the actual One Piece anime character, expressive original anime proportions, crisp ink linework, exquisite cel shading, subtle painted cinematic environment, rich deep navy and warm golden light, high-end anime key visual. Show head and torso with sufficient margin around head, keep important character details within center 80%. No typography, no frame, no card UI, no watermarks, no logos. One character only. Subject: Monkey D. Luffy, early East Blue era. Messy black hair, small stitched scar directly below his LEFT eye, unmistakable broad cheerful toothy grin, straw hat with red hatband on his head, open red sleeveless vest, blue shorts. No chest X scar, no gear transformations. Three-quarter lively waist-up view, his right hand touching the hat brim, anatomically coherent five fingers. Background: sunset over the ocean and a hint of a wooden pirate ship rigging, vivid red and gold against turquoise ocean, dynamic but clean silhouette. Authentic Luffy facial design.
```

### Зоро

```text
Use case: illustration-story. Asset type: finished collectible card character illustration for a premium One Piece fan game. Portrait 2:3 composition, character fully recognizable as the actual One Piece anime character, expressive original anime proportions, crisp ink linework, exquisite cel shading, subtle painted cinematic environment, rich deep navy and warm golden light, high-end anime key visual. Show head and torso with sufficient margin around head, keep important character details within center 80%. No typography, no frame, no card UI, no watermarks, no logos. One character only. Subject: Roronoa Zoro, early East Blue era. Short spiky green hair, BOTH eyes open, no eye scar, three small gold earrings on his LEFT ear, serious confident expression, fitted white short-sleeved crewneck shirt, green haramaki waist sash, black trousers, dark bandana tied around his upper arm. Three swords with distinct hilts sheathed at his waist; hand resting naturally on a sword hilt, do not put swords in his mouth. Waist-up three-quarter portrait. Background: emerald sea mist and atmospheric timber deck with sharp directional sunlight, restrained green and jade palette. Authentic Zoro facial design, heroic restrained intensity.
```

### Нами

```text
Use case: illustration-story. Asset type: finished collectible card character illustration for a premium One Piece fan game. Portrait 2:3 composition, character fully recognizable as the actual One Piece anime character, expressive original anime proportions, crisp ink linework, exquisite cel shading, subtle painted cinematic environment, rich deep navy and warm golden light, high-end anime key visual. Show head and torso with sufficient margin around head, keep important character details within center 80%. No typography, no frame, no card UI, no watermarks, no logos. One character only. Subject: Nami, adult woman age 18, early East Blue era. Short orange bob hair above shoulders, unmistakable anime Nami face, brown eyes, confident clever warm smile, sleeveless blue-and-white horizontally striped top, orange skirt glimpsed at the bottom, log-style leather wrist accessory, no long post-timeskip hair, no bikini. Waist-up three-quarter portrait, holding a rolled nautical chart naturally, coherent hands. Background: sunlit citrus grove meeting a turquoise sea, airy golden light, orange and teal palette. Authentic original Nami proportions without exaggeration, adventure-focused portrait.
```
