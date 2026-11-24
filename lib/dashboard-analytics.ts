export type DashboardCatalogEntry = {
  category: string
}

export type DashboardObservation = {
  id: string
  observation_id: number | null
  code_snapshot: string
  description_snapshot: string
  note: string
  quantity: number
  plant: 'Planta 2' | 'Planta 3'
  observation_catalog: DashboardCatalogEntry | null
}

export type DashboardInspection = {
  id: string
  chassis: string
  ind: string
  supervisor: string
  box_code: string
  process: string
  inspection_date: string
  method: string
  status: string
  inspection_observations: DashboardObservation[] | null
}

export type DashboardFilters = {
  startDate: string
  endDate: string
  process: string
  plant: string
  category: string
  chassisQuery: string
}

export type CountMetric = {
  label: string
  value: number
}

export type ParetoMetric = {
  code: string
  description: string
  quantity: number
  records: number
  cumulativePercentage: number
}

export type DashboardMetrics = {
  inspections: DashboardInspection[]
  inspectionCount: number
  uniqueUnitCount: number
  observationRecordCount: number
  observationQuantity: number
  processCounts: CountMetric[]
  statusCounts: CountMetric[]
  plantQuantities: CountMetric[]
  categoryQuantities: CountMetric[]
  pareto: ParetoMetric[]
}

const UNCATEGORIZED = 'Sin catálogo'

function getObservations(inspection: DashboardInspection) {
  return inspection.inspection_observations ?? []
}

function observationMatches(
  observation: DashboardObservation,
  filters: DashboardFilters,
) {
  const category = observation.observation_catalog?.category ?? UNCATEGORIZED

  return (
    (!filters.plant || observation.plant === filters.plant) &&
    (!filters.category || category === filters.category)
  )
}

function sortCounts(counts: Map<string, number>) {
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
}

export function buildDashboardMetrics(
  rows: DashboardInspection[],
  filters: DashboardFilters,
): DashboardMetrics {
  const search = filters.chassisQuery.trim().toLocaleLowerCase()
  const matchingInspections = rows.filter((inspection) => {
    if (filters.startDate && inspection.inspection_date < filters.startDate) return false
    if (filters.endDate && inspection.inspection_date > filters.endDate) return false
    if (filters.process && inspection.process !== filters.process) return false
    if (
      search &&
      !inspection.chassis.toLocaleLowerCase().includes(search)
    ) {
      return false
    }

    if (
      (filters.plant || filters.category) &&
      !getObservations(inspection).some((observation) =>
        observationMatches(observation, filters),
      )
    ) {
      return false
    }

    return true
  })

  const observations = matchingInspections.flatMap((inspection) =>
    getObservations(inspection)
      .filter((observation) => observationMatches(observation, filters))
      .map((observation) => ({ inspection, observation })),
  )
  const unitChassis = new Set(matchingInspections.map((inspection) => inspection.chassis))
  const processCounts = new Map<string, number>()
  const statusCounts = new Map<string, number>()
  const plantQuantities = new Map<string, number>()
  const categoryQuantities = new Map<string, number>()
  const observationGroups = new Map<
    string,
    { code: string; description: string; quantity: number; records: number }
  >()
  for (const inspection of matchingInspections) {
    processCounts.set(
      inspection.process,
      (processCounts.get(inspection.process) ?? 0) + 1,
    )
    statusCounts.set(
      inspection.status,
      (statusCounts.get(inspection.status) ?? 0) + 1,
    )
  }

  for (const { observation } of observations) {
    const quantity = Number(observation.quantity) || 0
    const category = observation.observation_catalog?.category ?? UNCATEGORIZED
    const groupKey = `${observation.code_snapshot}\u0000${observation.description_snapshot}`
    const group = observationGroups.get(groupKey) ?? {
      code: observation.code_snapshot,
      description: observation.description_snapshot,
      quantity: 0,
      records: 0,
    }

    group.quantity += quantity
    group.records += 1
    observationGroups.set(groupKey, group)
    plantQuantities.set(
      observation.plant,
      (plantQuantities.get(observation.plant) ?? 0) + quantity,
    )
    categoryQuantities.set(
      category,
      (categoryQuantities.get(category) ?? 0) + quantity,
    )
  }

  const totalQuantity = observations.reduce(
    (total, { observation }) => total + (Number(observation.quantity) || 0),
    0,
  )
  let cumulativeQuantity = 0
  const pareto = [...observationGroups.values()]
    .sort(
      (left, right) =>
        right.quantity - left.quantity || left.code.localeCompare(right.code),
    )
    .map((group) => {
      cumulativeQuantity += group.quantity

      return {
        ...group,
        cumulativePercentage:
          totalQuantity > 0 ? (cumulativeQuantity / totalQuantity) * 100 : 0,
      }
    })

  return {
    inspections: matchingInspections,
    inspectionCount: matchingInspections.length,
    uniqueUnitCount: unitChassis.size,
    observationRecordCount: observations.length,
    observationQuantity: totalQuantity,
    processCounts: sortCounts(processCounts),
    statusCounts: sortCounts(statusCounts),
    plantQuantities: sortCounts(plantQuantities),
    categoryQuantities: sortCounts(categoryQuantities),
    pareto,
  }
}
