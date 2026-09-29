import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function Ingresos() {
  const [ingresos, setIngresos]       = useState([])
  const [comites, setComites]         = useState([])
  const [catIngresos, setCatIngresos] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editando, setEditando]       = useState(null)
  const [error, setError]             = useState('')
  const [exito, setExito]             = useState('')

  const [form, setForm] = useState({
    fecha: '',
    catIngresoId: '',
    comiteId: '',
    descripcion: '',
    monto: '',
    recibo: '',
    registradoPorId: 1,
    observaciones: ''
  })

  // Saber si el tipo seleccionado requiere comité
  const catSeleccionada = catIngresos.find(c => c.id === parseInt(form.catIngresoId))
  const requiereComite  = catSeleccionada ? catSeleccionada.requiereComite : true

  useEffect(() => {
    cargarDatos()
  }, [])

  // Si cambia el tipo y no requiere comité, limpiar comiteId
  useEffect(() => {
    if (!requiereComite) {
      setForm(f => ({ ...f, comiteId: '' }))
    }
  }, [form.catIngresoId])

  const cargarDatos = async () => {
    try {
      const [resIngresos, resComites, resCat] = await Promise.all([
        api.get('/ingresos'),
        api.get('/comites/activos'),
        api.get('/cat-ingresos/activos')
      ])
      setIngresos(resIngresos.data)
      setComites(resComites.data)
      setCatIngresos(resCat.data)
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
        catIngresoId:    parseInt(form.catIngresoId),
        comiteId:        requiereComite ? parseInt(form.comiteId) : null,
        registradoPorId: 1,
        monto:           parseFloat(form.monto)
      }

      if (editando) {
        await api.put(`/ingresos/${editando}`, payload)
        setExito('Ingreso actualizado correctamente')
      } else {
        await api.post('/ingresos', payload)
        setExito('Ingreso registrado correctamente')
      }

      resetForm()
      cargarDatos()
    } catch (err) {
      setError('Error al guardar el ingreso')
    }
  }

  const handleEditar = (ingreso) => {
    setForm({
      fecha:           ingreso.fecha,
      catIngresoId:    ingreso.catIngresoId,
      comiteId:        ingreso.comiteId || '',
      descripcion:     ingreso.descripcion,
      monto:           ingreso.monto,
      recibo:          ingreso.recibo || '',
      registradoPorId: 1,
      observaciones:   ingreso.observaciones || ''
    })
    setEditando(ingreso.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ingreso?')) return
    try {
      await api.delete(`/ingresos/${id}`)
      setExito('Ingreso eliminado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al eliminar el ingreso')
    }
  }

  const resetForm = () => {
    setForm({
      fecha: '', catIngresoId: '', comiteId: '',
      descripcion: '', monto: '', recibo: '',
      registradoPorId: 1, observaciones: ''
    })
    setEditando(null)
    setShowForm(false)
  }

  const totalIngresos = ingresos.reduce((sum, i) => sum + Number(i.monto), 0)

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
          <h1 style={styles.pageTitle}>➕ Registro de Ingresos</h1>
          <button
            style={showForm ? styles.btnCancelar : styles.btnPrimary}
            onClick={() => { resetForm(); setShowForm(!showForm) }}
          >
            {showForm ? '✕ Cancelar' : '➕ Nuevo Ingreso'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {exito && <p style={styles.exito}>{exito}</p>}

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>
              {editando ? '✏️ Editar Ingreso' : '➕ Nuevo Ingreso'}
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
                  <label style={styles.label}>Tipo de Ingreso *</label>
                  <select
                    style={styles.input}
                    name="catIngresoId"
                    value={form.catIngresoId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    {catIngresos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {requiereComite && (
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
                )}

                {!requiereComite && form.catIngresoId && (
                  <div style={styles.field}>
                    <label style={styles.label}>Comité</label>
                    <div style={styles.infoBox}>
                      Este tipo de ingreso no pertenece a ningún comité
                    </div>
                  </div>
                )}

                <div style={styles.field}>
                  <label style={styles.label}>Monto *</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="monto"
                    value={form.monto}
                    onChange={handleChange}
                    placeholder="Ej: 150000"
                    min="0"
                    required
                  />
                </div>

                <div style={{...styles.field, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Descripción *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Ofrenda culto dominical enero"
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>N° Recibo</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="recibo"
                    value={form.recibo}
                    onChange={handleChange}
                    placeholder="Ej: REC-001"
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
                  {editando ? '💾 Actualizar' : '💾 Guardar Ingreso'}
                </button>
              </div>

            </form>
          </div>
        )}

        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total Ingresos Registrados</span>
          <span style={styles.totalValue}>{formatCurrency(totalIngresos)}</span>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#','Fecha','Tipo','Comité','Descripción','Monto','Recibo','Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ingresos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{...styles.td, textAlign: 'center', color: '#6C757D'}}>
                    No hay ingresos registrados aún
                  </td>
                </tr>
              ) : (
                ingresos.map((ing, i) => (
                  <tr key={ing.id} style={{
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#f0f7ff'
                  }}>
                    <td style={styles.td}>{ing.id}</td>
                    <td style={styles.td}>{ing.fecha}</td>
                    <td style={styles.td}>{ing.catIngresoNombre}</td>
                    <td style={styles.td}>{ing.comiteNombre || '—'}</td>
                    <td style={styles.td}>{ing.descripcion}</td>
                    <td style={{...styles.td, color: '#1A7A3C', fontWeight: '600'}}>
                      {formatCurrency(ing.monto)}
                    </td>
                    <td style={styles.td}>{ing.recibo || '—'}</td>
                    <td style={styles.td}>
                      <button style={styles.btnEditar} onClick={() => handleEditar(ing)}>✏️</button>
                      <button style={styles.btnEliminar} onClick={() => handleEliminar(ing.id)}>🗑️</button>
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
  infoBox:     { padding: '9px 12px', borderRadius: '7px', border: '1px solid #D6E4F7', backgroundColor: '#EEF3FF', fontSize: '12px', color: '#2E4B8F', fontStyle: 'italic' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  totalCard:   { backgroundColor: '#1B2A4A', borderRadius: '10px', padding: '16px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:  { color: '#D6E4F7', fontSize: '14px', fontWeight: '500' },
  totalValue:  { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' },
  tableCard:   { backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { backgroundColor: '#1B2A4A', color: '#ffffff', padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' },
  td:          { padding: '10px 14px', fontSize: '12px', color: '#333333', borderBottom: '1px solid #f0f0f0' },
  btnPrimary:  { backgroundColor: '#1A7A3C', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnCancelar: { backgroundColor: '#6C757D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnGuardar:  { backgroundColor: '#1B2A4A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnEditar:   { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '4px' },
  btnEliminar: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
}