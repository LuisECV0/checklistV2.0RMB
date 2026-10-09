
'use client'

import { useMemo, useState } from 'react'
import ExcelJS from 'exceljs'
import {
  Check,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'

/* =========================================================
   CATÁLOGO DE OBSERVACIONES
========================================================= */

const sections = [
  {
    id: '01',
    title: 'Eléctrico',
    items: [['PE059', 'Falla eléctrica']],
  },
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
   TIPOS DE DATOS
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
   ESTILOS
========================================================= */

const inputClass =
  'mt-1.5 w-full min-w-0 rounded-xl border border-[#dce5e0] bg-[#fbfcfb] px-3 py-2.5 text-sm font-medium text-[#17211e] outline-none transition focus:border-[#3b8166] focus:ring-2 focus:ring-[#3b8166]/15'

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
    supervisor: 'Carlos Pérez',
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

/* =========================================================
   COORDENADAS DE LA PLANTILLA EXCEL

   Se mantienen las coordenadas indicadas actualmente.
   ========================================================= */

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
  /* Datos de la ficha actual */

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
  const [plant, setPlant] = useState<'Planta 2' | 'Planta 3'>(
    'Planta 2',
  )
  const [quantity, setQuantity] = useState('1')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [savedObservations, setSavedObservations] = useState<
    Observation[]
  >([])

  /* Historial y edición */

  const [history, setHistory] =
    useState<HistoryItem[]>(initialHistory)

  const [preview, setPreview] = useState<HistoryItem | null>(null)

  // Identifica la ficha original cuando estamos editando.
  const [editingChassis, setEditingChassis] = useState<string | null>(
    null,
  )

  /* Interfaz */

  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)
  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('Todos')

  /* =======================================================
     FUNCIONES AUXILIARES
  ======================================================= */

  const setMeta = (key: keyof Metadata, value: string) => {
    setMetadata((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const showToast = (message: string) => {
    setToast(message)

    window.setTimeout(() => {
      setToast('')
    }, 2800)
  }

  /* =======================================================
     CATÁLOGO
  ======================================================= */

  const filteredItems = useMemo(() => {
    const search = query.toLowerCase()

    return allItems.filter(
      (item) =>
        (activeSection === 'Todos' ||
          item.section === activeSection) &&
        `${item.code} ${item.description}`
          .toLowerCase()
          .includes(search),
    )
  }, [activeSection, query])

  /* =======================================================
     HISTORIAL
  ======================================================= */

  const filteredHistory = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) {
      return history
    }

    return history.filter((item) =>
      `${item.chassis} ${item.ind} ${item.box} ${item.supervisor}`
        .toLowerCase()
        .includes(search),
    )
  }, [history, query])

  /* =======================================================
     VALIDAR CHASIS DUPLICADO

     Al editar se excluye la ficha original.
     Así puedes conservar su chasis sin generar una alerta.
  ======================================================= */


  const duplicateChassis =
    metadata.chassis.trim() !== '' &&
    history.some(
      (item) =>
        item.chassis.trim() === metadata.chassis.trim() &&
        (
          editingChassis === null ||
          item.chassis.trim() !== editingChassis.trim()
        ),
    )

  /* =======================================================
     ANALIZAR OBSERVACIÓN

     Por ahora es una simulación.
     Después se podrá conectar un modelo real.
  ======================================================= */

  const analyze = () => {
    if (!note.trim()) {
      return
    }

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

  /* =======================================================
     GUARDAR OBSERVACIÓN
  ======================================================= */

  const saveObservation = () => {
    if (!selected || !note.trim() || !metadata.chassis) {
      return
    }

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

    setSavedObservations((current) => [
      ...current,
      observation,
    ])

    setNote('')
    setSuggestions([])
    setSelected(null)

    showToast('Observación guardada correctamente')
  }

  /* =======================================================
     EDITAR FICHA

     Carga los datos y observaciones de la ficha elegida.
  ======================================================= */

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

    setSavedObservations(
      item.observations.map((observation) => ({
        ...observation,
      })),
    )

    setNote('')
    setSuggestions([])
    setSelected(null)
    setPlant('Planta 2')
    setQuantity('1')
    setPreview(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    showToast(`Ficha ${item.chassis} cargada para edición`)
  }

  /* =======================================================
     CANCELAR EDICIÓN
  ======================================================= */

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

  /* =======================================================
     GUARDAR O ACTUALIZAR FICHA
  ======================================================= */


  const saveReport = () => {
    const chassis = metadata.chassis.trim()
    const ind = metadata.ind.trim()

    if (!chassis || !ind) {
      showToast('Completa IND y número de chasis para guardar')
      return
    }

    // Solo bloquear si el chasis pertenece a OTRA ficha.
    if (duplicateChassis) {
      showToast('Error: este chasis ya está registrado')
      return
    }

    const report: HistoryItem = {
      ...metadata,
      chassis,
      ind,
      observations: savedObservations.map((observation) => ({
        ...observation,
      })),
    }

    if (editingChassis !== null) {
      // Actualizar la ficha original, sin crear otra.
      setHistory((current) =>
        current.map((item) =>
          item.chassis.trim() === editingChassis.trim()
            ? report
            : item,
        ),
      )

      setEditingChassis(null)
      showToast('Ficha actualizada correctamente')
    } else {
      // Crear una ficha nueva.
      setHistory((current) => [report, ...current])
      showToast('Ficha guardada correctamente')
    }
  }

  /* =======================================================
     EXPORTAR EXCEL

     Las coordenadas se mantienen como están definidas arriba.
     Las observaciones se reciben como parámetro para garantizar
     que se descarguen las de la ficha seleccionada.
  ======================================================= */

  async function exportWorkbook(
    report: Metadata,
    observations: Observation[] = savedObservations,
  ) {
    if (exporting) {
      return
    }

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

      /* Datos generales */

      sheet.getCell(EXCEL_CELLS.dateHeader).value = report.date
        ? new Date(`${report.date}T12:00:00`)
        : ''

      sheet.getCell(EXCEL_CELLS.ind).value = report.ind

      sheet.getCell(EXCEL_CELLS.supervisor).value =
        report.supervisor

      sheet.getCell(EXCEL_CELLS.chassis).value = report.chassis

      sheet.getCell(EXCEL_CELLS.box).value = report.box

      sheet.getCell(EXCEL_CELLS.date).value = report.date
        ? new Date(`${report.date}T12:00:00`)
        : ''

      sheet.getCell(EXCEL_CELLS.process).value = report.process

      sheet.getCell(EXCEL_CELLS.method).value = report.method

      /* Observaciones */

      sheet.getCell(EXCEL_CELLS.observations).value = observations
        .map(
          (item) =>
            `${item.code} — ${item.description}: ${item.note} (Cantidad: ${item.quantity}) [${item.plant}]`,
        )
        .join('\n')

      /* Generar archivo */

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

      // Dar tiempo al navegador para iniciar la descarga.
      window.setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)

      showToast('Excel descargado correctamente')
    } catch (error) {
      console.error('Error al generar Excel:', error)
      showToast('No se pudo generar el Excel')
    } finally {
      setExporting(false)
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f6] text-[#17211e]">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-[#dce5e0] bg-[#f5f7f6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#173d32] text-white">
              <FileSpreadsheet />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-[#6e7d76]">
                Calidad · Open
              </p>

              <h1 className="truncate text-lg font-bold tracking-tight">
                Checklist de inspección
              </h1>
            </div>
          </div>

          <button
            onClick={() =>
              exportWorkbook(metadata, savedObservations)
            }
            disabled={exporting}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#ef8b4e] px-3 py-2.5 text-sm font-bold text-[#29170d] shadow-sm hover:bg-[#e77d3e] disabled:opacity-60"
          >
            <Download />

            <span className="hidden sm:inline">
              {exporting ? 'Preparando…' : 'Descargar Excel'}
            </span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* PRESENTACIÓN */}

        <section className="mb-6 overflow-hidden rounded-3xl bg-[#173d32] p-6 text-white shadow-lg sm:p-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d9eee5]">
              <Sparkles />
              Captura solo lo que requiere atención
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Registra observaciones sin llenar casillas innecesarias.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#c0d6cd]">
              Analiza una nota, confirma la coincidencia y guarda
              únicamente lo que requiere atención.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">
                {savedObservations.length}
              </p>
              <p className="text-xs text-[#c0d6cd]">
                observaciones nuevas
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">
                {allItems.length}
              </p>
              <p className="text-xs text-[#c0d6cd]">
                puntos disponibles
              </p>
            </div>
          </div>
        </section>

        {/* DATOS DEL REPORTE */}

        <section className="mb-6 rounded-2xl border border-[#dce5e0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">Datos del reporte</h2>
              <p className="text-sm text-[#6e7d76]">
                Identifica la unidad antes de registrar observaciones.
              </p>
            </div>

            <span className="rounded-full bg-[#eaf3ef] px-3 py-1 text-xs font-bold text-[#28604d]">
              Versión 03
            </span>
          </div>

          {editingChassis !== null && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#9db8aa] bg-[#eaf3ef] p-3">
              <p className="text-sm font-semibold text-[#173d32]">
                <Pencil className="mr-2 inline size-4" />
                Editando ficha del chasis {editingChassis}
              </p>

              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-[#9db8aa] bg-white px-3 py-2 text-xs font-bold text-[#28604d] hover:bg-[#f5f7f6]"
              >
                Cancelar edición
              </button>
            </div>
          )}

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              IND
              <input
                inputMode="numeric"
                maxLength={4}
                value={metadata.ind}
                onChange={(e) =>
                  setMeta(
                    'ind',
                    e.target.value.replace(/\D/g, '').slice(0, 4),
                  )
                }
                placeholder="0000"
                className={inputClass}
              />
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              Sup. de calidad
              <input
                value={metadata.supervisor}
                onChange={(e) =>
                  setMeta('supervisor', e.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              N.º de chasis
              <input
                inputMode="numeric"
                maxLength={6}
                value={metadata.chassis}
                onChange={(e) =>
                  setMeta(
                    'chassis',
                    e.target.value.replace(/\D/g, '').slice(0, 6),
                  )
                }
                placeholder="000000"
                className={`${inputClass} ${
                  duplicateChassis
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
                    : ''
                }`}
              />

              {duplicateChassis && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  ⚠️ Este chasis ya está registrado en otra ficha.
                  No podrás guardar hasta corregirlo.
                </p>
              )}
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              Código de caja
              <input
                maxLength={7}
                value={metadata.box}
                onChange={(e) =>
                  setMeta(
                    'box',
                    e.target.value
                      .toUpperCase()
                      .replace(/[^0-9A-Z-]/g, '')
                      .slice(0, 7),
                  )
                }
                placeholder="0000-XX"
                className={inputClass}
              />
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              Tipo de proceso
              <select
                value={metadata.process}
                onChange={(e) =>
                  setMeta('process', e.target.value)
                }
                className={inputClass}
              >
                <option>Montaje</option>
                <option>Final</option>
                <option>Visto Bueno</option>
              </select>
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              Tipo de inspección
              <select
                value={metadata.method}
                onChange={(e) =>
                  setMeta('method', e.target.value)
                }
                className={inputClass}
              >
                <option>No definido</option>
                <option>Visual</option>
                <option>Fin</option>
                <option>Pruebas</option>
              </select>
            </label>

            <label className="min-w-0 text-xs font-semibold text-[#53625b]">
              Fecha
              <input
                type="date"
                value={metadata.date}
                onChange={(e) =>
                  setMeta('date', e.target.value)
                }
                className={inputClass}
              />
            </label>
          </div>
        </section>

        {/* CAPTURA DE OBSERVACIONES */}

        <section className="mb-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">

          {/* NUEVA OBSERVACIÓN */}

          <div className="min-w-0 rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6e7d76]">
                  Llenado asistido
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Nueva observación
                </h2>

                <p className="mt-1 text-sm text-[#6e7d76]">
                  Describe lo que encontraste y confirma la mejor
                  coincidencia.
                </p>
              </div>

              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf3ef] text-[#28604d]">
                <Sparkles />
              </div>
            </div>

            <label className="mt-5 block text-sm font-bold text-[#53625b]">
              ¿Qué observaste?
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Se observa accesorio flojo en la zona lateral…"
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </label>

            <button
              onClick={analyze}
              disabled={!note.trim() || analyzing}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#173d32] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#28604d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? 'Analizando…' : 'Analizar observación'}
              <ChevronDown className="rotate-[-90deg]" />
            </button>

            {suggestions.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#dce5e0] bg-[#f8faf9] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">
                    Elige la coincidencia
                  </p>

                  <span className="text-xs text-[#6e7d76]">
                    mejor a menor coincidencia
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => setSelected(suggestion)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                        selected === suggestion
                          ? 'border-[#3b8166] bg-[#eaf3ef] text-[#173d32]'
                          : 'border-[#dce5e0] bg-white hover:border-[#9db8aa]'
                      }`}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dceee6] text-xs font-black text-[#28604d]">
                        {index + 1}
                      </span>

                      <span className="font-semibold">
                        {suggestion}
                      </span>

                      {selected === suggestion && (
                        <Check className="ml-auto shrink-0 text-[#28604d]" />
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => setSelected('Otra / no coincide')}
                    className={`rounded-xl border border-dashed p-3 text-left text-sm font-semibold ${
                      selected === 'Otra / no coincide'
                        ? 'border-[#3b8166] bg-[#eaf3ef]'
                        : 'border-[#b4c7bd] bg-white'
                    }`}
                  >
                    Ninguna coincide · registrar otra opción
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#53625b]">
                    Planta
                    <select
                      value={plant}
                      onChange={(e) =>
                        setPlant(
                          e.target.value as 'Planta 2' | 'Planta 3',
                        )
                      }
                      className={inputClass}
                    >
                      <option>Planta 2</option>
                      <option>Planta 3</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-[#53625b]">
                    Cantidad
                    <input
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value.replace(/\D/g, '').slice(0, 3),
                        )
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <button
                  onClick={saveObservation}
                  disabled={
                    !selected ||
                    !note.trim() ||
                    !metadata.chassis.trim() ||
                    duplicateChassis
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef8b4e] px-4 py-3 text-sm font-black text-[#29170d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus />
                  Guardar observación
                </button>
              </div>
            )}
          </div>

          {/* OBSERVACIONES DE LA FICHA */}

          <div className="min-w-0 rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6e7d76]">
                  Antes de exportar
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Observaciones de esta ficha
                </h2>
              </div>

              <span className="rounded-full bg-[#eaf3ef] px-2.5 py-1 text-xs font-bold text-[#28604d]">
                {savedObservations.length}
              </span>
            </div>

            {savedObservations.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#b4c7bd] bg-[#f8faf9] p-6 text-center text-sm text-[#6e7d76]">
                Aquí aparecerán las observaciones guardadas de la
                unidad.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {savedObservations.map((item, index) => (
                  <div
                    key={`${item.code}-${index}`}
                    className="rounded-xl border border-[#dce5e0] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-black text-[#28604d]">
                          {item.code} · {item.description}
                        </p>

                        <p className="mt-1 text-sm">{item.note}</p>
                      </div>

                      <button
                        onClick={() =>
                          setSavedObservations((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        aria-label="Eliminar observación"
                        className="rounded-lg p-1 text-[#7b8b83] hover:bg-[#f5f7f6]"
                      >
                        <X />
                      </button>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#6e7d76]">
                      {item.plant} · Cantidad {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={saveReport}
              disabled={duplicateChassis}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#3b8166] px-4 py-3 text-sm font-bold text-[#28604d] hover:bg-[#eaf3ef] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check />
              {editingChassis !== null
                ? 'Guardar cambios'
                : 'Guardar ficha completa'}
            </button>

            {duplicateChassis && (
              <p className="mt-2 text-xs text-red-600">
                Corrige el número de chasis antes de guardar.
              </p>
            )}
          </div>
        </section>

        {/* HISTORIAL */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-[#dce5e0] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#e8efeb] p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6e7d76]">
                Historial
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Fichas registradas
              </h2>

              <p className="mt-1 text-sm text-[#6e7d76]">
                Visualiza, edita o descarga una ficha registrada.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82918a]" />

              <input
                aria-label="Buscar ficha"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por chasis, IND, caja o supervisor"
                className="w-full rounded-xl border border-[#dce5e0] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3b8166]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#f8faf9] text-xs uppercase tracking-wide text-[#6e7d76]">
                <tr>
                  <th className="px-5 py-3 font-bold">N.º Chasis</th>
                  <th className="px-4 py-3 font-bold">IND</th>
                  <th className="px-4 py-3 font-bold">Código de caja</th>
                  <th className="px-4 py-3 font-bold">
                    Supervisor de Calidad
                  </th>
                  <th className="px-4 py-3 font-bold">Fecha</th>
                  <th className="px-4 py-3 font-bold">Proceso</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 text-right font-bold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf2ef]">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.chassis}
                    className="hover:bg-[#fbfcfb]"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[#28604d]">
                      {item.chassis}
                    </td>

                    <td className="px-4 py-4 font-mono">
                      {item.ind}
                    </td>

                    <td className="px-4 py-4 font-mono">
                      {item.box}
                    </td>

                    <td className="px-4 py-4">
                      {item.supervisor || '—'}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {item.date
                        ? new Date(
                            `${item.date}T12:00:00`,
                          ).toLocaleDateString('es-PE')
                        : '—'}
                    </td>

                    <td className="px-4 py-4">
                      {item.process}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ef] px-2.5 py-1 text-xs font-bold text-[#28604d]">
                        <Check size={14} />
                        Registrado
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">

                        {/* VER */}

                        <button
                          onClick={() => setPreview(item)}
                          aria-label={`Visualizar ficha ${item.chassis}`}
                          title="Ver ficha"
                          className="rounded-lg border border-[#dce5e0] p-2 text-[#28604d] hover:bg-[#eaf3ef]"
                        >
                          <Eye size={18} />
                        </button>

                        {/* EDITAR */}

                        <button
                          onClick={() => editReport(item)}
                          aria-label={`Editar ficha ${item.chassis}`}
                          title="Editar ficha"
                          className="rounded-lg border border-[#dce5e0] p-2 text-[#28604d] hover:bg-[#eaf3ef]"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* DESCARGAR */}

                        <button
                          onClick={() =>
                            exportWorkbook(item, item.observations)
                          }
                          aria-label={`Descargar Excel ${item.chassis}`}
                          title="Descargar Excel"
                          disabled={exporting}
                          className="rounded-lg bg-[#173d32] p-2 text-white hover:bg-[#28604d] disabled:opacity-50"
                        >
                          <Download size={18} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-[#6e7d76]"
                    >
                      No se encontraron fichas con esos datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CATÁLOGO DE REFERENCIA */}

        <div className="hidden rounded-2xl border border-[#dce5e0] bg-white p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6e7d76]">
            Catálogo de referencia
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.title)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                  activeSection === section.title
                    ? 'border-[#3b8166] bg-[#eaf3ef] text-[#28604d]'
                    : 'border-[#dce5e0] text-[#6e7d76]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          {activeSection !== 'Todos' && (
            <p className="mt-3 text-xs text-[#6e7d76]">
              {filteredItems.length} coincidencias en {activeSection}.
              Se usan para orientar el análisis, no es necesario
              marcarlas todas.
            </p>
          )}
        </div>
      </div>

      {/* VISTA PREVIA */}

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#173d32]/35 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6e7d76]">
                  Vista de ficha
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {preview.chassis}
                </h2>
              </div>

              <button
                onClick={() => setPreview(null)}
                aria-label="Cerrar vista previa"
                className="rounded-lg p-2 hover:bg-[#f5f7f6]"
              >
                <X />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#7b8b83]">IND</p>
                <p className="font-bold">{preview.ind}</p>
              </div>

              <div>
                <p className="text-xs text-[#7b8b83]">
                  Código de caja
                </p>
                <p className="font-bold">{preview.box}</p>
              </div>

              <div>
                <p className="text-xs text-[#7b8b83]">Supervisor</p>
                <p className="font-bold">
                  {preview.supervisor || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#7b8b83]">Proceso</p>
                <p className="font-bold">{preview.process}</p>
              </div>

              <div>
                <p className="text-xs text-[#7b8b83]">Inspección</p>
                <p className="font-bold">{preview.method}</p>
              </div>

              <div>
                <p className="text-xs text-[#7b8b83]">
                  Observaciones
                </p>
                <p className="font-bold">
                  {preview.observations.length}
                </p>
              </div>
            </div>

            {/* DETALLE DE OBSERVACIONES */}

            {preview.observations.length > 0 && (
              <div className="mt-5 border-t border-[#e8efeb] pt-4">
                <h3 className="text-sm font-bold">
                  Detalle de observaciones
                </h3>

                <div className="mt-3 flex max-h-56 flex-col gap-3 overflow-y-auto">
                  {preview.observations.map((observation, index) => (
                    <div
                      key={`${observation.code}-${index}`}
                      className="rounded-xl border border-[#dce5e0] p-3"
                    >
                      <p className="text-xs font-black text-[#28604d]">
                        {observation.code} · {observation.description}
                      </p>

                      <p className="mt-1 text-sm">
                        {observation.note}
                      </p>

                      <p className="mt-2 text-xs text-[#6e7d76]">
                        {observation.plant} · Cantidad{' '}
                        {observation.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => editReport(preview)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3b8166] px-4 py-3 text-sm font-bold text-[#28604d] hover:bg-[#eaf3ef]"
              >
                <Pencil size={18} />
                Editar ficha
              </button>

              <button
                onClick={() =>
                  exportWorkbook(preview, preview.observations)
                }
                disabled={exporting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef8b4e] px-4 py-3 text-sm font-bold text-[#29170d] disabled:opacity-50"
              >
                <Download size={18} />
                Descargar Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE DE ESTADO */}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#173d32] px-4 py-3 text-sm font-bold text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </main>
  )
}