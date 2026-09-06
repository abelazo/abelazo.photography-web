---
title: Galería de prueba
description: Galería de prueba para la suite de tests E2E — no es contenido real del estudio.
date: 2020-06-15
location: Estudio, Tres Cantos
tags:
  - prueba
  - e2e
  - fixture
featured: true
draft: true
order: 5
cover: ../../assets/galleries/test-gallery/01-frame.jpg
i18n:
  en:
    title: Test gallery
    description: Fixture gallery for the E2E test suite — not real studio content.
photos:
  - src: ../../assets/galleries/test-gallery/01-frame.jpg
    alt: Fotograma de prueba número uno, un degradado apaisado gris azulado.
    title: Fotograma uno
  - src: ../../assets/galleries/test-gallery/02-frame.jpg
    alt: Fotograma de prueba número dos, un degradado vertical gris azulado.
    title: Fotograma dos
  - src: ../../assets/galleries/test-gallery/03-frame.jpg
    alt: Fotograma de prueba número tres, un degradado cuadrado gris azulado.
  - src: ../../assets/galleries/test-gallery/04-frame.jpg
    alt: Fotograma de prueba número cuatro, un degradado apaisado gris azulado.
  - src: ../../assets/galleries/test-gallery/05-frame.jpg
    alt: Fotograma de prueba número cinco, un degradado vertical gris azulado.
  - src: ../../assets/galleries/test-gallery/06-frame.jpg
    alt: Fotograma de prueba número seis, un degradado apaisado gris azulado.
  - src: ../../assets/galleries/test-gallery/07-frame.jpg
    alt: Fotograma de prueba número siete, un degradado vertical gris azulado.
  - src: ../../assets/galleries/test-gallery/08-frame.jpg
    alt: Fotograma de prueba número ocho, un degradado apaisado gris azulado.
  - src: ../../assets/galleries/test-gallery/09-frame.jpg
    alt: Fotograma de prueba número nueve, un degradado apaisado gris azulado en alta resolución.
---

Galería de prueba usada por la suite de Playwright (`e2e/`). Es `draft: true`, así
que solo aparece en `astro dev` — nunca en un build de producción ni en el
sitemap. Si cambias el número de fotos, su orden o sus títulos, actualiza los
tests que dependen de ello. Regenera las imágenes con
`node scripts/gen-test-gallery.mjs`.
