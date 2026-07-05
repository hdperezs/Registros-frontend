import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import NuevoTramiteModal from '../components/NuevoTramiteModal.jsx'
import EditarTramiteModal from '../components/EditarTramiteModal.jsx'
import { getEmpresa, getTramitesDeEmpresa } from '../api.js'
import { tagClass, categoriaLabel, formatFecha } from '../utils.js'

export default function EmpresaDetail() {
  const { id } = useParams()
  const [empresa, setEmpresa] = useState(null)
  const [tramites, setTramites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [tramiteEditando, setTramiteEditando] = useState(null)

  function cargar() {
    setLoading(true)
    Promise.all([getEmpresa(id), getTramitesDeEmpresa(id)])
      .then(([e, t]) => {
        setEmpresa(e)
        setTramites(t)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const vigentes = tramites.filter((t) => t.estado === 'vigente' || t.estado === 'en_tramite').length
  const porVencer = tramites.filter((t) => t.estado === 'por_vencer' || t.estado === 'vencido').length

  return (
    <div className="shell">
      <Sidebar active="dashboard" />
      <main className="main">
        <Link to="/" className="crumb">
          Dashboard <span style={{ color: 'var(--line)' }}>/</span>{' '}
          <span style={{ color: 'var(--ink)' }}>{empresa?.nombre || '...'}</span>
        </Link>

        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && empresa && (
          <>
            <div className="co-head">
              <div>
                <h1 style={{ fontSize: 26, marginBottom: 6 }}>{empresa.nombre}</h1>
                <div className="co-meta">
                  {empresa.nit && <span>NIT {empresa.nit}</span>}
                  {empresa.contacto_email && <span>{empresa.contacto_email}</span>}
                  {empresa.contacto_telefono && <span>{empresa.contacto_telefono}</span>}
                </div>
              </div>
              <button className="btn-primary" onClick={() => setMostrarModal(true)}>
                + Nuevo trámite
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="lbl">Trámites totales</div>
                <div className="val">{tramites.length}</div>
              </div>
              <div className="stat ok">
                <div className="lbl">Vigentes / en trámite</div>
                <div className="val">{vigentes}</div>
              </div>
              <div className="stat crit">
                <div className="lbl">Por vencer / vencidos</div>
                <div className="val">{porVencer}</div>
              </div>
            </div>

            <div className="section-label">Historial de trámites</div>
            <div className="table-wrap">
              <div className="t-head" style={{ gridTemplateColumns: '2.3fr 1fr 1fr' }}>
                <span>TRÁMITE</span>
                <span>CATEGORÍA</span>
                <span>ESTADO</span>
              </div>

              {tramites.length === 0 && (
                <div className="empty-state">
                  Esta empresa todavía no tiene trámites registrados. Crea el primero con "+ Nuevo trámite".
                </div>
              )}

              {tramites.map((t) => (
                <div
                  key={t.id}
                  className="t-row"
                  style={{ gridTemplateColumns: '2.3fr 1fr 1fr' }}
                  onClick={() => setTramiteEditando(t)}
                >
                  <div>
                    <div className="co">{t.tramite_nombre}</div>
                    {t.numero_expediente && <div className="co-sub">{t.numero_expediente}</div>}
                  </div>
                  <div>
                    <span className={tagClass(t.categoria)}>{categoriaLabel(t.categoria)}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {t.fecha_vencimiento ? formatFecha(t.fecha_vencimiento) : 'Sin vencimiento'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {mostrarModal && (
        <NuevoTramiteModal
          empresaId={id}
          onClose={() => setMostrarModal(false)}
          onCreated={() => {
            setMostrarModal(false)
            cargar()
          }}
        />
      )}

      {tramiteEditando && (
        <EditarTramiteModal
          tramite={tramiteEditando}
          onClose={() => setTramiteEditando(null)}
          onUpdated={() => {
            setTramiteEditando(null)
            cargar()
          }}
          onDeleted={() => {
            setTramiteEditando(null)
            cargar()
          }}
        />
      )}
    </div>
  )
}
