
'use client'

import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Check,
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

import { MANUAL_SELECTION, useChecklist } from '@/hooks/useChecklist'

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
   COMPONENTE PRINCIPAL
========================================================= */

export default function Page() {
  const {
    // Catálogo
    allItems,
    filteredItems,
    sections,

    // Datos de la ficha
    metadata,
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
    deleteObservation,

    // Historial y vista previa
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
    handleLogin,
    handleLogout,
    analyze,
    saveObservation,
    editReport,
    cancelEdit,
    saveReport,
    exportReportById,
    exportReportByKey,
  } = useChecklist()

  /* =======================================================
     INTERFAZ
  ======================================================= */

  if (authChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
        <div className={`${panelClass} w-full max-w-md p-6 text-center`}>
          <ClipboardCheck size={30} className="mx-auto text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Verificando sesión de Supabase…
          </p>
        </div>
      </main>
    )
  }

  if (!userEmail) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
        <section className={`${panelClass} w-full max-w-md p-6 sm:p-8`}>
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardCheck size={25} />
          </div>

          <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            RMB SATECI · CALIDAD
          </p>

          <h1 className="mt-1 text-center text-xl font-bold">
            Checklist de inspección
          </h1>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Inicia sesión para acceder a los registros compartidos del equipo.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className={labelClass}>
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                required
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                className={inputClass}
                placeholder="correo@empresa.com"
              />
            </label>

            <label className={labelClass}>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                className={inputClass}
                placeholder="Contraseña"
              />
            </label>

            <button
              type="submit"
              disabled={authSubmitting}
              className={`${primaryButtonClass} w-full`}
            >
              {authSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Las cuentas deben crearse o invitarse desde el panel de Supabase.
            Esta pantalla no permite registros públicos.
          </p>
        </section>

        {toast && (
          <div
            role="status"
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-3 text-sm text-background shadow-lg"
          >
            {toast}
          </div>
        )}
      </main>
    )
  }

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

              <p className="truncate text-[10px] text-muted-foreground">
                Sesión: {userEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                editingId
                  ? exportReportById(editingId)
                  : exportReportByKey()
              }
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

            <button
              type="button"
              onClick={handleLogout}
              className={secondaryButtonClass}
            >
              Cerrar sesión
            </button>
          </div>
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
              Supervisor de calidad <span className="text-destructive">*</span>
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
                  Ya existe una ficha con ese chasis y proceso.
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

                <h2 className="mt-1 text-lg font-bold">
                  Nueva observación
                </h2>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Describe el hallazgo y selecciona el código que mejor lo representa.
                </p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Descripción del hallazgo
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setSuggestions([])
                  setSelected(null)
                  setAnalysisComplete(false)
                }}
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

            {analysisComplete && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">
                    Sugerencias de clasificación
                  </h3>

                  <span className="text-xs text-muted-foreground">
                    Selecciona la que mejor corresponda
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {suggestions.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                      No encontramos coincidencias. Puedes registrar el texto
                      escrito como observación manual.
                    </p>
                  )}

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
                            {match
                              ? `${match.code} · ${match.section}`
                              : 'Registro manual'}
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
                    onClick={() => setSelected(MANUAL_SELECTION)}
                    className={`flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-left text-sm font-semibold transition ${
                      selected === MANUAL_SELECTION
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <Plus size={16} />
                    Ninguna coincide: agregar el texto manualmente
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
                  <h2 className="text-lg font-bold">
                    Observaciones de la ficha
                  </h2>

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
                <ClipboardList
                  size={26}
                  className="mx-auto text-muted-foreground/60"
                />

                <p className="mt-3 text-sm font-semibold">
                  Sin observaciones registradas
                </p>

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
                        onClick={() => deleteObservation(index)}
                        aria-label={`Eliminar observación ${item.code}`}
                        title="Eliminar observación"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-1">
                        {item.plant}
                      </span>

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
              disabled={duplicateChassis || saving}
              className={`${primaryButtonClass} mt-5 w-full`}
            >
              {editingChassis !== null ? (
                <Check size={17} />
              ) : (
                <BadgeCheck size={17} />
              )}

              {saving
                ? 'Guardando en la nube…'
                : editingChassis !== null
                  ? 'Guardar cambios'
                  : 'Guardar ficha completa'}
            </button>

            {duplicateChassis && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertTriangle size={14} />
                Cambia el chasis o el proceso para evitar un conflicto.
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
                <h2 className="text-lg font-bold">
                  Historial de inspecciones
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Consulta, actualiza o descarga las fichas compartidas del equipo.
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
              Resultados:{' '}
              <strong className="text-foreground">
                {filteredHistory.length}
              </strong>
              {loadingHistory ? ' · Sincronizando…' : ''}
            </p>

            <p className="text-xs text-muted-foreground">
              Registros compartidos desde Supabase.
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
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-mono font-bold text-primary">
                        {item.chassis}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono text-muted-foreground">
                      {item.ind}
                    </td>

                    <td className="px-4 py-4 font-mono text-muted-foreground">
                      {item.box || '—'}
                    </td>

                    <td className="px-4 py-4">
                      {item.supervisor || '—'}
                    </td>

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
                        {item.status || 'No revisado'}
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
                          onClick={() => exportReportById(item.id)}
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
                      <Search
                        size={24}
                        className="mx-auto text-muted-foreground/60"
                      />

                      <p className="mt-3 text-sm font-semibold">
                        No se encontraron fichas
                      </p>

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

                    <td className="px-4 py-2.5">
                      {item.description}
                    </td>

                    <td className="px-4 py-2.5 text-muted-foreground">
                      {item.section}
                    </td>
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

                  <h2
                    id="preview-title"
                    className="mt-0.5 font-mono text-lg font-bold"
                  >
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

                  <p className="mt-1 break-words text-sm font-semibold">
                    {value}
                  </p>
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
                  onClick={() => exportReportById(preview.id)}
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
