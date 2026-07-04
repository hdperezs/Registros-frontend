import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import NuevaEmpresaModal from '../components/NuevaEmpresaModal.jsx'
import { getProximosVencer, getEmpresas } from '../api.js'
import { tagClass, categoriaLabel, diasRestantes, estadoUrgencia, formatFecha } from '../utils.js'

const CATEGORIAS = ['ambiente', 'farma', 'alimentos', 'sso', 'otros']

export default function Dashboard() {
  const [tramites, setTramites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoria, setCategoria] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getProximosVencer(90)
      .then(setTramites)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([])
      return
    }
    setBuscando(true)
    const timeout = setTimeout(() => {
      getEmpresas(busqueda)
        .then(setResultados)
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [busqueda])

  const filtrados = useMemo(() => {
    if (categoria === 'todos') return tramites
    return tramites.filter((t) => t.categoria === categoria)
  }, [tramites, categoria])

  const stats = useMemo(() => {
    let semana = 0,
      mes = 0,
      vencidos = 0
    for (const t of tramites) {
      const dias = diasRestantes(t.fecha_vencimiento)
      if (dias === null) continue
      if (dias < 0) vencidos++
      else if (dias <= 7) semana++
      else if (dias <= 30) mes++
    }
    return { semana, mes, vencidos, total: tramites.length }
  }, [tramites])

  return (
    <div className="shell">
      <Sidebar active="dashboard" />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Química Verde S.A. · panel de trámites</div>
            <h1 style={{ fontSize: 26 }}>Lo que vence pronto</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div className="search">
                <input
                  type="text"
                  placeholder="Buscar empresa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              {busqueda.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: 44,
                    right: 132,
                    width: 240,
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    zIndex: 10,
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {buscando && <div style={{ padding: 12, fontSize: 12.5 }}>Buscando...</div>}
                  {!buscando && resultados.length === 0 && (
                    <div style={{ padding: 12, fontSize: 12.5, color: 'var(--ink-soft)' }}>Sin resultados</div>
                  )}
                  {resultados.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => navigate(`/empresas/${e.id}`)}
                      style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--line-soft)' }}
                    >
                      {e.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-primary" onClick={() => setMostrarModal(true)}>
              + Nueva empresa
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat crit">
            <div className="lbl">Vencen esta semana</div>
            <div className="val">{stats.semana}</div>
          </div>
          <div className="stat warn">
            <div className="lbl">Vencen este mes</div>
            <div className="val">{stats.mes}</div>
          </div>
          <div className="stat crit">
            <div className="lbl">Vencidos</div>
            <div className="val">{stats.vencidos}</div>
          </div>
          <div className="stat">
            <div className="lbl">Trámites con vencimiento</div>
            <div className="val">{stats.total}</div>
          </div>
        </div>

        <div className="filters">
          <div className={`chip ${categoria === 'todos' ? 'active' : ''}`} onClick={() => setCategoria('todos')}>
            Todos
          </div>
          {CATEGORIAS.map((c) => (
            <div key={c} className={`chip ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>
              {categoriaLabel(c)}
            </div>
          ))}
        </div>

        {loading && <div className="loading">Cargando trámites...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <div className="t-head">
              <span>EMPRESA</span>
              <span>TRÁMITE</span>
              <span>CATEGORÍA</span>
              <span>VENCE</span>
              <span>ESTADO</span>
            </div>

            {filtrados.length === 0 && (
              <div className="empty-state">No hay trámites con vencimiento próximo en esta categoría.</div>
            )}

            {filtrados.map((t) => {
              const dias = diasRestantes(t.fecha_vencimiento)
              const urgencia = estadoUrgencia(dias)
              return (
                <Link key={t.id} to={`/empresas/${t.empresa_id}`} className="t-row">
                  <div>
                    <div className="co">{t.empresa_nombre}</div>
                    {t.numero_expediente && <div className="co-sub">{t.numero_expediente}</div>}
                  </div>
                  <div>{t.tramite_nombre}</div>
                  <div>
                    <span className={tagClass(t.categoria)}>{categoriaLabel(t.categoria)}</span>
                  </div>
                  <div>{formatFecha(t.fecha_vencimiento)}</div>
                  <div>
                    <span className={`days ${urgencia.clase}`}>{urgencia.texto}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {mostrarModal && (
        <NuevaEmpresaModal
          onClose={() => setMostrarModal(false)}
          onCreated={(empresa) => {
            setMostrarModal(false)
            navigate(`/empresas/${empresa.id}`)
          }}
        />
      )}
    </div>
  )
}
