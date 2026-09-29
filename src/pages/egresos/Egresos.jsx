import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function Egresos() {
  const [egresos, setEgresos]         = useState([])
  const [comites, setComites]         = useState([])
  const [catEgresos, setCatEgresos]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editando, setEditando]       = useState(null)
  const [error, setError]             = useState('')
  const [exito, setExito]             = useState('')

  const [form, setForm] = useState({
    fecha: '',
    catEgresoId: '',
    comiteId: '',
    beneficiario: '',
    monto: '',
    documento: '',
    autorizadoPorId: 1,
    observaciones: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resEgresos, resComites, resCat] = await Promise.all([
        api.get('/egresos'),
        api.get('/comites/activos'),
        api.get('/cat-egresos/activos')
      ])
      setEgresos(resEgresos.data)
      setComites(resComites.data)
      setCatEgresos(resCat.data)
    } catch (err) {
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    try {
      const payload = {
        ...form,
        catEgresoId:    parseInt(form.catEgresoId),
        comiteId:       parseInt(form.comiteId),
        autorizadoPorId: 1,
        monto:          parseFloat(form.monto)
      }

      if (editando) {
        await api.put(`/egresos/${editando}`, payload)
        setExito('Egreso actualizado correctamente')
      } else {
        await api.post('/egresos', payload)
        setExito('Egreso registrado correctamente')
      }

      resetForm()
      cargarDatos()
    } catch (err) {
      setError('Error al guardar el egreso')
    }
  }

  const handleEditar = (egreso) => {
    setForm({
      fecha:           egreso.fecha,
      catEgresoId:     egreso.catEgresoId,
      comiteId:        egreso.comiteId,
      beneficiario:    egreso.beneficiario,
      monto:           egreso.monto,
      documento:       egreso.documento || '',
      autorizadoPorId: 1,
      observaciones:   egreso.observaciones || ''
    })
    setEditando(egreso.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este egreso?')) return
    try {
      await api.delete(`/egresos/${id}`)
      setExito('Egreso eliminado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al eliminar el egreso')
    }
  }

  const resetForm = () => {
    setForm({
      fecha: '', catEgresoId: '', comiteId: '',
      beneficiario: '', monto: '', documento: '',
      autorizadoPorId: 1, observaciones: ''
    })
    setEditando(null)
    setShowForm(false)
  }

  const totalEgresos = egresos.reduce((sum, e) => sum + Number(e.monto), 0)

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

        {/* Título */}
        <div style={styles.titleRow}>
          <h1 style={styles.pageTitle}>➖ Registro de Egresos</h1>
          <button
            style={showForm ? styles.btnCancelar : styles.btnPrimary}
            onClick={() => { resetForm(); setShowForm(!showForm) }}
          >
            {showForm ? '✕ Cancelar' : '➖ Nuevo Egreso'}
          </button>
        </div>

        {/* Mensajes */}
        {error && <p style={styles.error}>{error}</p>}
        {exito && <p style={styles.exito}>{exito}</p>}

        {/* Formulario */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>
              {editando ? '✏️ Editar Egreso' : '➖ Nuevo Egreso'}
            </h3>
            <form onSubmit={handleSubmit} style={styles.form}>

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Fecha *</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tipo de Egreso *</label>
                  <select
                    style={styles.input}
                    name="catEgresoId"
                    value={form.catEgresoId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    {catEgresos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Comité *</label>
                  <select
                    style={styles.input}
                    name="comiteId"
                    value={form.comiteId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un comité</option>
                    {comites.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Monto *</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="monto"
                    value={form.monto}
                    onChange={handleChange}
                    placeholder="Ej: 85000"
                    min="0"
                    required
                  />
                </div>

                <div style={{...styles.field, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Beneficiario / Proveedor *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="beneficiario"
                    value={form.beneficiario}
                    onChange={handleChange}
                    placeholder="Ej: Empresa de Energía / Familia González"
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>N° Documento</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="documento"
                    value={form.documento}
                    onChange={handleChange}
                    placeholder="Ej: DOC-001"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Observaciones</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancelar} onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnGuardar}>
                  {editando ? '💾 Actualizar' : '💾 Guardar Egreso'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Total */}
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total Egresos Registrados</span>
          <span style={styles.totalValue}>{formatCurrency(totalEgresos)}</span>
        </div>

        {/* Tabla */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#','Fecha','Tipo','Comité','Beneficiario','Monto','Documento','Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {egresos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{...styles.td, textAlign: 'center', color: '#6C757D'}}>
                    No hay egresos registrados aún
                  </td>
                </tr>
              ) : (
                egresos.map((eg, i) => (
                  <tr key={eg.id} style={{
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#fff5f5'
                  }}>
                    <td style={styles.td}>{eg.id}</td>
                    <td style={styles.td}>{eg.fecha}</td>
                    <td style={styles.td}>{eg.catEgresoNombre}</td>
                    <td style={styles.td}>{eg.comiteNombre}</td>
                    <td style={styles.td}>{eg.beneficiario}</td>
                    <td style={{...styles.td, color: '#C0392B', fontWeight: '600'}}>
                      {formatCurrency(eg.monto)}
                    </td>
                    <td style={styles.td}>{eg.documento || '—'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnEditar}
                        onClick={() => handleEditar(eg)}
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.btnEliminar}
                        onClick={() => handleEliminar(eg.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
  formCard:    { backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:   { color: '#1B2A4A', fontSize: '16px', fontWeight: '600', margin: '0 0 20px 0' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { color: '#1B2A4A', fontSize: '13px', fontWeight: '600' },
  input:       { padding: '9px 12px', borderRadius: '7px', border: '1px solid #CCCCCC', fontSize: '13px', outline: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  totalCard:   { backgroundColor: '#C0392B', borderRadius: '10px', padding: '16px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:  { color: '#FADBD8', fontSize: '14px', fontWeight: '500' },
  totalValue:  { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' },
  tableCard:   { backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { backgroundColor: '#1B2A4A', color: '#ffffff', padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' },
  td:          { padding: '10px 14px', fontSize: '12px', color: '#333333', borderBottom: '1px solid #f0f0f0' },
  btnPrimary:  { backgroundColor: '#C0392B', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnCancelar: { backgroundColor: '#6C757D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnGuardar:  { backgroundColor: '#1B2A4A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnEditar:   { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '4px' },
  btnEliminar: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
}