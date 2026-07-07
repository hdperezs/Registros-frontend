import { useEffect, useRef, useState } from 'react'
import { updateTramite, deleteTramite, getGestores, getAuditoriaTramite } from '../api.js'
import { categoriaLabel } from '../utils.js'
import { useUser } from '../context/UserContext.jsx'

const ESTADOS = ['en_tramite', 'vigente', 'por_vencer', 'vencido', 'renovacion_en_curso']

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
}

function formatearValorAuditoria(campo, valor) {
  if (!valor || valor === 'None') return '(vacío)'
  if (campo === 'estado') return ESTADO_LABELS[valor] || valor
  return valor
}

export default function EditarTramiteModal({ tramite, onClose, onUpdated, onDeleted }) {
  const { user } = useUser()
  const [numeroExpediente, setNumeroExpediente] = useState(tramite.numero_expediente || '')
  const [fechaInicio, setFechaInicio] = useState(tramite.fecha_inicio)
  const [fechaVencimiento, setFechaVencimiento] = useState(tramite.fecha_vencimiento || '')
  const [estado, setEstado] = useState(tramite.estado)
  const [checklist, setChecklist] = useState(tramite.checklist || [])
  const [gestores, setGestores] = useState([])
  const [asignadoA, setAsignadoA] = useState(tramite.asignado_a || '')
  const [auditoria, setAuditoria] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [error, setError] = useState('')
  const enviando = useRef(false)

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
      await updateTramite(tramite.id, {
        numero_expediente: numeroExpediente || null,
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVencimiento || null,
        estado,
        checklist,
        asignado_a: asignadoA || null,
      })
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
                  onChange={(e) => setFechaVencimiento(e.target.value)}
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
