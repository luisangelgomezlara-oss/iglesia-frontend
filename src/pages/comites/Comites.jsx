import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function Comites() {
  const [balances, setBalances]   = useState([])
  const [comites, setComites]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [detalle, setDetalle]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [error, setError]         = useState('')
  const [exito, setExito]         = useState('')

  // Gestión de comités
  const [showAdmin, setShowAdmin] = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm] = useState({ nombre: '', responsable: '', activo: true })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resBalance, resComites] = await Promise.all([
        api.get('/balance/general'),
        api.get('/comites')
      ])
      setBalances(resBalance.data.balancePorComite)
      setComites(resComites.data)
    } catch (err) {
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const verDetalle = async (comiteId) => {
    setSelected(comiteId)
    setLoadingDetalle(true)
    try {
      const [resIngresos, resEgresos] = await Promise.all([
        api.get(`/ingresos/comite/${comiteId}`),
        api.get(`/egresos/comite/${comiteId}`)
      ])
      setDetalle({
        ingresos: resIngresos.data,
        egresos:  resEgresos.data
      })
    } catch (err) {
      setError('Error al cargar el detalle')
    } finally {
      setLoadingDetalle(false)
    }
  }

  // ─── CRUD de comités ───────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    try {
      if (editando) {
        await api.put(`/comites/${editando}`, form)
        setExito('Comité actualizado correctamente')
      } else {
        await api.post('/comites', { ...form, activo: true })
        setExito('Comité creado correctamente')
      }
      resetForm()
      cargarDatos()
    } catch (err) {
      setError('Error al guardar el comité')
    }
  }

  const handleEditar = (comite) => {
    setForm({
      nombre: comite.nombre,
      responsable: comite.responsable || '',
      activo: comite.activo
    })
    setEditando(comite.id)
    setShowForm(true)
  }

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Seguro que deseas desactivar este comité? No aparecerá en los formularios de Ingresos/Egresos.')) return
    try {
      await api.delete(`/comites/${id}`)
      setExito('Comité desactivado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al desactivar el comité')
    }
  }

  const handleReactivar = async (comite) => {
    try {
      await api.put(`/comites/${comite.id}`, { ...comite, activo: true })
      setExito('Comité reactivado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al reactivar el comité')
    }
  }

  const resetForm = () => {
    setForm({ nombre: '', responsable: '', activo: true })
    setEditando(null)
    setShowForm(false)
  }

  const comiteSeleccionado = comites.find(c => c.id === selected)
  const balanceSeleccionado = balances.find(b => b.comiteId === selected)

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.centered}><p>Cargando...</p></div>
    </div>
  )

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        <div style={styles.titleRow}>
          <h1 style={styles.pageTitle}>🏛️ Balance por Comités</h1>
          <button
            style={showAdmin ? styles.btnCancelar : styles.btnAdmin}
            onClick={() => { setShowAdmin(!showAdmin); resetForm() }}
          >
            {showAdmin ? '✕ Cerrar Administración' : '⚙️ Administrar Comités'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {exito && <p style={styles.exito}>{exito}</p>}

        {/* ─── PANEL DE ADMINISTRACIÓN ─── */}
        {showAdmin && (
          <div style={styles.adminCard}>

            <div style={styles.adminHeader}>
              <h3 style={styles.adminTitle}>⚙️ Gestión de Comités</h3>
              <button
                style={showForm ? styles.btnCancelar : styles.btnPrimary}
                onClick={() => { resetForm(); setShowForm(!showForm) }}
              >
                {showForm ? '✕ Cancelar' : '➕ Nuevo Comité'}
              </button>
            </div>

            {/* Formulario crear/editar */}
            {showForm && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nombre del Comité *</label>
                    <input
                      style={styles.input}
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Comité de Mantenimiento"
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Responsable</label>
                    <input
                      style={styles.input}
                      type="text"
                      name="responsable"
                      value={form.responsable}
                      onChange={handleChange}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  {editando && (
                    <div style={styles.fieldCheckbox}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="activo"
                          checked={form.activo}
                          onChange={handleChange}
                        />
                        Comité activo
                      </label>
                    </div>
                  )}
                </div>
                <div style={styles.formActions}>
                  <button type="button" style={styles.btnCancelar} onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnGuardar}>
                    {editando ? '💾 Actualizar' : '💾 Crear Comité'}
                  </button>
                </div>
              </form>
            )}

            {/* Tabla de todos los comités */}
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ID','Nombre','Responsable','Estado','Acciones'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comites.map((c, i) => (
                  <tr key={c.id} style={{
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#f0f7ff'
                  }}>
                    <td style={styles.td}>{c.id}</td>
                    <td style={styles.td}><strong>{c.nombre}</strong></td>
                    <td style={styles.td}>{c.responsable || '—'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: c.activo ? '#D4EDDA' : '#FADBD8',
                        color: c.activo ? '#1A7A3C' : '#C0392B'
                      }}>
                        {c.activo ? '✅ Activo' : '🚫 Inactivo'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.btnEditar} onClick={() => handleEditar(c)}>
                        ✏️
                      </button>
                      {c.activo ? (
                        <button style={styles.btnEliminar} onClick={() => handleDesactivar(c.id)}>
                          🚫
                        </button>
                      ) : (
                        <button style={styles.btnReactivar} onClick={() => handleReactivar(c)}>
                          ✅
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={styles.nota}>
              ⚠️ Desactivar un comité no borra su historial de ingresos/egresos, solo deja de aparecer en los formularios para registrar nuevos movimientos.
            </p>
          </div>
        )}

        {/* ─── TARJETAS DE BALANCE ─── */}
        <div style={styles.cardsGrid}>
          {balances.map(b => {
            const positivo  = Number(b.saldo) >= 0
            const isSelected = selected === b.comiteId
            return (
              <div
                key={b.comiteId}
                style={{
                  ...styles.comiteCard,
                  borderTop: `4px solid ${positivo ? '#1A7A3C' : '#C0392B'}`,
                  boxShadow: isSelected
                    ? '0 0 0 2px #2E4B8F, 0 4px 12px rgba(0,0,0,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
                }}
                onClick={() => verDetalle(b.comiteId)}
              >
                <p style={styles.comiteNombre}>{b.comiteNombre}</p>

                <div style={styles.comiteRow}>
                  <span style={styles.comiteLabel}>Ingresos</span>
                  <span style={{...styles.comiteVal, color: '#1A7A3C'}}>
                    {formatCurrency(b.totalIngresos)}
                  </span>
                </div>

                <div style={styles.comiteRow}>
                  <span style={styles.comiteLabel}>Egresos</span>
                  <span style={{...styles.comiteVal, color: '#C0392B'}}>
                    {formatCurrency(b.totalEgresos)}
                  </span>
                </div>

                <div style={{...styles.comiteRow, borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px'}}>
                  <span style={{...styles.comiteLabel, fontWeight: '700'}}>Saldo</span>
                  <span style={{
                    ...styles.comiteVal,
                    fontWeight: '700',
                    color: positivo ? '#1B2A4A' : '#C0392B'
                  }}>
                    {formatCurrency(b.saldo)}
                  </span>
                </div>

                <div style={styles.badgeRow}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: positivo ? '#D4EDDA' : '#FADBD8',
                    color: positivo ? '#1A7A3C' : '#C0392B'
                  }}>
                    {positivo ? '✅ Superávit' : '❌ Déficit'}
                  </span>
                  <span style={styles.verDetalle}>
                    {selected === b.comiteId ? 'Viendo detalle ↓' : 'Ver detalle →'}
                  </span>
                </div>

              </div>
            )
          })}
        </div>

        {/* ─── DETALLE DEL COMITÉ SELECCIONADO ─── */}
        {selected && (
          <div style={styles.detalleCard}>

            <div style={styles.detalleTitleRow}>
              <h2 style={styles.detalleTitle}>
                📋 Detalle — {comiteSeleccionado?.nombre}
              </h2>
              <div style={styles.detalleSummary}>
                <span style={styles.summaryItem}>
                  Ingresos: <strong style={{color: '#1A7A3C'}}>
                    {formatCurrency(balanceSeleccionado?.totalIngresos)}
                  </strong>
                </span>
                <span style={styles.summaryItem}>
                  Egresos: <strong style={{color: '#C0392B'}}>
                    {formatCurrency(balanceSeleccionado?.totalEgresos)}
                  </strong>
                </span>
                <span style={styles.summaryItem}>
                  Saldo: <strong style={{color: '#1B2A4A'}}>
                    {formatCurrency(balanceSeleccionado?.saldo)}
                  </strong>
                </span>
              </div>
            </div>

            {loadingDetalle ? (
              <p style={{color: '#6C757D', padding: '16px'}}>Cargando detalle...</p>
            ) : (
              <div style={styles.detalleTablas}>

                <div style={styles.tablaSeccion}>
                  <h3 style={{...styles.seccionTitle, color: '#1A7A3C'}}>
                    ➕ Ingresos ({detalle?.ingresos?.length || 0})
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Fecha','Tipo','Descripción','Monto','Recibo'].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detalle?.ingresos?.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{...styles.td, textAlign: 'center', color: '#6C757D'}}>
                            Sin ingresos registrados
                          </td>
                        </tr>
                      ) : (
                        detalle?.ingresos?.map((ing, i) => (
                          <tr key={ing.id} style={{
                            backgroundColor: i % 2 === 0 ? '#ffffff' : '#f0f7f0'
                          }}>
                            <td style={styles.td}>{ing.fecha}</td>
                            <td style={styles.td}>{ing.catIngresoNombre}</td>
                            <td style={styles.td}>{ing.descripcion}</td>
                            <td style={{...styles.td, color: '#1A7A3C', fontWeight: '600'}}>
                              {formatCurrency(ing.monto)}
                            </td>
                            <td style={styles.td}>{ing.recibo || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={styles.tablaSeccion}>
                  <h3 style={{...styles.seccionTitle, color: '#C0392B'}}>
                    ➖ Egresos ({detalle?.egresos?.length || 0})
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Fecha','Tipo','Beneficiario','Monto','Documento'].map(h => (
                          <th key={h} style={{...styles.th, backgroundColor: '#C0392B'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detalle?.egresos?.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{...styles.td, textAlign: 'center', color: '#6C757D'}}>
                            Sin egresos registrados
                          </td>
                        </tr>
                      ) : (
                        detalle?.egresos?.map((eg, i) => (
                          <tr key={eg.id} style={{
                            backgroundColor: i % 2 === 0 ? '#ffffff' : '#fff5f5'
                          }}>
                            <td style={styles.td}>{eg.fecha}</td>
                            <td style={styles.td}>{eg.catEgresoNombre}</td>
                            <td style={styles.td}>{eg.beneficiario}</td>
                            <td style={{...styles.td, color: '#C0392B', fontWeight: '600'}}>
                              {formatCurrency(eg.monto)}
                            </td>
                            <td style={styles.td}>{eg.documento || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(Number(value))
}

const styles = {
  page:        { minHeight: '100vh', backgroundColor: '#f2f4f8' },
  container:   { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  centered:    { display: 'flex', justifyContent: 'center', padding: '40px' },
  titleRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  pageTitle:   { color: '#1B2A4A', fontSize: '22px', fontWeight: 'bold', margin: 0 },
  error:       { backgroundColor: '#FADBD8', color: '#C0392B', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' },
  exito:       { backgroundColor: '#D4EDDA', color: '#1A7A3C', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' },

  btnAdmin:    { backgroundColor: '#2E4B8F', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },

  adminCard:   { backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  adminHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  adminTitle:  { color: '#1B2A4A', fontSize: '16px', fontWeight: '600', margin: 0 },

  form:        { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldCheckbox: { display: 'flex', alignItems: 'center' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1B2A4A', fontWeight: '600', cursor: 'pointer' },
  label:       { color: '#1B2A4A', fontSize: '13px', fontWeight: '600' },
  input:       { padding: '9px 12px', borderRadius: '7px', border: '1px solid #CCCCCC', fontSize: '13px', outline: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },

  nota:        { fontSize: '12px', color: '#6C757D', marginTop: '12px', fontStyle: 'italic' },

  cardsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
  comiteCard:  { backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', transition: 'box-shadow 0.2s' },
  comiteNombre:{ color: '#1B2A4A', fontSize: '13px', fontWeight: '700', margin: '0 0 12px 0' },
  comiteRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  comiteLabel: { color: '#6C757D', fontSize: '11px' },
  comiteVal:   { fontSize: '12px', fontWeight: '600' },
  badgeRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  badge:       { fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '10px' },
  verDetalle:  { fontSize: '10px', color: '#2E4B8F', fontWeight: '600' },

  detalleCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  detalleTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  detalleTitle:{ color: '#1B2A4A', fontSize: '18px', fontWeight: '700', margin: 0 },
  detalleSummary: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  summaryItem: { fontSize: '13px', color: '#6C757D' },
  detalleTablas: { display: 'flex', flexDirection: 'column', gap: '24px' },
  tablaSeccion:{ display: 'flex', flexDirection: 'column', gap: '10px' },
  seccionTitle:{ fontSize: '15px', fontWeight: '600', margin: 0 },

  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { backgroundColor: '#1B2A4A', color: '#ffffff', padding: '9px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' },
  td:          { padding: '9px 14px', fontSize: '12px', color: '#333333', borderBottom: '1px solid #f0f0f0' },

  btnPrimary:  { backgroundColor: '#1A7A3C', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnCancelar: { backgroundColor: '#6C757D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnGuardar:  { backgroundColor: '#1B2A4A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnEditar:   { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '4px' },
  btnEliminar: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
  btnReactivar:{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
}