import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import NuevaEmpresaModal from '../components/NuevaEmpresaModal.jsx'
import { getProximosVencer, getEmpresas, getDashboardResumen, getUsuarios, buscarTramites } from '../api.js'
import { tagClass, categoriaLabel, diasRestantes, estadoUrgencia, formatFecha } from '../utils.js'
import { useUser } from '../context/UserContext.jsx'

const CATEGORIAS = ['ambiente', 'farma', 'alimentos', 'sso', 'otros']
const VENTANAS = [
  { label: '7 días', valor: 7 },
  { label: '30 días', valor: 30 },
  { label: '60 días', valor: 60 },
  { label: '90 días', valor: 90 },
  { label: 'Todos', valor: 3650 },
]

export default function Dashboard() {
  const { user } = useUser()
  const [tramites, setTramites] = useState([])
  const [resumen, setResumen] = useState({ total_empresas: 0, empresas_sin_tramites: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoria, setCategoria] = useState('todos')
  const [ventana, setVentana] = useState(90)
  const [gestores, setGestores] = useState([])
  const [gestorId, setGestorId] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [empresasResultado, setEmpresasResultado] = useState([])
  const [expedientesResultado, setExpedientesResultado] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.rol === 'admin') {
      getUsuarios()
        .then((data) => setGestores(data.filter((u) => u.rol === 'gestor')))
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    Promise.all([getProximosVencer(ventana, gestorId), getDashboardResumen(gestorId)])
      .then(([t, r]) => {
        setTramites(t)
        setResumen(r)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [ventana, gestorId])

  useEffect(() => {
    if (!busqueda.trim() || busqueda.trim().length < 2) {
      setEmpresasResultado([])
      setExpedientesResultado([])
      return
    }
    setBuscando(true)
    const timeout = setTimeout(() => {
      Promise.all([getEmpresas(busqueda), buscarTramites(busqueda)])
        .then(([empresas, expedientes]) => {
          setEmpresasResultado(empresas)
          setExpedientesResultado(expedientes)
        })
        .catch(() => {
          setEmpresasResultado([])
          setExpedientesResultado([])
        })
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

  const hayResultadosBusqueda = empresasResultado.length > 0 || expedientesResultado.length > 0

  return (
    <div className="shell">
      <Sidebar active="dashboard" />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Química Verde S.A. · panel de trámites</div>
            <h1 style={{ fontSize: 26 }}>Lo que vence pronto</h1>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative', flexWrap: 'wrap' }}>
            <div className="search-wrap">
              <div className="search">
                <input
                  type="text"
                  placeholder="Buscar empresa o N° expediente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              {busqueda.trim().length >= 2 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 44,
                    left: 0,
                    width: 'min(300px, calc(100vw - 40px))',
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    zIndex: 10,
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {buscando && <div style={{ padding: 12, fontSize: 12.5 }}>Buscando...</div>}
                  {!buscando && !hayResultadosBusqueda && (
                    <div style={{ padding: 12, fontSize: 12.5, color: 'var(--ink-soft)' }}>Sin resultados</div>
                  )}
                  {!buscando && empresasResultado.length > 0 && (
                    <>
                      <div className="mono" style={{ padding: '8px 14px 4px', fontSize: 10.5, color: 'var(--ink-soft)' }}>
                        EMPRESAS
                      </div>
                      {empresasResultado.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => navigate(`/empresas/${e.id}`)}
                          style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--line-soft)' }}
                        >
                          {e.nombre}
                        </div>
                      ))}
                    </>
                  )}
                  {!buscando && expedientesResultado.length > 0 && (
                    <>
                      <div className="mono" style={{ padding: '8px 14px 4px', fontSize: 10.5, color: 'var(--ink-soft)' }}>
                        EXPEDIENTES
                      </div>
                      {expedientesResultado.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => navigate(`/empresas/${t.empresa_id}`)}
                          style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--line-soft)' }}
                        >
                          <div>{t.numero_expediente}</div>
                          <div className="co-sub">{t.empresa_nombre} — {t.tramite_nombre}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            {user?.rol === 'admin' && (
              <button className="btn-primary" onClick={() => setMostrarModal(true)}>
                + Nueva empresa
              </button>
            )}
          </div>
        </div>

        <div className="stats" style={{ marginBottom: 12 }}>
          <div className="stat">
            <div className="lbl">Empresas en cartera</div>
            <div className="val">{resumen.total_empresas}</div>
          </div>
          <div className="stat warn">
            <div className="lbl">Sin trámites registrados</div>
            <div className="val">{resumen.empresas_sin_tramites}</div>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div className="filters" style={{ marginBottom: 0 }}>
            <div className={`chip ${categoria === 'todos' ? 'active' : ''}`} onClick={() => setCategoria('todos')}>
              Todos
            </div>
            {CATEGORIAS.map((c) => (
              <div key={c} className={`chip ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>
                {categoriaLabel(c)}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {user?.rol === 'admin' && gestores.length > 0 && (
              <select value={gestorId} onChange={(e) => setGestorId(e.target.value)} style={{ maxWidth: 180 }}>
                <option value="">Todos los gestores</option>
                {gestores.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            )}
            <select value={ventana} onChange={(e) => setVentana(Number(e.target.value))} style={{ maxWidth: 140 }}>
              {VENTANAS.map((v) => (
                <option key={v.valor} value={v.valor}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <div className="loading">Cargando trámites...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <div className="t-head" style={{ minWidth: 720 }}>
              <span>EMPRESA</span>
              <span>TRÁMITE</span>
              <span>CATEGORÍA</span>
              <span>VENCE</span>
              <span>ESTADO</span>
              <span>GESTIONADO POR</span>
            </div>

            {filtrados.length === 0 && (
              <div className="empty-state">No hay trámites con vencimiento próximo en esta categoría/ventana.</div>
            )}

            {filtrados.map((t) => {
              const dias = diasRestantes(t.fecha_vencimiento)
              const urgencia = estadoUrgencia(dias)
              return (
                <Link key={t.id} to={`/empresas/${t.empresa_id}`} className="t-row" style={{ minWidth: 720 }}>
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
                  <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {t.asignado_a_nombre || <span style={{ color: 'var(--ink-soft)' }}>Sin asignar</span>}
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
