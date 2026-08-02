import { useRef, useState } from 'react'
import { subirDocumento, borrarDocumento } from '../api.js'
import { useUser } from '../context/UserContext.jsx'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentosSection({ tramite, tipo, reparoId = null, label, onChange }) {
  const { user } = useUser()
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const documentos = (tramite.documentos || []).filter(
    (d) => d.tipo === tipo && (reparoId ? d.reparo_id === reparoId : !d.reparo_id)
  )

  async function handleArchivo(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendo(true)
    setError('')
    try {
      const actualizado = await subirDocumento(tramite.id, tipo, archivo, reparoId)
      onChange(actualizado)
    } catch (err) {
      setError(err.message || 'No se pudo subir el archivo')
    } finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleBorrar(documentoId) {
    try {
      const actualizado = await borrarDocumento(documentoId)
      onChange(actualizado)
    } catch (err) {
      setError(err.message || 'No se pudo borrar el archivo')
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      {error && <div className="error-msg">{error}</div>}

      {documentos.map((d) => (
        <div
          key={d.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 10px',
            border: '1px solid var(--line)',
            borderRadius: 2,
            marginBottom: 6,
            fontSize: 12.5,
          }}
        >
          <a href={d.url_descarga || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--seal-green)', textDecoration: 'none' }}>
            📄 {d.nombre_archivo} <span className="co-sub">{formatBytes(d.tamano_bytes)}</span>
          </a>
          {user?.rol === 'admin' && (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 10, padding: '3px 8px', color: 'var(--seal-red)', borderColor: 'var(--seal-red)' }}
              onClick={() => handleBorrar(d.id)}
            >
              Borrar
            </button>
          )}
        </div>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleArchivo}
        disabled={subiendo}
        style={{ fontSize: 12 }}
      />
      {subiendo && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 8 }}>Subiendo...</span>}
    </div>
  )
}
