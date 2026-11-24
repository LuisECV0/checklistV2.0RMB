'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Factory,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { ThemeToggle } from '@/app/theme-toggle'
import {
  buildDashboardMetrics,
  type CountMetric,
  type DashboardFilters,
  type DashboardMetrics,
} from '@/lib/dashboard-analytics'
import { fetchDashboardInspections } from '@/lib/dashboard-data'
import { supabase } from '@/lib/supabase'

const initialFilters: DashboardFilters = {
  startDate: '',
  endDate: '',
  process: '',
  plant: '',
  category: '',
  chassisQuery: '',
}

const numberFormatter = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 0,
})

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('es-PE')
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: number
  detail: string
  icon: typeof ClipboardCheck
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
            {formatNumber(value)}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </article>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function BarList({
  items,
  valueLabel,
}: {
  items: CountMetric[]
  valueLabel: string
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 0)

  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para estos filtros.</p>
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatNumber(item.value)} <span className="text-xs">{valueLabel}</span>
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${item.label}: ${formatNumber(item.value)} ${valueLabel}`}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: `var(--chart-${(index % 5) + 1})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ParetoList({ metrics }: { metrics: DashboardMetrics }) {
  const maxValue = Math.max(...metrics.pareto.map((item) => item.quantity), 0)

  if (!metrics.pareto.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin observaciones para estos filtros.</p>
  }

  return (
    <div className="dashboard-list-scroll max-h-[28rem] space-y-3 overflow-y-auto pr-2">
      {metrics.pareto.map((item, index) => (
        <div
          key={`${item.code}-${item.description}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              <span className="font-mono text-primary">{item.code}</span>
              <span className="text-muted-foreground"> · {item.description}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${maxValue > 0 ? (item.quantity / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold tabular-nums">
              <span className="font-normal text-muted-foreground">Cantidad: </span>
              {formatNumber(item.quantity)}
            </div>
            <div className="text-[11px] tabular-nums text-muted-foreground">
              {item.cumulativePercentage.toFixed(1)}% acumulado
            </div>
          </div>
          <p className="col-span-2 text-[11px] text-muted-foreground">
            Posición {index + 1} · {formatNumber(item.records)} {item.records === 1 ? 'registro' : 'registros'}
          </p>
        </div>
      ))}
    </div>
  )
}

function ChassisResults({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  return (
    <div className="space-y-3">
      {metrics.inspections.map((inspection) => (
        <details
          key={inspection.id}
          className="group rounded-lg border border-border bg-background/40"
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <ClipboardCheck size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-mono font-bold text-primary">{inspection.chassis}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {inspection.process} · {formatDate(inspection.inspection_date)} · {inspection.status}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {getRecordSummary(inspection)}
            </span>
          </summary>
          <div className="border-t border-border px-4 py-3">
            <dl className="mb-3 grid gap-2 text-xs sm:grid-cols-3">
              <div><dt className="text-muted-foreground">IND</dt><dd className="font-medium">{inspection.ind}</dd></div>
              <div><dt className="text-muted-foreground">Supervisor</dt><dd className="font-medium">{inspection.supervisor}</dd></div>
              <div><dt className="text-muted-foreground">Código de caja</dt><dd className="font-medium">{inspection.box_code || '—'}</dd></div>
            </dl>
            {(inspection.inspection_observations ?? []).length ? (
              <div className="space-y-2">
                {(inspection.inspection_observations ?? []).map((observation) => (
                  <div
                    key={observation.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-md bg-muted/50 p-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        <span className="font-mono text-primary">{observation.code_snapshot}</span>
                        {' · '}{observation.description_snapshot}
                      </p>
                      {observation.note && <p className="mt-1 text-muted-foreground">{observation.note}</p>}
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {observation.plant} · cantidad {formatNumber(observation.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Esta inspección no tiene observaciones registradas.</p>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}

function getRecordSummary(inspection: DashboardMetrics['inspections'][number]) {
  const observations = inspection.inspection_observations ?? []
  const quantity = observations.reduce((total, observation) => total + observation.quantity, 0)
  return `${formatNumber(observations.length)} registros · ${formatNumber(quantity)} unidades observadas`
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </label>
  )
}

export function QualityDashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authError, setAuthError] = useState('')
  const [inspections, setInspections] = useState<Awaited<ReturnType<typeof fetchDashboardInspections>>>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setAuthError('')
        setSession(nextSession)
      }
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthError('')
        setSession(data.session)
      }
      setAuthChecking(false)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id ?? null

  useEffect(() => {
    let active = true

    if (!userId) {
      setInspections([])
      setLoadedCount(0)
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    setLoadError('')
    setInspections([])
    setLoadedCount(0)

    void fetchDashboardInspections((count) => {
      if (active) setLoadedCount(count)
    })
      .then((rows) => {
        if (active) setInspections(rows)
      })
      .catch((error: unknown) => {
        if (!active) return
        console.error('Error al cargar los datos del dashboard:', error)
        setLoadError(error instanceof Error ? error.message : 'Error inesperado al cargar los datos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, refreshToken])

  const categories = useMemo(() => {
    const values = new Set<string>()
    for (const inspection of inspections) {
      for (const observation of inspection.inspection_observations ?? []) {
        values.add(observation.observation_catalog?.category ?? 'Sin catálogo')
      }
    }
    return [...values].sort((left, right) => left.localeCompare(right))
  }, [inspections])

  const metrics = useMemo(
    () => buildDashboardMetrics(inspections, filters),
    [inspections, filters],
  )

  const currentRangeInvalid =
    Boolean(filters.startDate && filters.endDate && filters.startDate > filters.endDate)

  const chassisSearchActive = filters.chassisQuery.trim().length > 0
  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => setFilters((current) => ({ ...current, [key]: value }))

  if (authChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Verificando sesión de Supabase…
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
        <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <ShieldCheck size={28} className="mx-auto text-primary" />
          <h1 className="mt-3 text-lg font-bold">Inicia sesión para ver el dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El dashboard usa la sesión y los permisos de lectura actuales de Supabase.
          </p>
          {authError && <p className="mt-3 text-xs text-destructive">{authError}</p>}
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft size={16} /> Ir al inicio de sesión
          </Link>
        </section>
      </main>
    )
  }

  const observationFiltered = Boolean(filters.plant || filters.category)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 size={21} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                RMB SATECI · CALIDAD
              </p>
              <h1 className="truncate font-bold">Panel de calidad</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Checklist</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
              <Factory size={14} /> Analítica de inspecciones
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Indicadores de calidad</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Consulta las inspecciones y observaciones registradas según los filtros seleccionados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshToken((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar datos
          </button>
        </section>

        <Panel
          title="Filtros de consulta"
          subtitle="Ajusta el período y los criterios para revisar los registros que necesitas."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <DateField label="Inspección desde" value={filters.startDate} onChange={(value) => updateFilter('startDate', value)} />
            <DateField label="Inspección hasta" value={filters.endDate} onChange={(value) => updateFilter('endDate', value)} />
            <label className="block min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">Proceso</span>
              <select value={filters.process} onChange={(event) => updateFilter('process', event.target.value)} className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Todos</option>
                <option>Montaje</option>
                <option>Final</option>
                <option>Visto Bueno</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">Planta observada</span>
              <select value={filters.plant} onChange={(event) => updateFilter('plant', event.target.value)} className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Todas</option>
                <option>Planta 2</option>
                <option>Planta 3</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">Categoría</span>
              <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Todas</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">Buscar por chasis</span>
              <span className="relative mt-1 block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={filters.chassisQuery}
                  onChange={(event) => updateFilter('chassisQuery', event.target.value)}
                  placeholder="Chasis parcial o completo"
                  className="block w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm"
                />
              </span>
            </label>
          </div>
          {currentRangeInvalid && (
            <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={16} /> La fecha inicial no puede ser posterior a la fecha final.
            </p>
          )}
        </Panel>

        {loading && (
          <div className="rounded-lg border border-primary/20 bg-secondary/60 px-4 py-3 text-sm text-primary">
            Cargando inspecciones y observaciones… {formatNumber(loadedCount)} inspecciones recibidas.
          </div>
        )}
        {loadError && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        )}
        {authError && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            No se pudo verificar la sesión: {authError}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Inspecciones" value={currentRangeInvalid ? 0 : metrics.inspectionCount} detail="Registros dentro de los filtros seleccionados" icon={ClipboardCheck} />
          <MetricCard label="Chasis únicos" value={currentRangeInvalid ? 0 : metrics.uniqueUnitCount} detail={observationFiltered ? 'Chasis con observaciones que coinciden con los filtros' : 'Vehículos distintos dentro del período'} icon={Factory} />
          <MetricCard label="Cantidad observada" value={currentRangeInvalid ? 0 : metrics.observationQuantity} detail={`${formatNumber(metrics.observationRecordCount)} registros de observación`} icon={Activity} />
          <MetricCard label="Inspecciones finalizadas" value={currentRangeInvalid ? 0 : (metrics.statusCounts.find((item) => item.label === 'Finalizado')?.value ?? 0)} detail="Registros cuyo estado es “Finalizado”" icon={ShieldCheck} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Pareto de observaciones por código PE"
            subtitle="Ordenado de mayor a menor por cantidad. El acumulado muestra qué proporción del total filtrado representan esta observación y las anteriores; se calcula sobre cantidades, no sobre registros. Se conserva la descripción registrada en cada inspección."
          >
            <ParetoList metrics={metrics} />
          </Panel>
          <div className="grid gap-6">
            <Panel title="Inspecciones por proceso" subtitle="Cantidad de inspecciones registradas en cada proceso.">
              <BarList items={metrics.processCounts} valueLabel="inspecciones" />
            </Panel>
            <Panel title="Cantidad observada por planta" subtitle="Suma de las cantidades registradas en las observaciones de cada planta.">
              <BarList items={metrics.plantQuantities} valueLabel="cantidad" />
            </Panel>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Cantidad observada por categoría" subtitle="Suma de las cantidades registradas en cada categoría.">
            <BarList items={metrics.categoryQuantities} valueLabel="cantidad" />
          </Panel>
          <Panel title="Inspecciones según estado" subtitle="Distribución de los registros por su estado actual.">
            <BarList items={metrics.statusCounts} valueLabel="inspecciones" />
          </Panel>
        </section>

        <Panel title="Detalle por chasis" subtitle="Busca un chasis para consultar sus inspecciones y observaciones por separado.">
          {!chassisSearchActive ? (
            <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Search size={16} /> Escribe un chasis en el filtro superior para ver sus inspecciones y observaciones.
            </p>
          ) : metrics.inspections.length ? (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                {formatNumber(metrics.inspections.length)} inspecciones coincidentes
              </p>
              <ChassisResults metrics={metrics} />
            </>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">No se encontraron inspecciones para ese chasis y los filtros seleccionados.</p>
          )}
        </Panel>

        <footer className="flex flex-wrap items-center justify-between gap-2 pb-4 text-xs text-muted-foreground">
          <span>{formatNumber(inspections.length)} inspecciones disponibles.</span>
          <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> El período se basa en la fecha de inspección.</span>
        </footer>
      </div>
    </main>
  )
}
