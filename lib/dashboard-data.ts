import { supabase } from '@/lib/supabase'
import type { DashboardInspection } from '@/lib/dashboard-analytics'

const PAGE_SIZE = 500

export async function fetchDashboardInspections(
  onProgress?: (loadedCount: number) => void,
) {
  const inspections: DashboardInspection[] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('inspections')
      .select(`
        id, chassis, ind, supervisor, box_code, process,
        inspection_date, method, status,
        inspection_observations (
          id, observation_id, code_snapshot, description_snapshot,
          note, quantity, plant,
          observation_catalog (category)
        )
      `)
      .order('inspection_date', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`No se pudieron cargar los datos analíticos: ${error.message}`)
    }

    const page = (data ?? []) as unknown as DashboardInspection[]
    inspections.push(...page)
    onProgress?.(inspections.length)

    if (page.length < PAGE_SIZE) return inspections
  }
}
