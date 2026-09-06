---
title: Galería de prueba mínima
description: Segunda galería de prueba para E2E, sin campos opcionales — solo lo obligatorio.
date: 2019-03-04
featured: false
draft: true
order: 6
cover: ../../assets/galleries/test-gallery/04-frame.jpg
i18n:
  en:
    title: Minimal test gallery
    description: Second E2E fixture gallery with no optional fields — required frontmatter only.
photos:
  - src: ../../assets/galleries/test-gallery/04-frame.jpg
    alt: Fotograma de prueba apaisado gris azulado, galería mínima.
  - src: ../../assets/galleries/test-gallery/05-frame.jpg
    alt: Fotograma de prueba vertical gris azulado, galería mínima.
---

Galería de prueba `draft: true` sin `location`, `tags` ni títulos por foto —
cubre el camino "campo opcional ausente" de la suite E2E. Comparte las imágenes
de `test-gallery`. Solo visible en `astro dev`.
