/**
 * All user-facing copy, keyed by locale.
 *
 * The site is bilingual (Spanish default, English under `/en/`). Components read
 * one locale's tree — `const c = t(lang)` — rather than looking up dotted keys.
 *
 * `es` is the source of truth: its shape is captured as `UiTree` and `en` is
 * `satisfies UiTree`, so a missing or misspelt English key fails `pnpm check`
 * rather than rendering `undefined`. Keep both trees structurally identical.
 *
 * Gallery titles/descriptions are *not* here — they live in each gallery's
 * frontmatter (`src/content/galleries/*.md`), with an optional `i18n.en`
 * override. See `localizedGallery` in `src/lib/galleries.ts`.
 */

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

/**
 * Every locale, in the order the language switcher lists them. The single
 * source of truth for "which locales exist" — `astro.config.mjs` and
 * `src/i18n/utils.ts` both derive their locale list from here.
 */
export const locales = Object.keys(languages) as Lang[];

/**
 * Flag emoji per locale, shown (in place of the locale code) in the language
 * switcher. UK flag for English — the site's English is British (`en_GB`).
 * Decorative: the switcher keeps a visually-hidden `languages[code]` label.
 */
export const localeFlags: Record<Lang, string> = { es: '🇪🇸', en: '🇬🇧' };

/** Shown in the masthead, footer and metadata. Same in every locale. */
export const siteName = 'Abelazo Photography';

/** Contact address — the only booking channel for now (mailto). */
export const contactEmail = 'contact@abelazo.photography';

const es = {
  htmlLang: 'es',
  tagline: 'Fotógrafo en Tres Cantos',
  metaDescription:
    'Fotógrafo en Tres Cantos. Sesiones personales, profesionales, de moda y editoriales para gente que quiere fotografías profesionales — hayas posado antes o no.',
  skipToContent: 'Saltar al contenido',

  nav: {
    session: 'La sesión',
    galleries: 'Galerías',
    contact: 'Contacto',
    menu: 'Menú',
    language: 'Idioma',
    primary: 'Principal',
  },

  cta: {
    book: 'Reserva tu sesión',
    email: 'Escríbeme',
    write: 'Escríbeme un correo',
  },

  home: {
    hero: {
      motto: 'Todo el mundo se merece tener fotografías profesionales',
      lead: 'Sobre todo para quien nunca se ha puesto delante de una cámara.',
      note: 'Soy fotógrafo especializado en personas con poca o ninguna experiencia delante de una cámara. Sesiones personales, profesionales, de moda y editoriales — yo te guío en todo.',
    },
  },

  session: {
    title: 'La sesión',
    lead: 'Cómo trabajo, qué incluye una sesión y los tipos de sesión que hay.',
    metaDescription:
      'Cómo es una sesión de fotos en el estudio de Tres Cantos: para quién es, qué incluye y tipos de sesión.',

    forWho: {
      kicker: 'Para quién es',
      title: 'Sobre todo para quien nunca se ha puesto delante de una cámara',
      body: [
        'No hace falta ser modelo ni sentirse fotogénico. La mayoría de las personas que vienen al estudio no han hecho una sesión en su vida y salen sorprendidas de verse bien. Estoy convencido de que todo el mundo tiene algo especial que fotografiar, y me encanta encontrarlo y sacarle el máximo partido.',
        'Marca personal, LinkedIn, un book, fotos para un momento importante o simplemente el gusto de tener buenos retratos: si quieres fotografías profesionales, este es tu sitio.',
      ],
    },

    goals: {
      kicker: 'Objetivos',
      title: 'Cada sesión tiene tres objetivos',
      items: [
        {
          title: 'Que lo pases bien',
          body: 'Que la sesión sea un espacio seguro para ti: un rato cómodo y divertido en el que te sientas a gusto en el estudio y contigo.',
        },
        {
          title: 'Que te lleves alguna foto que te guste',
          body: 'Al menos una imagen que te encante de verdad, de las que te apetece enseñar.',
        },
        {
          title: 'Que aprendamos algo nuevo',
          body: 'Tú, sobre cómo te ves delante de la cámara; yo, sobre cómo fotografiarte. Cada sesión nos enseña algo a los dos.',
        },
      ],
    },

    includes: {
      kicker: 'Qué incluye',
      title: 'Qué incluye una sesión',
      items: [
        {
          title: 'Entrevista previa y asesoría de estilismo',
          body: 'Antes de la sesión hablamos de la imagen que quieres transmitir y te ayudo a elegir el vestuario.',
        },
        {
          title: 'Dirección de poses durante toda la sesión',
          body: 'No tienes que saber posar. Te voy guiando gesto a gesto para que salgas natural.',
        },
        {
          title: 'Varios fondos y esquemas de luz',
          body: 'Planificamos cada look con un fondo y una luz que le vayan bien, para que el conjunto tenga coherencia.',
        },
        {
          title: 'Revisamos las fotos juntos al terminar',
          body: 'Al acabar vemos el resultado en pantalla y eliges tranquilamente las que más te gustan.',
        },
        {
          title: 'Retoque profesional de las imágenes elegidas',
          body: 'Las fotos que eliges se entregan editadas, en alta resolución y listas para usar.',
        },
      ],
    },

    types: {
      kicker: 'Estilos',
      title: 'Tipos de sesión',
      lead: 'Cuatro formas de trabajar en el estudio. Las galerías de ejemplo son provisionales.',
      items: {
        personal: {
          title: 'Personal',
          body: 'Retratos para ti: un regalo, un momento que celebrar o el simple gusto de verte bien.',
        },
        profesional: {
          title: 'Profesional',
          body: 'Marca personal, headshots y fotos de equipo que transmiten presencia y confianza.',
        },
        moda: {
          title: 'Moda',
          body: 'Looks, estilismo y luz de revista para un book o para tu proyecto.',
        },
        editorial: {
          title: 'Editorial',
          body: 'Series con una idea detrás, para publicaciones, marcas o trabajo de autor.',
        },
      },
    },

    cta: {
      title: '¿Lo hablamos?',
      body: 'Cuéntame qué tipo de sesión te interesa y para cuándo. Te respondo con disponibilidad y precios.',
    },
  },

  galleries: {
    title: 'Galerías',
    lead: 'Trabajo reciente por estilo. Ejemplos provisionales hasta subir las series reales.',
    empty: 'Pronto habrá galerías aquí.',
    photos: (n: number) => `${n} foto${n === 1 ? '' : 's'}`,
  },

  contact: {
    title: 'Contacto',
    lead: 'De momento la forma de reservar es por correo. Escríbeme contándome qué tipo de sesión te interesa, para cuándo y cualquier duda que tengas — te respondo con disponibilidad y precios.',
    emailLabel: 'Correo',
    responseNote: 'Suelo responder en uno o dos días.',
  },

  gallery: {
    back: '← Galerías',
    photos: (n: number) => `${n} foto${n === 1 ? '' : 's'}`,
    draftNotice: 'Galería en preparación — imágenes provisionales.',
    // Screen-reader labels for the metadata list on a gallery detail page.
    meta: {
      date: 'Fecha',
      location: 'Localización',
      tags: 'Etiquetas',
    },
  },

  footer: {
    location: 'Tres Cantos, Madrid',
    rights: (year: number) => `© ${year} ${siteName}`,
  },
};

/** The shape every locale tree must have. `es` is the reference. */
export type UiTree = typeof es;

const en = {
  htmlLang: 'en',
  tagline: 'Photographer in Tres Cantos',
  metaDescription:
    "Photographer in Tres Cantos, near Madrid. Personal, professional, fashion and editorial sessions for people who want professional photographs — whether or not you've ever posed before.",
  skipToContent: 'Skip to content',

  nav: {
    session: 'The session',
    galleries: 'Galleries',
    contact: 'Contact',
    menu: 'Menu',
    language: 'Language',
    primary: 'Primary',
  },

  cta: {
    book: 'Book your session',
    email: 'Email me',
    write: 'Send me an email',
  },

  home: {
    hero: {
      motto: 'Everyone deserves professional photographs',
      lead: "Above all for people who've never been in front of a camera.",
      note: "I'm a photographer who specialises in people with little or no experience in front of a camera. Personal, professional, fashion and editorial sessions — I guide you the whole way.",
    },
  },

  session: {
    title: 'The session',
    lead: 'How I work, what a session includes, and the types of session available.',
    metaDescription:
      "What a photo session at the Tres Cantos studio is like: who it's for, what it includes and types of session.",

    forWho: {
      kicker: "Who it's for",
      title: "Above all for people who've never been in front of a camera",
      body: [
        "You don't need to be a model or feel photogenic. Most people who come to the studio have never done a session in their life and leave surprised at how well they look. I truly believe everyone has something special worth photographing, and I love finding it and making the most of it.",
        'Personal branding, LinkedIn, a portfolio, photos for an important moment, or simply the pleasure of having good portraits: if you want professional photographs, this is the place.',
      ],
    },

    goals: {
      kicker: 'Goals',
      title: 'Every session has three goals',
      items: [
        {
          title: 'That you enjoy it',
          body: 'That the session is a safe space for you: a comfortable, fun time where you feel at ease in the studio and with yourself.',
        },
        {
          title: 'That you leave with a photo you love',
          body: 'At least one image you genuinely like — the kind you want to show people.',
        },
        {
          title: 'That we both learn something new',
          body: 'You, about how you come across on camera; me, about how to photograph you. Every session teaches us both something.',
        },
      ],
    },

    includes: {
      kicker: 'What it includes',
      title: 'What a session includes',
      items: [
        {
          title: 'Pre-session call and styling advice',
          body: 'Before the session we talk about the image you want to convey and I help you choose what to wear.',
        },
        {
          title: 'Posing direction throughout the session',
          body: "You don't need to know how to pose. I guide you move by move so you come out natural.",
        },
        {
          title: 'Several backdrops and lighting setups',
          body: 'We plan each look with a backdrop and light that suit it, so the whole set holds together.',
        },
        {
          title: 'We review the photos together at the end',
          body: 'When we finish we look at the results on screen and you calmly pick the ones you like most.',
        },
        {
          title: 'Professional retouching of the chosen images',
          body: 'The photos you choose are delivered edited, in high resolution and ready to use.',
        },
      ],
    },

    types: {
      kicker: 'Styles',
      title: 'Types of session',
      lead: 'Four ways of working in the studio. The sample galleries are placeholders for now.',
      items: {
        personal: {
          title: 'Personal',
          body: 'Portraits for you: a gift, a moment worth marking, or simply the pleasure of looking good.',
        },
        profesional: {
          title: 'Professional',
          body: 'Personal branding, headshots and team photos that convey presence and confidence.',
        },
        moda: {
          title: 'Fashion',
          body: 'Looks, styling and magazine light for a portfolio or for your own project.',
        },
        editorial: {
          title: 'Editorial',
          body: 'Series built around an idea, for publications, brands or personal work.',
        },
      },
    },

    cta: {
      title: 'Shall we talk?',
      body: "Tell me what kind of session you're interested in and roughly when. I'll reply with availability and pricing.",
    },
  },

  galleries: {
    title: 'Galleries',
    lead: 'Recent work by style. Placeholders until the real series are uploaded.',
    empty: 'Galleries are coming soon.',
    photos: (n: number) => `${n} photo${n === 1 ? '' : 's'}`,
  },

  contact: {
    title: 'Contact',
    lead: "For now, booking is by email. Write to me with the kind of session you're interested in, roughly when, and any questions — I'll reply with availability and pricing.",
    emailLabel: 'Email',
    responseNote: 'I usually reply within a day or two.',
  },

  gallery: {
    back: '← Galleries',
    photos: (n: number) => `${n} photo${n === 1 ? '' : 's'}`,
    draftNotice: 'Gallery in progress — placeholder images.',
    // Screen-reader labels for the metadata list on a gallery detail page.
    meta: {
      date: 'Date',
      location: 'Location',
      tags: 'Tags',
    },
  },

  footer: {
    location: 'Tres Cantos, Madrid',
    rights: (year: number) => `© ${year} ${siteName}`,
  },
} satisfies UiTree;

/** Every locale's copy tree. Read via `t(lang)` from `src/i18n/utils.ts`. */
export const ui: Record<Lang, UiTree> = { es, en };
