import { useEffect, useState } from 'react'
import { getTiposTramite, createTramite } from '../api.js'
import { categoriaLabel } from '../utils.js'

const CATEGORIAS = ['ambiente', 'farma', 'alimentos', 'sso', 'otros']

export default function NuevoTramiteModal({ empresaId, onClose, onCreated }) {
  const [categoria, setCategoria] = useState('alimentos')
  const [tipos, setTipos] = useState([])
  const [tipoId, setTipoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10))
  const [numeroExpediente, setNumeroExpediente] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getTiposTramite(categoria)
      .then((data) => {
        setTipos(data)
        setTipoId(data[0]?.id || '')
      })
      .catch(() => setTipos([]))
  }, [categoria])

  const tipoSeleccionado = tipos.find((t) => t.id === tipoId)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!tipoId) {
      setError('Selecciona un tipo de trámite')
      return
    }
    setSaving(true)
    try {
      await createTramite({
        empresa_cliente_id: empresaId,
        tipo_tramite_id: tipoId,
        fecha_inicio: fechaInicio,
        numero_expediente: numeroExpediente || null,
        notas: notas || null,
      })
      onCreated()
    } catch (err) {
      setError(err.message || 'No se pudo crear el trámite')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 style={{ fontSize: 19 }}>Nuevo trámite</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">{error}</div>}

            <div className="field">
              <label>Categoría</label>
              <div className="filters" style={{ marginBottom: 0 }}>
                {CATEGORIAS.map((c) => (
                  <div
                    key={c}
                    className={`chip ${categoria === c ? 'active' : ''}`}
                    onClick={() => setCategoria(c)}
                  >
                    {categoriaLabel(c)}
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Tipo de trámite</label>
              <select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
                {tipos.length === 0 && <option value="">No hay trámites en esta categoría</option>}
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} {t.tipo_gestion ? `— ${t.tipo_gestion}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>N° de expediente (opcional)</label>
              <input
                type="text"
                value={numeroExpediente}
                onChange={(e) => setNumeroExpediente(e.target.value)}
                placeholder="DRCA-XXXX-2026"
              />
            </div>

            <div className="field">
              <label>Fecha de inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>

            {tipoSeleccionado?.vigencia_meses ? (
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--seal-green)', marginBottom: 16 }}>
                Vigencia estándar: {tipoSeleccionado.vigencia_meses} meses — el vencimiento se calcula
                automáticamente
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 16 }}>
                Este tipo de trámite no tiene vigencia fija definida en el catálogo
              </div>
            )}

            <div className="field">
              <label>Notas (opcional)</label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creando...' : 'Crear trámite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
