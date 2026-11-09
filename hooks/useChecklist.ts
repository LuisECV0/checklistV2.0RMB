
'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import ExcelJS from 'exceljs'
import { allItems, sections } from '@/data/checklist-data'
import { supabase } from '@/lib/supabase'
import { analyzeObservation } from '@/lib/observation-analyzer'

export const MANUAL_SELECTION = '__manual__'

/* =========================================================
   TIPOS
========================================================= */

export type Metadata = {
  ind: string
  supervisor: string
  chassis: string
  box: string
  process: string
  date: string
  method: string
}

export type Observation = {
  code: string
  description: string
  note: string
  quantity: string
  plant: 'Planta 2' | 'Planta 3'
}

export type HistoryItem = Metadata & {
  id: string
  status: string
  observations: Observation[]
}

type InspectionRow = {
  id: string
  ind: string
  supervisor: string
  chassis: string
  box_code: string
  process: string
  inspection_date: string
  method: string
  status: string
  inspection_observations: Array<{
    code_snapshot: string
    description_snapshot: string
    note: string
    quantity: number
    plant: 'Planta 2' | 'Planta 3'
  }>
}

/* =========================================================
   CONVERSIÓN DE DATOS DE SUPABASE
========================================================= */

function mapInspectionRow(row: InspectionRow): HistoryItem {
  return {
    id: row.id,
    ind: row.ind,
    supervisor: row.supervisor,
    chassis: row.chassis,
    box: row.box_code ?? '',
    process: row.process,
    date: row.inspection_date,
    method: row.method,
    status: row.status ?? 'No revisado',
    observations: (row.inspection_observations ?? []).map((observation) => ({
      code: observation.code_snapshot,
      description: observation.description_snapshot,
      note: observation.note ?? '',
      quantity: String(observation.quantity ?? 1),
      plant: observation.plant,
    })),
  }
}

/* =========================================================
   CONFIGURACIÓN DE COORDENADAS EXCEL
   IMPORTANTE: COORDENADAS PROVISIONALES
========================================================= */

const EXCEL_CELLS = {
  // Datos generales
  chassis: 'C7:G7',
  process: 'I7:K7',
  ind: 'C5:G5',
  box: 'I5:I5',
  supervisor: 'C6:G6',
  date: 'I6:K6',

  // Método de inspección
  methodNoDefinido: 'C11',
  methodVisual: 'C12',
  methodFin: 'I11',
  methodPruebas: 'I12',

  // Observaciones
  observations: 'B14',

  // Rango de búsqueda de códigos
  firstIndicatorRow: 1,
  lastIndicatorRow: 200,
} as const

/*
  Configuración de las dos tablas paralelas.

  TABLA IZQUIERDA:
  Código: A | P2: C | P3: D | Cantidad: E

  TABLA DERECHA:
  Código: G | P2: I | P3: J | Cantidad: K

  ESTAS COORDENADAS SON SIMULADAS.
  Puedes corregirlas cuando revises la plantilla real.
*/

const EXCEL_TABLES = [
  {
    name: 'izquierda',
    codeColumn: 'A',
    plant2Column: 'C',
    plant3Column: 'D',
    quantityColumn: 'E',
  },
  {
    name: 'derecha',
    codeColumn: 'G',
    plant2Column: 'I',
    plant3Column: 'J',
    quantityColumn: 'K',
  },
] as const

/* =========================================================
   FUNCIONES AUXILIARES PARA EXPORTAR EXCEL
========================================================= */

// Convierte letras de columna en números
function getColumnNumber(column: string): number {
  let result = 0

  for (const character of column.toUpperCase()) {
    result = result * 26 + character.charCodeAt(0) - 64
  }

  return result
}

// Busca un código PE y devuelve su fila y tabla correspondiente
function findIndicatorCell(
  sheet: ExcelJS.Worksheet,
  code: string,
) {
  const normalizedCode = code.trim().toUpperCase()

  for (
    let row = EXCEL_CELLS.firstIndicatorRow;
    row <= EXCEL_CELLS.lastIndicatorRow;
    row++
  ) {
    for (const table of EXCEL_TABLES) {
      const column = getColumnNumber(table.codeColumn)
      const value = sheet.getCell(row, column).value

      if (
        typeof value === 'string' &&
        value.trim().toUpperCase() === normalizedCode
      ) {
        return {
          row,
          table,
        }
      }
    }
  }

  return null
}

// Agrupa cantidades por código y planta
function groupObservationQuantities(
  observations: Observation[],
) {
  const grouped = new Map<
    string,
    {
      plant2: number
      plant3: number
    }
  >()

  for (const observation of observations) {
    const code = observation.code.trim().toUpperCase()

    if (!/^PE\d{3}$/.test(code)) continue

    const quantity = Number(observation.quantity) || 0

    if (!grouped.has(code)) {
      grouped.set(code, {
        plant2: 0,
        plant3: 0,
      })
    }

    const current = grouped.get(code)!

    if (observation.plant === 'Planta 2') {
      current.plant2 = current.plant2 + quantity
    }

    if (observation.plant === 'Planta 3') {
      current.plant3 = current.plant3 + quantity
    }
  }

  return grouped
}

// Escribe las cantidades en la tabla donde se encuentra cada código
function writeIndicatorQuantities(
  sheet: ExcelJS.Worksheet,
  observations: Observation[],
) {
  const grouped = groupObservationQuantities(observations)

  for (const [code, quantities] of grouped) {
    const location = findIndicatorCell(sheet, code)

    if (!location) {
      console.warn(`No se encontró el código ${code} en la plantilla`)
      continue
    }

    const { row, table } = location

    const plant2Column = getColumnNumber(table.plant2Column)
    const plant3Column = getColumnNumber(table.plant3Column)
    const quantityColumn = getColumnNumber(table.quantityColumn)

    sheet.getCell(row, plant2Column).value =
      quantities.plant2 || ''

    sheet.getCell(row, plant3Column).value =
      quantities.plant3 || ''

    sheet.getCell(row, quantityColumn).value =
      quantities.plant2 + quantities.plant3
  }
}

// Construye el texto de observaciones
function buildObservationsText(
  observations: Observation[],
): string {
  return observations
    .map((item) => {
      return [
        `${item.code} - ${item.description}`,
        `  ${item.note}`,
        `  Planta: ${item.plant} | Cantidad: ${item.quantity}`,
      ].join('\n')
    })
    .join('\n\n')
}

/* =========================================================
   HOOK PRINCIPAL
========================================================= */

export function useChecklist() {
  const [metadata, setMetadata] = useState<Metadata>({
    ind: '',
    supervisor: '',
    chassis: '',
    box: '',
    process: 'Montaje',
    date: new Date().toISOString().slice(0, 10),
    method: 'Visual',
  })

  const [note, setNote] = useState('')
  const [plant, setPlant] = useState<'Planta 2' | 'Planta 3'>('Planta 2')
  const [quantity, setQuantity] = useState('1')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [savedObservations, setSavedObservations] = useState<Observation[]>([])

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [preview, setPreview] = useState<HistoryItem | null>(null)
  const [editingChassis, setEditingChassis] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)

  const [saving, setSaving] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)

  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('Todos')

  /* =======================================================
     FUNCIONES GENERALES
  ======================================================= */

  const setMeta = (key: keyof Metadata, value: string) => {
    setMetadata((current) => ({ ...current, [key]: value }))
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  /* =======================================================
     HISTORIAL
  ======================================================= */

  const loadHistory = async () => {
    if (!userEmail) return

    setLoadingHistory(true)

    try {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id, ind, supervisor, chassis, box_code, process,
          inspection_date, method, status,
          inspection_observations (
            code_snapshot, description_snapshot, note, quantity, plant
          )
        `)
        .order('inspection_date', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error

      setHistory(
        ((data ?? []) as unknown as InspectionRow[]).map(mapInspectionRow),
      )
    } catch (error) {
      console.error('Error al cargar el historial de Supabase:', error)
      showToast('No se pudo cargar el historial de la nube')
    } finally {
      setLoadingHistory(false)
    }
  }

  /* =======================================================
     AUTENTICACIÓN
  ======================================================= */

  useEffect(() => {
    let active = true

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        console.error('No se pudo recuperar la sesión:', error)
      }

      const email = data.session?.user.email ?? null

      setUserEmail(email)
      setAuthChecking(false)

      if (email) {
        const { data: rows, error: historyError } = await supabase
          .from('inspections')
          .select(`
            id, ind, supervisor, chassis, box_code, process,
            inspection_date, method, status,
            inspection_observations (
              code_snapshot, description_snapshot, note, quantity, plant
            )
          `)
          .order('inspection_date', { ascending: false })
          .order('updated_at', { ascending: false })

        if (!active) return

        if (historyError) {
          console.error('Error al cargar el historial:', historyError)
          setToast('Sesión iniciada, pero no se pudo cargar el historial')
        } else {
          setHistory(
            ((rows ?? []) as unknown as InspectionRow[]).map(mapInspectionRow),
          )
        }
      }
    }

    void initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const email = session?.user.email ?? null

        setUserEmail(email)
        setAuthChecking(false)

        if (!email) {
          setHistory([])
          setEditingId(null)
          setEditingChassis(null)
        } else {
          window.setTimeout(() => {
            void supabase
              .from('inspections')
              .select(`
                id, ind, supervisor, chassis, box_code, process,
                inspection_date, method, status,
                inspection_observations (
                  code_snapshot, description_snapshot, note, quantity, plant
                )
              `)
              .order('inspection_date', { ascending: false })
              .order('updated_at', { ascending: false })
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error al cargar historial tras autenticar:', error)
                  setToast('No se pudo cargar el historial')
                } else {
                  setHistory(
                    ((data ?? []) as unknown as InspectionRow[]).map(mapInspectionRow),
                  )
                }
              })
          }, 0)
        }
      },
    )

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (authSubmitting) return

    setAuthSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    })

    if (error) {
      console.error('Error de inicio de sesión:', error)
      showToast('No se pudo iniciar sesión. Verifica correo y contraseña.')
    } else {
      setAuthPassword('')
      showToast('Sesión iniciada')
    }

    setAuthSubmitting(false)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión:', error)
      showToast('No se pudo cerrar sesión')
    } else {
      setHistory([])
      showToast('Sesión cerrada')
    }
  }

  /* =======================================================
     FILTROS Y VALIDACIONES
  ======================================================= */

  const filteredItems = useMemo(() => {
    return allItems.filter(
      (item) => activeSection === 'Todos' || item.section === activeSection,
    )
  }, [activeSection])

  const filteredHistory = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return history

    return history.filter((item) =>
      `${item.chassis} ${item.ind} ${item.box} ${item.supervisor} ${item.process}`
        .toLowerCase()
        .includes(search),
    )
  }, [history, query])

  const duplicateChassis =
    editingId !== null &&
    history.some(
      (item) =>
        item.id !== editingId &&
        item.chassis.trim() === metadata.chassis.trim() &&
        item.process === metadata.process,
    )

  /* =======================================================
     OBSERVACIONES
  ======================================================= */

  const analyze = () => {
    if (!note.trim()) return

    setAnalyzing(true)
    setSelected(null)

    try {
      const matches = analyzeObservation(note, metadata.process)

      const matchedDescriptions = matches
        .map((match) =>
          allItems.find((item) => item.code === match.code),
        )
        .filter((item) => item !== undefined)
        .map((item) => item.description)

      const uniqueDescriptions = [...new Set(matchedDescriptions)]

      setSuggestions(uniqueDescriptions)
      setAnalysisComplete(true)
    } catch (error) {
      console.error('Error al analizar la observación:', error)
      setSuggestions([])
      setAnalysisComplete(false)
      showToast('Ocurrió un error al analizar la observación')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveObservation = () => {
    if (!selected || !note.trim() || !metadata.chassis.trim()) return

    const isManual = selected === MANUAL_SELECTION
    const matchedItem = allItems.find(
      (item) => item.description === selected,
    )

    const observation: Observation = {
      code: isManual ? 'MANUAL' : matchedItem?.code ?? 'MANUAL',
      description: isManual ? 'Observación manual' : selected,
      note: note.trim(),
      quantity: quantity || '1',
      plant,
    }

    setSavedObservations((current) => [...current, observation])
    setNote('')
    setSuggestions([])
    setSelected(null)
    setAnalysisComplete(false)

    showToast('Observación agregada a la ficha')
  }

  const deleteObservation = (index: number) => {
    setSavedObservations((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  /* =======================================================
     EDICIÓN DE FICHAS
  ======================================================= */

  const editReport = (item: HistoryItem) => {
    setEditingId(item.id)
    setEditingChassis(item.chassis)

    setMetadata({
      ind: item.ind,
      supervisor: item.supervisor,
      chassis: item.chassis,
      box: item.box,
      process: item.process,
      date: item.date,
      method: item.method,
    })

    setSavedObservations(
      item.observations.map((observation) => ({ ...observation })),
    )

    setNote('')
    setSuggestions([])
    setSelected(null)
    setAnalysisComplete(false)
    setPlant('Planta 2')
    setQuantity('1')
    setPreview(null)

    window.scrollTo({ top: 0, behavior: 'smooth' })

    showToast(`Ficha ${item.chassis} cargada para edición`)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingChassis(null)

    setMetadata({
      ind: '',
      supervisor: '',
      chassis: '',
      box: '',
      process: 'Montaje',
      date: new Date().toISOString().slice(0, 10),
      method: 'Visual',
    })

    setSavedObservations([])
    setNote('')
    setSuggestions([])
    setSelected(null)
    setAnalysisComplete(false)
    setPlant('Planta 2')
    setQuantity('1')

    showToast('Edición cancelada')
  }

  /* =======================================================
     GUARDAR FICHA EN SUPABASE
  ======================================================= */

  const saveReport = async () => {
    if (saving) return

    const chassis = metadata.chassis.trim()
    const ind = metadata.ind.trim()

    if (!/^\d{4}$/.test(ind)) {
      showToast('El IND debe tener exactamente 4 dígitos')
      return
    }

    if (!chassis) {
      showToast('Completa el número de chasis')
      return
    }

    if (!metadata.supervisor.trim()) {
      showToast('Completa el supervisor de calidad')
      return
    }

    if (duplicateChassis) {
      showToast('Ya existe otra ficha con ese chasis y proceso')
      return
    }

    const invalidQuantity = savedObservations.some(
      (observation) =>
        !Number.isInteger(Number(observation.quantity)) ||
        Number(observation.quantity) < 1,
    )

    if (invalidQuantity) {
      showToast('Cada observación debe tener una cantidad mayor que cero')
      return
    }

    setSaving(true)

    const payload: Record<string, string> = {
      ind,
      supervisor: metadata.supervisor.trim(),
      chassis,
      box_code: metadata.box.trim(),
      process: metadata.process,
      inspection_date: metadata.date,
      method: metadata.method || 'No definido',
    }

    if (editingId) payload.id = editingId

    const observationsPayload = savedObservations.map((observation) => ({
      code: observation.code,
      description: observation.description,
      note: observation.note,
      quantity: String(Number(observation.quantity) || 1),
      plant: observation.plant,
    }))

    try {
      const { data, error } = await supabase.rpc('save_inspection', {
        p_inspection: payload,
        p_observations: observationsPayload,
      })

      if (error) throw error

      await loadHistory()

      setEditingId(null)
      setEditingChassis(null)

      showToast('Ficha guardada correctamente en la nube')

      if (!data) {
        console.warn('Supabase guardó la ficha, pero no devolvió su ID.')
      }
    } catch (error) {
      console.error('Error al guardar la ficha en Supabase:', error)
      showToast('No se pudo guardar. Revisa la conexión y los permisos de Supabase.')
    } finally {
      setSaving(false)
    }
  }

  /* =======================================================
     EXPORTACIÓN EXCEL
  ======================================================= */

  const exportWorkbook = async (
    report: Metadata,
    observations: Observation[] = savedObservations,
  ) => {
    if (exporting) return

    setExporting(true)

    try {
      const response = await fetch('/checklist-template.xlsx')

      if (!response.ok) {
        throw new Error('No se pudo cargar la plantilla de Excel')
      }

      const workbook = new ExcelJS.Workbook()

      await workbook.xlsx.load(await response.arrayBuffer())

      const sheet = workbook.worksheets[0]

      if (!sheet) {
        throw new Error('La plantilla no contiene hojas de cálculo')
      }

      // 1. Datos generales
      sheet.getCell(EXCEL_CELLS.chassis).value = report.chassis
      sheet.getCell(EXCEL_CELLS.process).value = report.process
      sheet.getCell(EXCEL_CELLS.ind).value = report.ind
      sheet.getCell(EXCEL_CELLS.box).value = report.box
      sheet.getCell(EXCEL_CELLS.supervisor).value = report.supervisor

      // Fecha de inspección
      const dateCell = sheet.getCell(EXCEL_CELLS.date)

      if (report.date) {
        const [year, month, day] = report.date
          .slice(0, 10)
          .split('-')
          .map(Number)

        dateCell.value = new Date(year, month - 1, day, 12, 0, 0)
        dateCell.numFmt = 'dd/mm/yyyy'
      } else {
        dateCell.value = ''
      }

      // 2. Método de inspección
      const method = report.method.trim().toUpperCase()

      if (method === 'NO DEFINIDO') {
        sheet.getCell(EXCEL_CELLS.methodNoDefinido).value = 'X'
      } else if (method === 'VISUAL') {
        sheet.getCell(EXCEL_CELLS.methodVisual).value = 'X'
      } else if (method === 'FIN') {
        sheet.getCell(EXCEL_CELLS.methodFin).value = 'X'
      } else if (method === 'PRUEBAS') {
        sheet.getCell(EXCEL_CELLS.methodPruebas).value = 'X'
      }

      // 3. Cantidades por código y planta
      writeIndicatorQuantities(sheet, observations)

      // 4. Observaciones
      sheet.getCell(EXCEL_CELLS.observations).value =
        buildObservationsText(observations)

      sheet.getCell(EXCEL_CELLS.observations).alignment = {
        wrapText: true,
        vertical: 'top',
      }
// Forzar texto negro en las celdas utilizadas
sheet.eachRow((row) => {
  row.eachCell((cell) => {
    if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
      cell.font = {
        ...cell.font,
        color: { argb: 'FF000000' },
      }
    }
  })
})
      // 5. Generar archivo
      const buffer = await workbook.xlsx.writeBuffer()

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download =
        `checklist-open-${report.chassis || 'reporte'}-${report.process
          .toLowerCase()
          .replace(/\s+/g, '-')}.xlsx`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => URL.revokeObjectURL(url), 1000)

      showToast('Excel descargado correctamente')
    } catch (error) {
      console.error('Error al generar Excel:', error)
      showToast('No se pudo generar el Excel')
    } finally {
      setExporting(false)
    }
  }

  /* =======================================================
     EXPORTAR FICHA POR ID
  ======================================================= */

  const exportReportById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id, ind, supervisor, chassis, box_code, process,
          inspection_date, method, status,
          inspection_observations (
            code_snapshot, description_snapshot, note, quantity, plant
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const report = mapInspectionRow(data as unknown as InspectionRow)

      await exportWorkbook(report, report.observations)
    } catch (error) {
      console.error('Error al recuperar la ficha desde la nube:', error)
      showToast('No se pudo recuperar la ficha desde la nube')
    }
  }

  /* =======================================================
     EXPORTAR FICHA POR CHASIS Y PROCESO
  ======================================================= */

  const exportReportByKey = async () => {
    const chassis = metadata.chassis.trim()

    if (!chassis) {
      showToast('Abre una ficha guardada para exportarla')
      return
    }

    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('id')
        .eq('chassis', chassis)
        .eq('process', metadata.process)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        showToast('Primero guarda la ficha en la nube')
        return
      }

      await exportReportById(data.id)
    } catch (error) {
      console.error('Error al buscar la ficha para exportar:', error)
      showToast('No se pudo recuperar la ficha desde la nube')
    }
  }

  /* =======================================================
     DATOS QUE UTILIZARÁ PAGE.TSX
  ======================================================= */

  return {
    // Catálogo
    sections,
    allItems,
    filteredItems,

    // Datos de la ficha
    metadata,
    setMetadata,
    setMeta,

    // Observación actual
    note,
    setNote,
    plant,
    setPlant,
    quantity,
    setQuantity,
    suggestions,
    setSuggestions,
    selected,
    setSelected,
    analyzing,
    analysisComplete,
    setAnalysisComplete,

    // Observaciones guardadas
    savedObservations,
    setSavedObservations,
    deleteObservation,

    // Historial y vista previa
    history,
    filteredHistory,
    loadingHistory,
    preview,
    setPreview,
    query,
    setQuery,

    // Edición
    editingChassis,
    editingId,
    duplicateChassis,

    // Autenticación
    userEmail,
    authChecking,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authSubmitting,

    // Estados de operaciones
    saving,
    exporting,
    toast,

    // Catálogo
    activeSection,
    setActiveSection,

    // Funciones
    showToast,
    loadHistory,
    handleLogin,
    handleLogout,
    analyze,
    saveObservation,
    editReport,
    cancelEdit,
    saveReport,
    exportReportById,
    exportReportByKey,
  }
}
