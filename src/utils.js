export function tagClass(categoria) {
  const map = {
    ambiente: 'tag tag-ambiente',
    farma: 'tag tag-farma',
    alimentos: 'tag tag-alimentos',
    sso: 'tag tag-sso',
    otros: 'tag tag-otros',
  }
  return map[categoria] || 'tag tag-otros'
}

export function categoriaLabel(categoria) {
  const map = {
    ambiente: 'Ambiente',
    farma: 'Farma',
    alimentos: 'Alimentos',
    sso: 'SSO',
    otros: 'Otros',
  }
  return map[categoria] || categoria
}

export function diasRestantes(fechaVencimiento) {
  if (!fechaVencimiento) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const venc = new Date(fechaVencimiento + 'T00:00:00')
  const diff = Math.round((venc - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

export function estadoUrgencia(dias) {
  if (dias === null) return { texto: 'Sin vencimiento', clase: '' }
  if (dias < 0) return { texto: 'Vencido', clase: 'crit' }
  if (dias <= 15) return { texto: `${dias} días`, clase: 'crit' }
  if (dias <= 30) return { texto: `${dias} días`, clase: 'warn' }
  return { texto: `${dias} días`, clase: 'ok' }
}

export function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}
