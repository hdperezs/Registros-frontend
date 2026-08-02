import { useEffect, useRef, useState } from 'react'
import { updateTramite, deleteTramite, getGestores, getAuditoriaTramite } from '../api.js'
import { categoriaLabel, sumarMeses } from '../utils.js'
import { useUser } from '../context/UserContext.jsx'
import ReparosSection from './ReparosSection.jsx'
import DocumentosSection from './DocumentosSection.jsx'

const CATEGORIAS_CON_REPARO = ['alimentos', 'farma', 'otros']

const ESTADOS = ['en_tramite', 'vigente', 'por_vencer', 'vencido', 'renovacion_en_curso']

const RESOLUCIONES = ['aprobado', 'baja', 'finalizado', 'pendiente']
const RESOLUCION_LABELS = {
  aprobado: 'Aprobado',
  baja: 'Baja',
  finalizado: 'Finalizado',
  pendiente: 'Pendiente',
}

const ESTADO_LABELS = {
  en_tramite: 'En trámite',
  vigente: 'Vigente',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  renovacion_en_curso: 'Renovación en curso',
}

const CAMPO_LABELS = {
  numero_expediente: 'N° de expediente',
  fecha_inicio: 'Fecha de inicio',
  fecha_vencimiento: 'Fecha de vencimiento',
  estado: 'Estado',
  asignado_a: 'Asignado a',
  notas: 'Notas',
  fecha_paso_firma: 'Paso a firma',
  fecha_salida_mensajeria: 'Salida a mensajería',
  fecha_ingreso: 'Ingreso al ministerio',
  resolucion_final: 'Resolución final',
  fecha_ingreso_instrumento: 'Ingreso de instrumento a MARN',
  fecha_resolucion_aprobatoria: 'Resolución aprobatoria',
  fecha_presentacion_solicitud: 'Presentación de solicitud de licencia',
  fecha_retiro_licencia: 'Retiro de licencia ambiental',
  anticipo: 'Anticipo',
  complemento: 'Complemento',
  fecha_emision_licencia: 'Fecha de emisión de licencia',
  anios_licencia: 'Años pagados',
  reparo_1: 'Reparo N° 1',
  reparo_2: 'Reparo N° 2',
  reparo_3: 'Reparo N° 3',
  eliminado: 'Trámite eliminado',
}

function formatearValorAuditoria(campo, valor) {
  if (!valor || valor === 'None') return '(vacío)'
  if (campo === 'estado') return ESTADO_LABELS[valor] || valor
  return valor
}

export default function EditarTramiteModal({ tramite: tramiteInicial, onClose, onUpdated, onDeleted }) {
  const { user } = useUser()
  const [tramite, setTramite] = useState(tramiteInicial)
  const [numeroExpediente, setNumeroExpediente] = useState(tramite.numero_expediente || '')
  const [fechaInicio, setFechaInicio] = useState(tramite.fecha_inicio)
  const [fechaVencimiento, setFechaVencimiento] = useState(tramite.fecha_vencimiento || '')
  const [estado, setEstado] = useState(tramite.estado)
  const [checklist, setChecklist] = useState(tramite.checklist || [])
  const [gestores, setGestores] = useState([])
  const [asignadoA, setAsignadoA] = useState(tramite.asignado_a || '')
  const [fechaPasoFirma, setFechaPasoFirma] = useState(tramite.fecha_paso_firma || '')
  const [fechaSalidaMensajeria, setFechaSalidaMensajeria] = useState(tramite.fecha_salida_mensajeria || '')
  const [fechaIngreso, setFechaIngreso] = useState(tramite.fecha_ingreso || '')
  const [resolucionFinal, setResolucionFinal] = useState(tramite.resolucion_final || '')
  const [fechaIngresoInstrumento, setFechaIngresoInstrumento] = useState(tramite.fecha_ingreso_instrumento || '')
  const [fechaResolucionAprobatoria, setFechaResolucionAprobatoria] = useState(tramite.fecha_resolucion_aprobatoria || '')
  const [fechaPresentacionSolicitud, setFechaPresentacionSolicitud] = useState(tramite.fecha_presentacion_solicitud || '')
  const [fechaRetiroLicencia, setFechaRetiroLicencia] = useState(tramite.fecha_retiro_licencia || '')
  const [anticipo, setAnticipo] = useState(tramite.anticipo || '')
  const [complemento, setComplemento] = useState(tramite.complemento || '')
  const [fechaEmisionLicencia, setFechaEmisionLicencia] = useState(tramite.fecha_emision_licencia || '')
  const [aniosLicencia, setAniosLicencia] = useState(tramite.anios_licencia || '')
  const [vencimientoManualAmbiente, setVencimientoManualAmbiente] = useState(!!tramite.fecha_vencimiento)
  const [auditoria, setAuditoria] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [error, setError] = useState('')
  const enviando = useRef(false)

  const tieneReparos = CATEGORIAS_CON_REPARO.includes(tramite.categoria)
  const esAmbiente = tramite.categoria === 'ambiente'

  useEffect(() => {
    getGestores()
      .then(setGestores)
      .catch(() => setGestores([]))
    getAuditoriaTramite(tramite.id)
      .then(setAuditoria)
      .catch(() => setAuditoria([]))
  }, [tramite.id])

  function toggleChecklistItem(idx) {
    setChecklist((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, completado: !item.completado } : item))
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (enviando.current) return
    enviando.current = true
    setError('')
    setSaving(true)
    try {
      const actualizado = await updateTramite(tramite.id, {
        numero_expediente: numeroExpediente || null,
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVencimiento || null,
        estado,
        checklist,
        asignado_a: asignadoA || null,
        fecha_paso_firma: fechaPasoFirma || null,
        fecha_salida_mensajeria: fechaSalidaMensajeria || null,
        fecha_ingreso: fechaIngreso || null,
        resolucion_final: resolucionFinal || null,
        fecha_ingreso_instrumento: fechaIngresoInstrumento || null,
        fecha_resolucion_aprobatoria: fechaResolucionAprobatoria || null,
        fecha_presentacion_solicitud: fechaPresentacionSolicitud || null,
        fecha_retiro_licencia: fechaRetiroLicencia || null,
        anticipo: anticipo || null,
        complemento: complemento || null,
        fecha_emision_licencia: fechaEmisionLicencia || null,
        anios_licencia: aniosLicencia ? Number(aniosLicencia) : null,
      })
      setTramite(actualizado)
      onUpdated()
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el trámite')
      enviando.current = false
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTramite(tramite.id)
      onDeleted()
    } catch (err) {
      setError(err.message || 'No se pudo borrar el trámite')
      setDeleting(false)
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: 19 }}>{tramite.tramite_nombre}</h2>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
              {categoriaLabel(tramite.categoria)}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">{error}</div>}

            <div className="field">
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>N° de expediente</label>
              <input
                type="text"
                value={numeroExpediente}
                onChange={(e) => setNumeroExpediente(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Asignado a</label>
              <select value={asignadoA} onChange={(e) => setAsignadoA(e.target.value)}>
                <option value="">Sin asignar</option>
                {gestores.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre} ({g.rol})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Fecha de inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Fecha de vencimiento</label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => {
                    setVencimientoManualAmbiente(true)
                    setFechaVencimiento(e.target.value)
                  }}
                />
              </div>
            </div>

            {tieneReparos && (
              <>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
                  FLUJO DEL EXPEDIENTE
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Paso a firma</label>
                    <input type="date" value={fechaPasoFirma} onChange={(e) => setFechaPasoFirma(e.target.value)} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Salida a mensajería</label>
                    <input
                      type="date"
                      value={fechaSalidaMensajeria}
                      onChange={(e) => setFechaSalidaMensajeria(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Ingreso al ministerio</label>
                    <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
                  </div>
                </div>

                <div className="field">
                  <label>Resolución final</label>
                  <select value={resolucionFinal} onChange={(e) => setResolucionFinal(e.target.value)}>
                    <option value="">Sin resolución todavía</option>
                    {RESOLUCIONES.map((r) => (
                      <option key={r} value={r}>
                        {RESOLUCION_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <ReparosSection tramite={tramite} onChange={(actualizado) => setTramite(actualizado)} />
              </>
            )}

            {esAmbiente && (
              <>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
                  VIGENCIA DE LA LICENCIA
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Fecha de emisión de licencia</label>
                    <input
                      type="date"
                      value={fechaEmisionLicencia}
                      onChange={(e) => {
                        const nuevaFecha = e.target.value
                        setFechaEmisionLicencia(nuevaFecha)
                        if (!vencimientoManualAmbiente && nuevaFecha && aniosLicencia) {
                          setFechaVencimiento(sumarMeses(nuevaFecha, Number(aniosLicencia) * 12))
                        }
                      }}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Años pagados</label>
                    <select
                      value={aniosLicencia}
                      onChange={(e) => {
                        const nuevosAnios = e.target.value
                        setAniosLicencia(nuevosAnios)
                        if (!vencimientoManualAmbiente && fechaEmisionLicencia && nuevosAnios) {
                          setFechaVencimiento(sumarMeses(fechaEmisionLicencia, Number(nuevosAnios) * 12))
                        }
                      }}
                    >
                      <option value="">Selecciona...</option>
                      <option value="1">1 año</option>
                      <option value="2">2 años</option>
                      <option value="3">3 años</option>
                      <option value="4">4 años</option>
                      <option value="5">5 años</option>
                    </select>
                  </div>
                </div>
                {!vencimientoManualAmbiente && fechaEmisionLicencia && aniosLicencia && (
                  <p className="mono" style={{ fontSize: 10.5, color: 'var(--seal-green)', margin: '-6px 0 10px' }}>
                    Vencimiento calculado automáticamente arriba, en "Fecha de vencimiento"
                  </p>
                )}

                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
                  FLUJO DEL INSTRUMENTO/LICENCIA (MARN)
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Ingreso de instrumento a MARN</label>
                    <input
                      type="date"
                      value={fechaIngresoInstrumento}
                      onChange={(e) => setFechaIngresoInstrumento(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Resolución aprobatoria</label>
                    <input
                      type="date"
                      value={fechaResolucionAprobatoria}
                      onChange={(e) => setFechaResolucionAprobatoria(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Presentación de solicitud de licencia</label>
                    <input
                      type="date"
                      value={fechaPresentacionSolicitud}
                      onChange={(e) => setFechaPresentacionSolicitud(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Retiro de licencia ambiental</label>
                    <input
                      type="date"
                      value={fechaRetiroLicencia}
                      onChange={(e) => setFechaRetiroLicencia(e.target.value)}
                    />
                  </div>
                </div>
                <p className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 6 }}>
                  El vencimiento de la licencia se registra arriba, en "Fecha de vencimiento".
                </p>
              </>
            )}

            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
              PAGOS
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Anticipo</label>
                <textarea
                  rows={2}
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                  style={{ resize: 'none' }}
                  placeholder="Ej. Q3495, depósito 138871"
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Complemento</label>
                <textarea
                  rows={2}
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  style={{ resize: 'none' }}
                  placeholder="Ej. Saldo Q1945, pendiente de cobro"
                />
              </div>
            </div>

            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
              DOCUMENTOS
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <DocumentosSection
                  tramite={tramite}
                  tipo="contrasena"
                  label="Contraseña (recibo de ingreso)"
                  onChange={(actualizado) => setTramite(actualizado)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <DocumentosSection
                  tramite={tramite}
                  tipo="licencia"
                  label="Licencia / resolución aprobada"
                  onChange={(actualizado) => setTramite(actualizado)}
                />
              </div>
            </div>

            {checklist.length > 0 && (
              <div className="field">
                <label>Checklist de documentos</label>
                <div className="checklist">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="check-item" onClick={() => toggleChecklistItem(idx)}>
                      <div className={`check-box ${item.completado ? 'done' : ''}`}>
                        {item.completado ? '✓' : ''}
                      </div>
                      <span style={{ color: item.completado ? 'var(--ink)' : 'var(--ink-soft)' }}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="mono"
              style={{ fontSize: 11.5, color: 'var(--ink-soft)', cursor: 'pointer', marginTop: 4 }}
            >
              {mostrarHistorial ? '▾' : '▸'} Historial de cambios ({auditoria.length})
            </div>

            {mostrarHistorial && (
              <div style={{ marginTop: 10, borderTop: '1px dashed var(--line-soft)', paddingTop: 10 }}>
                {auditoria.length === 0 && (
                  <p className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    Sin cambios registrados todavía.
                  </p>
                )}
                {auditoria.map((a, idx) => (
                  <div key={idx} style={{ fontSize: 12.5, marginBottom: 10 }}>
                    <div>
                      <strong>{CAMPO_LABELS[a.campo] || a.campo}</strong>:{' '}
                      {formatearValorAuditoria(a.campo, a.valor_anterior)} →{' '}
                      {formatearValorAuditoria(a.campo, a.valor_nuevo)}
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>
                      {a.usuario_nombre || 'Alguien'} · {new Date(a.creado_en).toLocaleString('es-GT')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
            {user?.rol !== 'admin' ? (
              <span />
            ) : !confirmarBorrado ? (
              <button
                type="button"
                className="btn-ghost"
                style={{ color: 'var(--seal-red)', borderColor: 'var(--seal-red)' }}
                onClick={() => setConfirmarBorrado(true)}
              >
                Borrar trámite
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--seal-red)' }}>¿Seguro?</span>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ color: 'var(--seal-red)', borderColor: 'var(--seal-red)' }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Borrando...' : 'Sí, borrar'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmarBorrado(false)}>
                  Cancelar
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cerrar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
