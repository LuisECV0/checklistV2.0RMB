
'use client'

import { useMemo, useState } from 'react'
import ExcelJS from 'exceljs'
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  History,
  PencilLine,
  Plus,
  Search,
  X,
} from 'lucide-react'

/* =========================================================
   CATÁLOGO DE OBSERVACIONES
========================================================= */

const sections = [
  { id: '01', title: 'Eléctrico', items: [['PE059', 'Falla eléctrica']] },
  {
    id: '03',
    title: 'Hidráulico',
    items: [
      ['PE051', 'Falta aceite hidráulico'],
      ['PE052', 'Fuga aceite'],
      ['PE053', 'Fuga agua'],
      ['PE054', 'Fuga aire'],
      ['PE080', 'Mal ruteo'],
      ['PE081', 'Falla al bascular'],
    ],
  },
  {
    id: '05',
    title: 'Pintura',
    items: [
      ['PE006', 'Bajo espesor pintura'],
      ['PE007', 'Exceso espesor pintura'],
      ['PE038', 'Zona por retocar'],
      ['PE039', 'Mala preparación de superficie'],
      ['PE040', 'Falta limpieza mecánica'],
      ['PE041', 'Rayaduras en pintura'],
      ['PE072', 'Falta de sika'],
      ['PE073', 'Falta de sticker, cinta reflectivas'],
    ],
  },
  {
    id: '12',
    title: 'Soldadura',
    items: [
      ['PE001', 'Defecto soldadura'],
      ['PE003', 'Soldadura incompleta'],
      ['PE004', 'Salpicadura'],
      ['PE005', 'Punto de soldadura'],
      ['PE017', 'Golpe de arco'],
      ['PE018', 'Falta coronar'],
      ['PE019', 'Fisuras'],
      ['PE025', 'Falta fusión'],
      ['PE026', 'Cateto insuficiente'],
      ['PE027', 'Soldadura cóncava'],
      ['PE028', 'Descolgamiento'],
      ['PE029', 'Cráter'],
      ['PE030', 'Socavación'],
      ['PE031', 'Porosidad'],
      ['PE032', 'Soldadura convexa'],
      ['PE083', 'Mala preparación de junta'],
    ],
  },
  {
    id: '14',
    title: 'Ensamble',
    items: [
      ['PE011', 'Armado incorrecto'],
      ['PE016', 'Falta accesorio'],
      ['PE042', 'Accesorio fuera de especificación'],
      ['PE043', 'Accesorio desprendido'],
      ['PE044', 'Instalación incorrecta'],
      ['PE045', 'Ubicación incorrecta'],
      ['PE074', 'Pernos flojos'],
      ['PE075', 'Pernos cortos'],
      ['PE076', 'Regulación de accesorios'],
      ['PE077', 'Trabajos incompletos'],
      ['PE085', 'Orden y limpieza'],
    ],
  },
  {
    id: '15',
    title: 'Material',
    items: [
      ['PE008', 'Deformación estructural'],
      ['PE012', 'Daño material'],
      ['PE046', 'Oxidación'],
    ],
  },
  {
    id: '16',
    title: 'Ingeniería / Diseño',
    items: [
      ['PE047', 'Mal diseño plano'],
      ['PE048', 'Falta actualización planos'],
      ['PE049', 'Plano incompleto'],
      ['PE050', 'Incongruencia EE.TT'],
    ],
  },
  {
    id: '17',
    title: 'Funcionamiento',
    items: [
      ['PE010', 'Falla de funcionamiento de accesorio'],
      ['PE055', 'Falla mecanismo apertura'],
      ['PE056', 'Juego excesivo'],
      ['PE057', 'Ruido anormal'],
      ['PE058', 'Falta engrase'],
      ['PE078', 'Rozamiento'],
      ['PE079', 'Ángulo no conforme'],
    ],
  },
  {
    id: '18',
    title: 'Dimensional',
    items: [
      ['PE009', 'Desalineamiento'],
      ['PE015', 'Agujeros faltantes'],
      ['PE060', 'Fuera de medida'],
      ['PE061', 'Luz en viga'],
      ['PE062', 'Luz en zapata'],
      ['PE063', 'Luz en compuerta'],
    ],
  },
  {
    id: '19',
    title: 'Corte / Mecanizado',
    items: [
      ['PE013', 'Rebabas'],
      ['PE064', 'Muescas'],
      ['PE065', 'Filos cortantes'],
    ],
  },
  {
    id: '20',
    title: 'Chasis post carrozado',
    items: [
      ['PE066', 'Daño en componentes del chasis'],
      ['PE067', 'Daño en cabina'],
      ['PE068', 'Tanque silenciador'],
      ['PE069', 'Tanque combustible'],
      ['PE070', 'Pulmón de aire'],
      ['PE071', 'Cámara de retroceso'],
      ['PE082', 'Daño de batería'],
    ],
  },
]

const allItems = sections.flatMap((section) =>
  section.items.map(([code, description]) => ({
    code,
    description,
    section: section.title,
  })),
)

/* =========================================================
   TIPOS
========================================================= */

type Metadata = {
  ind: string
  supervisor: string
  chassis: string
  box: string
  process: string
  date: string
  method: string
}

type Observation = {
  code: string
  description: string
  note: string
  quantity: string
  plant: 'Planta 2' | 'Planta 3'
}

type HistoryItem = Metadata & {
  observations: Observation[]
}

/* =========================================================
   ESTILOS REUTILIZABLES
========================================================= */

const inputClass =
  'mt-1.5 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60'

const labelClass =
  'block min-w-0 text-xs font-semibold tracking-wide text-muted-foreground'

const panelClass =
  'min-w-0 rounded-xl border border-border bg-card shadow-sm'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'

const iconButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'

/* =========================================================
   DATOS DE PRUEBA DEL HISTORIAL
========================================================= */

const initialHistory: HistoryItem[] = [
  {
    chassis: '001250',
    ind: '0125',
    box: '0125-AB',
    supervisor: 'Luis Castañeda',
    date: '2026-09-27',
    process: 'Montaje',
    method: 'Visual',
    observations: [
      {
        code: 'PE016',
        description: 'Falta accesorio',
        note: 'Falta accesorio en zona lateral',
        quantity: '1',
        plant: 'Planta 2',
      },
      {
        code: 'PE074',
        description: 'Pernos flojos',
        note: 'Se encuentran pernos flojos en el conjunto',
        quantity: '2',
        plant: 'Planta 2',
      },
    ],
  },
  {
    chassis: '001260',
    ind: '0126',
    box: '0126-CD',
    supervisor: 'Luis Castañeda',
    date: '2026-09-27',
    process: 'Final',
    method: 'Visual',
    observations: [
      {
        code: 'PE041',
        description: 'Rayaduras en pintura',
        note: 'Rayadura visible en lateral derecho',
        quantity: '1',
        plant: 'Planta 3',
      },
    ],
  },
  {
    chassis: '001270',
    ind: '0127',
    box: '0127-EF',
    supervisor: 'Luis Castañeda',
    date: '2026-09-27',
    process: 'Visto Bueno',
    method: 'Visual',
    observations: [
      {
        code: 'PE001',
        description: 'Defecto soldadura',
        note: 'Defecto visible en soldadura',
        quantity: '1',
        plant: 'Planta 2',
      },
    ],
  },
]

const EXCEL_CELLS = {
  dateHeader: 'D3',
  ind: 'C5',
  supervisor: 'C6',
  chassis: 'C7',
  box: 'I5',
  date: 'I6',
  process: 'I7',
  method: 'B11',
  observations: 'B14',
} as const

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function Page() {
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
  const [savedObservations, setSavedObservations] = useState<Observation[]>([])

  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [preview, setPreview] = useState<HistoryItem | null>(null)
  const [editingChassis, setEditingChassis] = useState<string | null>(null)

  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)
  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('Todos')

  const setMeta = (key: keyof Metadata, value: string) => {
    setMetadata((current) => ({ ...current, [key]: value }))
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  /* Catálogo de referencia */

  const filteredItems = useMemo(() => {
    return allItems.filter(
      (item) =>
        activeSection === 'Todos' || item.section === activeSection,
    )
  }, [activeSection])

  /* Historial */

  const filteredHistory = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return history

    return history.filter((item) =>
      `${item.chassis} ${item.ind} ${item.box} ${item.supervisor} ${item.process}`
        .toLowerCase()
        .includes(search),
    )
  }, [history, query])

  /* Validación de chasis: excluye la ficha que se está editando */

  const duplicateChassis =
    metadata.chassis.trim() !== '' &&
    history.some(
      (item) =>
        item.chassis.trim() === metadata.chassis.trim() &&
        (editingChassis === null ||
          item.chassis.trim() !== editingChassis.trim()),
    )

  /* Análisis simulado: aún no está conectado a un modelo de IA */

  const analyze = () => {
    if (!note.trim()) return

    setAnalyzing(true)
    setSelected(null)

    window.setTimeout(() => {
      setSuggestions([
        'Falta de accesorio',
        'Instalación incorrecta',
        'Trabajos incompletos',
      ])
      setAnalyzing(false)
    }, 500)
  }

  /* Guardar observación */

  const saveObservation = () => {
    if (!selected || !note.trim() || !metadata.chassis.trim()) return

    const matchedItem = allItems.find(
      (item) => item.description === selected,
    )

    const observation: Observation = {
      code: matchedItem?.code ?? 'MANUAL',
      description: selected,
      note: note.trim(),
      quantity: quantity || '1',
      plant,
    }

    setSavedObservations((current) => [...current, observation])
    setNote('')
    setSuggestions([])
    setSelected(null)
    showToast('Observación agregada a la ficha')
  }

  /* Cargar ficha para edición */

  const editReport = (item: HistoryItem) => {
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

    setSavedObservations(item.observations.map((observation) => ({ ...observation })))
    setNote('')
    setSuggestions([])
    setSelected(null)
    setPlant('Planta 2')
    setQuantity('1')
    setPreview(null)

    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(`Ficha ${item.chassis} cargada para edición`)
  }

  /* Cancelar edición */

  const cancelEdit = () => {
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
    setPlant('Planta 2')
    setQuantity('1')

    showToast('Edición cancelada')
  }

  /* Guardar o actualizar ficha */

  const saveReport = () => {
    const chassis = metadata.chassis.trim()
    const ind = metadata.ind.trim()

    if (!chassis || !ind) {
      showToast('Completa el IND y el número de chasis')
      return
    }

    if (duplicateChassis) {
      showToast('Este chasis ya está registrado en otra ficha')
      return
    }

    const report: HistoryItem = {
      ...metadata,
      chassis,
      ind,
      observations: savedObservations.map((observation) => ({ ...observation })),
    }

    if (editingChassis !== null) {
      setHistory((current) =>
        current.map((item) =>
          item.chassis.trim() === editingChassis.trim() ? report : item,
        ),
      )

      setEditingChassis(null)
      showToast('Ficha actualizada correctamente')
    } else {
      setHistory((current) => [report, ...current])
      showToast('Ficha guardada correctamente')
    }
  }

  /* Exportar Excel */

  async function exportWorkbook(
    report: Metadata,
    observations: Observation[] = savedObservations,
  ) {
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

      sheet.getCell(EXCEL_CELLS.dateHeader).value = report.date
        ? new Date(`${report.date}T12:00:00`)
        : ''

      sheet.getCell(EXCEL_CELLS.ind).value = report.ind
      sheet.getCell(EXCEL_CELLS.supervisor).value = report.supervisor
      sheet.getCell(EXCEL_CELLS.chassis).value = report.chassis
      sheet.getCell(EXCEL_CELLS.box).value = report.box

      sheet.getCell(EXCEL_CELLS.date).value = report.date
        ? new Date(`${report.date}T12:00:00`)
        : ''

      sheet.getCell(EXCEL_CELLS.process).value = report.process
      sheet.getCell(EXCEL_CELLS.method).value = report.method

      sheet.getCell(EXCEL_CELLS.observations).value = observations
        .map(
          (item) =>
            `${item.code} — ${item.description}: ${item.note} (Cantidad: ${item.quantity}) [${item.plant}]`,
        )
        .join('\n')

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `checklist-open-${report.chassis || 'reporte'}.xlsx`

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
     INTERFAZ
  ======================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Encabezado corporativo */}

      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardCheck size={23} strokeWidth={1.8} />
              <span className="absolute bottom-0 left-0 h-1 w-full rounded-b-lg bg-[#F2B827]" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                RMB SATECI · CALIDAD
              </p>
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
                Checklist de inspección
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => exportWorkbook(metadata, savedObservations)}
            disabled={exporting}
            className={primaryButtonClass}
          >
            <FileSpreadsheet size={17} />
            <span className="hidden sm:inline">
              {exporting ? 'Preparando archivo…' : 'Exportar Excel'}
            </span>
            <span className="sm:hidden">
              {exporting ? 'Preparando…' : 'Exportar'}
            </span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Cabecera de la página */}

        <section className="relative mb-6 overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 opacity-[0.08] sm:block">
            <ClipboardCheck className="absolute -right-8 -top-12 size-72" strokeWidth={0.7} />
          </div>

          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold">
                <span className="size-2 rounded-full bg-[#F2B827]" />
                Sistema de control de calidad
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Registro de inspección
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                Registra los datos de la unidad, documenta las observaciones
                y prepara la ficha para su exportación.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="min-w-32 rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-bold tabular-nums">
                  {savedObservations.length.toString().padStart(2, '0')}
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  Observaciones
                </p>
              </div>

              <div className="min-w-32 rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-bold tabular-nums">
                  {allItems.length}
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  Códigos disponibles
                </p>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-[#F2B827]" />
        </section>

        {/* Datos del reporte */}

        <section className={`${panelClass} mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                <ClipboardList size={19} />
              </div>
              <div>
                <h2 className="font-bold">Datos de la unidad</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Información general de la ficha de inspección
                </p>
              </div>
            </div>

            <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              Formato v03
            </span>
          </div>

          {editingChassis !== null && (
            <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/25 bg-secondary p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <PencilLine size={17} />
                <span>Modo edición · Chasis {editingChassis}</span>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                className={secondaryButtonClass}
              >
                <X size={15} />
                Cancelar edición
              </button>
            </div>
          )}

          <div className="grid min-w-0 gap-x-4 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className={labelClass}>
              IND <span className="text-destructive">*</span>
              <input
                inputMode="numeric"
                maxLength={4}
                value={metadata.ind}
                onChange={(e) =>
                  setMeta('ind', e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="Ej. 0125"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Supervisor de calidad
              <input
                value={metadata.supervisor}
                onChange={(e) => setMeta('supervisor', e.target.value)}
                placeholder="Nombre del supervisor"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Número de chasis <span className="text-destructive">*</span>
              <input
                inputMode="numeric"
                maxLength={6}
                value={metadata.chassis}
                onChange={(e) =>
                  setMeta('chassis', e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="Ej. 001250"
                aria-invalid={duplicateChassis}
                className={`${inputClass} ${
                  duplicateChassis
                    ? 'border-destructive focus-visible:ring-destructive/20'
                    : ''
                }`}
              />

              {duplicateChassis && (
                <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-destructive">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  Este chasis pertenece a otra ficha registrada.
                </p>
              )}
            </label>

            <label className={labelClass}>
              Código de caja
              <input
                maxLength={7}
                value={metadata.box}
                onChange={(e) =>
                  setMeta(
                    'box',
                    e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, '').slice(0, 7),
                  )
                }
                placeholder="Ej. 0125-AB"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Proceso
              <select
                value={metadata.process}
                onChange={(e) => setMeta('process', e.target.value)}
                className={inputClass}
              >
                <option>Montaje</option>
                <option>Final</option>
                <option>Visto Bueno</option>
              </select>
            </label>

            <label className={labelClass}>
              Método de inspección
              <select
                value={metadata.method}
                onChange={(e) => setMeta('method', e.target.value)}
                className={inputClass}
              >
                <option>No definido</option>
                <option>Visual</option>
                <option>Fin</option>
                <option>Pruebas</option>
              </select>
            </label>

            <label className={labelClass}>
              Fecha de inspección
              <span className="relative block">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="date"
                  value={metadata.date}
                  onChange={(e) => setMeta('date', e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </span>
            </label>
          </div>
        </section>

        {/* Captura de observaciones */}

        <section className="mb-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          {/* Nueva observación */}

          <div className={`${panelClass} p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <ClipboardCheck size={21} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Registro técnico
                </p>
                <h2 className="mt-1 text-lg font-bold">Nueva observación</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Describe el hallazgo y selecciona el código que mejor lo representa.
                </p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Descripción del hallazgo
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Se observa un accesorio flojo en la zona lateral..."
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                La clasificación sugerida es una ayuda para el registro.
              </p>
              <button
                type="button"
                onClick={analyze}
                disabled={!note.trim() || analyzing}
                className={primaryButtonClass}
              >
                <Search size={16} />
                {analyzing ? 'Analizando…' : 'Buscar coincidencia'}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">Clasificación de la observación</h3>
                  <span className="text-xs text-muted-foreground">
                    Selecciona una opción
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {suggestions.map((suggestion, index) => {
                    const match = allItems.find(
                      (item) => item.description === suggestion,
                    )
                    const isSelected = selected === suggestion

                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setSelected(suggestion)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? 'border-primary bg-secondary ring-1 ring-primary/20'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {suggestion}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {match ? `${match.code} · ${match.section}` : 'Registro manual'}
                          </span>
                        </span>

                        {isSelected && (
                          <Check size={18} className="shrink-0 text-primary" />
                        )}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => setSelected('Otra / no coincide')}
                    className={`flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-left text-sm font-semibold transition ${
                      selected === 'Otra / no coincide'
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <Plus size={16} />
                    Ninguna coincide: registrar como observación manual
                  </button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Planta
                    <select
                      value={plant}
                      onChange={(e) =>
                        setPlant(e.target.value as 'Planta 2' | 'Planta 3')
                      }
                      className={inputClass}
                    >
                      <option>Planta 2</option>
                      <option>Planta 3</option>
                    </select>
                  </label>

                  <label className={labelClass}>
                    Cantidad
                    <input
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value.replace(/\D/g, '').slice(0, 3))
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={saveObservation}
                  disabled={
                    !selected ||
                    !note.trim() ||
                    !metadata.chassis.trim() ||
                    duplicateChassis
                  }
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  <Plus size={17} />
                  Agregar observación a la ficha
                </button>
              </div>
            )}
          </div>

          {/* Lista de observaciones */}

          <div className={`${panelClass} p-5 sm:p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Observaciones de la ficha</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Revisa los hallazgos antes de guardar.
                  </p>
                </div>
              </div>

              <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-sm font-bold tabular-nums">
                {savedObservations.length}
              </span>
            </div>

            {savedObservations.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
                <ClipboardList size={26} className="mx-auto text-muted-foreground/60" />
                <p className="mt-3 text-sm font-semibold">Sin observaciones registradas</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Las observaciones que agregues aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {savedObservations.map((item, index) => (
                  <article
                    key={`${item.code}-${index}`}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                        <AlertTriangle size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary">
                          {item.code}
                        </p>
                        <h3 className="mt-0.5 text-sm font-semibold">
                          {item.description}
                        </h3>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSavedObservations((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        aria-label={`Eliminar observación ${item.code}`}
                        title="Eliminar observación"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-1">{item.plant}</span>
                      <span className="rounded-md bg-muted px-2 py-1">
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={saveReport}
              disabled={duplicateChassis}
              className={`${primaryButtonClass} mt-5 w-full`}
            >
              {editingChassis !== null ? (
                <Check size={17} />
              ) : (
                <BadgeCheck size={17} />
              )}
              {editingChassis !== null ? 'Guardar cambios' : 'Guardar ficha completa'}
            </button>

            {duplicateChassis && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertTriangle size={14} />
                Corrige el chasis antes de guardar.
              </p>
            )}
          </div>
        </section>

        {/* Historial */}

        <section className={`${panelClass} mb-6 overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <History size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Historial de inspecciones</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consulta, actualiza o descarga las fichas registradas.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                aria-label="Buscar ficha"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar chasis, IND, caja o supervisor"
                className={`${inputClass} mt-0 pl-9`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Resultados: <strong className="text-foreground">{filteredHistory.length}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Los datos se mantienen en memoria durante esta sesión.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-muted/60 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Chasis</th>
                  <th className="px-4 py-3.5 font-bold">IND</th>
                  <th className="px-4 py-3.5 font-bold">Código de caja</th>
                  <th className="px-4 py-3.5 font-bold">Supervisor</th>
                  <th className="px-4 py-3.5 font-bold">Fecha</th>
                  <th className="px-4 py-3.5 font-bold">Proceso</th>
                  <th className="px-4 py-3.5 font-bold">Estado</th>
                  <th className="px-5 py-3.5 text-right font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredHistory.map((item) => (
                  <tr key={item.chassis} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-mono font-bold text-primary">
                        {item.chassis}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-muted-foreground">{item.ind}</td>
                    <td className="px-4 py-4 font-mono text-muted-foreground">{item.box || '—'}</td>
                    <td className="px-4 py-4">{item.supervisor || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {item.date
                        ? new Date(`${item.date}T12:00:00`).toLocaleDateString('es-PE')
                        : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md border border-border bg-card px-2 py-1 text-xs font-medium">
                        {item.process}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Check size={14} />
                        Registrado
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreview(item)}
                          aria-label={`Visualizar ficha ${item.chassis}`}
                          title="Ver ficha"
                          className={iconButtonClass}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editReport(item)}
                          aria-label={`Editar ficha ${item.chassis}`}
                          title="Editar ficha"
                          className={iconButtonClass}
                        >
                          <PencilLine size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => exportWorkbook(item, item.observations)}
                          aria-label={`Descargar Excel ${item.chassis}`}
                          title="Descargar Excel"
                          disabled={exporting}
                          className={`${iconButtonClass} hover:border-primary hover:bg-primary hover:text-primary-foreground`}
                        >
                          <Download size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Search size={24} className="mx-auto text-muted-foreground/60" />
                      <p className="mt-3 text-sm font-semibold">No se encontraron fichas</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Prueba con otro chasis, IND, código de caja o supervisor.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Catálogo de referencia */}

        <section className={`${panelClass} hidden p-5 lg:block`}>
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
              <ClipboardList size={19} />
            </div>
            <div>
              <h2 className="font-bold">Catálogo de referencia</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Filtra las categorías para consultar los códigos disponibles.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('Todos')}
              className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                activeSection === 'Todos'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Todas las categorías
            </button>

            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => setActiveSection(section.title)}
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  activeSection === section.title
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Código</th>
                  <th className="px-4 py-2.5 font-semibold">Descripción</th>
                  <th className="px-4 py-2.5 font-semibold">Categoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.code} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">
                      {item.code}
                    </td>
                    <td className="px-4 py-2.5">{item.description}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {filteredItems.length} códigos en la selección actual.
          </p>
        </section>
      </div>

      {/* Vista previa de la ficha */}

      {preview && (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreview(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Vista de ficha
                  </p>
                  <h2 id="preview-title" className="mt-0.5 font-mono text-lg font-bold">
                    Chasis {preview.chassis}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Cerrar vista previa"
                className={iconButtonClass}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-3">
              {[
                ['IND', preview.ind],
                ['Código de caja', preview.box || '—'],
                ['Supervisor', preview.supervisor || '—'],
                ['Proceso', preview.process],
                ['Método', preview.method],
                [
                  'Fecha',
                  preview.date
                    ? new Date(`${preview.date}T12:00:00`).toLocaleDateString('es-PE')
                    : '—',
                ],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 bg-card px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">Detalle de observaciones</h3>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold">
                  {preview.observations.length}
                </span>
              </div>

              {preview.observations.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Esta ficha no tiene observaciones registradas.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {preview.observations.map((observation, index) => (
                    <article
                      key={`${observation.code}-${index}`}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                          <AlertTriangle size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary">
                            {observation.code}
                          </p>
                          <h4 className="mt-0.5 text-sm font-semibold">
                            {observation.description}
                          </h4>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                            {observation.note}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="rounded bg-muted px-2 py-1">
                              {observation.plant}
                            </span>
                            <span className="rounded bg-muted px-2 py-1">
                              Cantidad: {observation.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className={secondaryButtonClass}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={() => editReport(preview)}
                  className={secondaryButtonClass}
                >
                  <PencilLine size={16} />
                  Editar ficha
                </button>

                <button
                  type="button"
                  onClick={() => exportWorkbook(preview, preview.observations)}
                  disabled={exporting}
                  className={primaryButtonClass}
                >
                  <Download size={16} />
                  Descargar Excel
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Notificación */}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-[#103958] px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <Check size={17} className="shrink-0 text-[#F2B827]" />
          <span>{toast}</span>
        </div>
      )}
    </main>
  )
}