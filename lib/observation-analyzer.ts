import Fuse from 'fuse.js'
import { allItems } from '@/data/checklist-data'

export type ObservationMatch = {
  code: string
  matchedKeyword: string
}

type InspectionProcess = 'Montaje' | 'Final'

type ObservationAlias = {
  code: string
  phrases: string[]
}

const observationAliases: Record<InspectionProcess, ObservationAlias[]> = {
  Montaje: [
    {
      code: 'PE016',
      phrases: [
        'falta tuerca',
        'faltan guías de caja',
        'faltan defensas laterales',
        'falta defensa lateral',
        'falta pernos en soporte de tecle',
        'falta pernos',
        'falta perno',
        'falta graseras',
        'falta grasera',
        'falta guía de caja',
        'falta bandeja de contra llanta',
        'falta soporte de tanque de hidrolina',
        'falta soporte de placa y cámara',
      ],
    },
    {
      code: 'PE044',
      phrases: [
        'corregir fijación de correa de tanque hidráulico',
        'falta doblar pasador',
        'realizar inserción completa del pin de tijera',
        'gancho no sienta correctamente',
        'centrar brazos de mantenimiento',
      ],
    },
    { code: 'PE065', phrases: ['borde filudo de base para winche'] },
    { code: 'PE013', phrases: ['mejorar acabado de corte', 'esmerilar rebabas'] },
    { code: 'PE001', phrases: ['soldadura irregular', 'cordón de soldadura irregular'] },
    {
      code: 'PE031',
      phrases: ['porosidad en soldadura', 'porosidad', 'porosidad agrupada', 'poro en cráter'],
    },
    { code: 'PE025', phrases: ['falta de fusión'] },
    { code: 'PE051', phrases: ['nivel de aceite hidráulico por encima del punto medio'] },
    {
      code: 'PE012',
      phrases: ['desgastes irregular en material', 'daño de material', 'tapa de batería dañada'],
    },
    {
      code: 'PE076',
      phrases: ['falta regular m c c', 'ajustar graseras', 'ajustar grasera'],
    },
    {
      code: 'PE074',
      phrases: ['pernos sin ajustar', 'falta ajustar pernos'],
    },
    { code: 'PE043', phrases: ['tanque de aire suelto'] },
    {
      code: 'PE050',
      phrases: ['ee tt menciona anclaje articulados y fijos'],
    },
    { code: 'PE075', phrases: ['perno corto'] },
    { code: 'PE029', phrases: ['cráter de soldadura', 'cráter'] },
    { code: 'PE040', phrases: ['falta de limpieza mecánica'] },
    { code: 'PE005', phrases: ['punto de soldadura'] },
    { code: 'PE018', phrases: ['falta coronar'] },
    {
      code: 'PE008',
      phrases: [
        'soporte de válvula interlock deformado',
        'soporte de contrallanta deformado',
        'faldón deformado',
      ],
    },
    {
      code: 'PE061',
      phrases: [
        'luz en viga',
        'luz en viga LC',
        'luz en viga LP',
      ],
    },
    {
      code: 'PE009',
      phrases: ['tapa de caja de herramientas desalineada', 'paso de escalera desalineado'],
    },
    {
      code: 'PE042',
      phrases: ['bisagras de caja de herramientas no va acorde al plano'],
    },
    { code: 'PE017', phrases: ['golpe de arco'] },
    {
      code: 'PE080',
      phrases: [
        'cableado choca con amarre flexible',
        'cañerías chocan con perno de amarre flexible',
      ],
    },
    { code: 'PE003', phrases: ['soldadura incompleta'] },
    { code: 'PE085', phrases: ['orden y limpieza'] },
    {
      code: 'PE060',
      phrases: ['orejas de sujeción fuera de medida lp y lc'],
    },
    { code: 'PE039', phrases: ['mala preparación de superficie'] },
  ],
  Final: [
    {
      code: 'PE003',
      phrases: ['zonas sin soldar', 'falta dar segundo pase en cordón de soldadura'],
    },
    {
      code: 'PE039',
      phrases: [
        'mejorar acabado superficial',
        'mala preparación de superficie',
        'amarres flexibles sin preparación de superficie',
      ],
    },
    {
      code: 'PE007',
      phrases: ['zonas pulverizadas', 'pintura chorreada', 'tanque de hidrolina pulverizado', 'pulverizado'],
    },
    {
      code: 'PE012',
      phrases: ['daño de material', 'daño de material por golpe', 'abolladura en brazo de mantto'],
    },
    { code: 'PE041', phrases: ['tapa de batería con rayaduras'] },
    {
      code: 'PE078',
      phrases: [
        'escarpin roza con mecanismos',
        'verificar si pico y pala roza en tanque de hidrolina',
      ],
    },
    { code: 'PE030', phrases: ['socavación'] },
    { code: 'PE025', phrases: ['falta de fusión en soldadura'] },
    {
      code: 'PE044',
      phrases: [
        'falta fijar cañerías',
        'patín de mecanismo sienta fuera de mesa',
        'brazo de mantto no sienta en tope',
        'brazo de mantenimiento no sienta correctamente',
      ],
    },
    { code: 'PE029', phrases: ['cráter en soldadura'] },
    { code: 'PE060', phrases: ['luz entre hoist y chasis'] },
    {
      code: 'PE058',
      phrases: ['falta engrasar', 'falta engrase general'],
    },
    { code: 'PE052', phrases: ['fuga de aceite'] },
    {
      code: 'PE074',
      phrases: [
        'pernos flojos',
        'perno suelto',
        'falta ajustar tuerca mcc lp y lc',
        'falta ajustar perno',
      ],
    },
    { code: 'PE076', phrases: ['falta regular seguro de caja de faldón', 'ajustar separación de pin'] },
    {
      code: 'PE042',
      phrases: [
        'tijera estabilizadora no esta de acuerdo a plano',
        'tecle no esta de acuerdo a plano',
        'bisagra de faldón no esta de acuerdo a plano',
        'cambiar seguro tipo alfiler',
        'soporte de contrallanta no encaja correctamente',
      ],
    },
    { code: 'PE061', phrases: ['luz en viga'] },
    {
      code: 'PE085',
      phrases: [
        'limpieza de exceso de aceite',
        'falta orden y limpieza',
        'batería con restos de viruta',
        'restos de empapelado',
      ],
    },
    { code: 'PE038', phrases: ['retocar pintura en brazos de mantto', 'retocar pintura'] },
    { code: 'PE072', phrases: ['aplicar sika', 'corregir sikado'] },
    { code: 'PE040', phrases: ['falta de limpieza mecánica'] },
    { code: 'PE008', phrases: ['barra de escarpin deformado', 'barra de escarpin presenta deformación'] },
    { code: 'PE013', phrases: ['esmerilar rebabas'] },
    { code: 'PE046', phrases: ['mcc con oxido'] },
    { code: 'PE016', phrases: ['falta neumático de repuestos', 'falta asa de porta llanta'] },
    { code: 'PE045', phrases: ['barra de escarpin muy cerca a la llanta'] },
  ],
}

type SearchEntry = ObservationMatch & {
  searchableText: string
}

export function normalizeObservation(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:!?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createSearchIndex(process?: InspectionProcess) {
  const aliases =
    process === 'Montaje' || process === 'Final'
      ? observationAliases[process]
      : Object.values(observationAliases).flat()

  const aliasEntries = aliases.flatMap((alias) =>
    alias.phrases.map((phrase) => ({
      code: alias.code,
      matchedKeyword: phrase,
      searchableText: normalizeObservation(phrase),
    })),
  )

  const catalogEntries = allItems.map((item) => ({
    code: item.code,
    matchedKeyword: item.description,
    searchableText: normalizeObservation(item.description),
  }))

  return new Fuse([...aliasEntries, ...catalogEntries], {
    keys: ['searchableText'],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 3,
    includeScore: true,
  })
}

const searchIndexes: Record<InspectionProcess, Fuse<SearchEntry>> = {
  Montaje: createSearchIndex('Montaje'),
  Final: createSearchIndex('Final'),
}

const generalSearchIndex = createSearchIndex()

export function analyzeObservation(
  text: string,
  process?: string,
): ObservationMatch[] {
  const normalizedText = normalizeObservation(text)

  if (!normalizedText || /\bconforme\b/.test(normalizedText)) {
    return []
  }

  const searchIndex =
    process === 'Montaje' || process === 'Final'
      ? searchIndexes[process]
      : generalSearchIndex
  const words = normalizedText.split(' ')
  const searchQueries = new Map<string, number>([[normalizedText, 0]])
  const maxPhraseLength = Math.min(5, words.length)

  for (let phraseLength = maxPhraseLength; phraseLength >= 2; phraseLength--) {
    for (let start = 0; start <= words.length - phraseLength; start++) {
      const query = words.slice(start, start + phraseLength).join(' ')
      const specificityPenalty = (maxPhraseLength - phraseLength) * 0.025
      const previousPenalty = searchQueries.get(query)

      if (previousPenalty === undefined || specificityPenalty < previousPenalty) {
        searchQueries.set(query, specificityPenalty)
      }
    }
  }

  const bestMatches = new Map<string, ObservationMatch & { score: number }>()

  for (const [query, specificityPenalty] of searchQueries) {
    for (const { item, score } of searchIndex.search(query)) {
      const adjustedScore = (score ?? 1) + specificityPenalty

      if (adjustedScore > 0.4) {
        continue
      }

      const previousMatch = bestMatches.get(item.code)

      if (!previousMatch || adjustedScore < previousMatch.score) {
        bestMatches.set(item.code, {
          code: item.code,
          matchedKeyword: item.matchedKeyword,
          score: adjustedScore,
        })
      }
    }
  }

  return [...bestMatches.values()]
    .sort((left, right) => left.score - right.score)
    .slice(0, 5)
    .map(({ code, matchedKeyword }) => ({ code, matchedKeyword }))
}