import { useState } from 'react'
import { createReparo, updateReparo, deleteReparo } from '../api.js'
import { useUser } from '../context/UserContext.jsx'
import { sumarMeses } from '../utils.js'
import DocumentosSection from './DocumentosSection.jsx'

function ReparoCard({ reparo, tramite, onChange }) {
  const { user } = useUser()
  const [fechaEmision, setFechaEmision] = useState(reparo.fecha_emision || '')
  const [motivo, setMotivo] = useState(reparo.motivo_rechazo || '')
  const [fechaVencimiento, setFechaVencimiento] = useState(reparo.fecha_vencimiento || '')
  const [vencimientoManual, setVencimientoManual] = useState(!!reparo.fecha_vencimiento)
  const [pasoFirma, setPasoFirma] = useState(reparo.fecha_paso_firma_respuesta || '')
  const [salidaMensajeria, setSalidaMensajeria] = useState(reparo.fecha_salida_mensajeria_respuesta || '')
  const [ingreso, setIngreso] = useState(reparo.fecha_ingreso_respuesta || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function guardar() {
    setSaving(true)
    setError('')
    try {
      const actualizado = await updateReparo(reparo.id, {
        fecha_emision: fechaEmision || null,
        motivo_rechazo: motivo || null,
        fecha_vencimiento: fechaVencimiento || null,
        fecha_paso_firma_respuesta: pasoFirma || null,
        fecha_salida_mensajeria_respuesta: salidaMensajeria || null,
        fecha_ingreso_respuesta: ingreso || null,
      })
      onChange(actualizado)
    } catch (err) {
      setError(err.message || 'No se pudo guardar el reparo')
    } finally {
      setSaving(false)
    }
  }

  async function borrar() {
    setSaving(true)
    try {
      const actualizado = await deleteReparo(reparo.id)
      onChange(actualizado)
    } catch (err) {
      setError(err.message || 'No se pudo borrar el reparo')
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 3,
        padding: 16,
        marginBottom: 12,
        background: 'var(--paper)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--seal-red)' }}>
          REPARO N° {reparo.numero}
        </span>
        {user?.rol === 'admin' && (
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: 10.5, padding: '3px 8px', color: 'var(--seal-red)', borderColor: 'var(--seal-red)' }}
            onClick={borrar}
            disabled={saving}
          >
            Borrar
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>Fecha de emisión</label>
          <input
            type="date"
            value={fechaEmision}
            onChange={(e) => {
              const nuevaFecha = e.target.value
              setFechaEmision(nuevaFecha)
              if (!vencimientoManual) {
                setFechaVencimiento(sumarMeses(nuevaFecha, 3))
              }
            }}
          />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>Vence (responder)</label>
          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => {
              setVencimientoManual(true)
              setFechaVencimiento(e.target.value)
            }}
          />
        </div>
      </div>
      {!vencimientoManual && fechaEmision && (
        <p className="mono" style={{ fontSize: 10.5, color: 'var(--seal-green)', margin: '-6px 0 10px' }}>
          Calculado automáticamente: 3 meses desde la emisión
        </p>
      )}

      <div className="field" style={{ marginBottom: 10 }}>
        <label>Motivo del rechazo</label>
        <textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ resize: 'none' }} />
      </div>

      <DocumentosSection
        tramite={tramite}
        tipo="nota_reparo"
        reparoId={reparo.id}
        label="Nota de reparo (documento)"
        onChange={onChange}
      />

      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, letterSpacing: '0.04em' }}>
        RESPUESTA AL REPARO
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>Paso a firma</label>
          <input type="date" value={pasoFirma} onChange={(e) => setPasoFirma(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>Salida mensajería</label>
          <input type="date" value={salidaMensajeria} onChange={(e) => setSalidaMensajeria(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>Ingreso</label>
          <input type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} />
        </div>
      </div>

      <button type="button" className="btn-primary" style={{ fontSize: 11.5, padding: '7px 14px' }} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar reparo'}
      </button>
    </div>
  )
}

export default function ReparosSection({ tramite, onChange }) {
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState('')
  const reparos = tramite.reparos || []
  const siguienteNumero = reparos.length + 1

  async function agregarReparo() {
    if (siguienteNumero > 3) return
    setAgregando(true)
    setError('')
    try {
      const actualizado = await createReparo(tramite.id, { numero: siguienteNumero })
      onChange(actualizado)
    } catch (err) {
      setError(err.message || 'No se pudo agregar el reparo')
    } finally {
      setAgregando(false)
    }
  }

  return (
    <div className="field">
      <label>Reparos ({reparos.length}/3)</label>
      {error && <div className="error-msg">{error}</div>}
      {reparos.map((r) => (
        <ReparoCard key={r.id} reparo={r} tramite={tramite} onChange={onChange} />
      ))}
      {siguienteNumero <= 3 && (
        <button
          type="button"
          className="btn-ghost"
          style={{ fontSize: 12 }}
          onClick={agregarReparo}
          disabled={agregando}
        >
          {agregando ? 'Agregando...' : `+ Registrar reparo N° ${siguienteNumero}`}
        </button>
      )}
    </div>
  )
}
