import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function Configuracion() {
  const [catIngresos, setCatIngresos] = useState([])
  const [catEgresos, setCatEgresos]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [exito, setExito]             = useState('')

  const [tab, setTab] = useState('ingresos') // 'ingresos' | 'egresos'

  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ codigo: '', nombre: '', activo: true })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resIng, resEg] = await Promise.all([
        api.get('/cat-ingresos'),
        api.get('/cat-egresos')
      ])
      setCatIngresos(resIng.data)
      setCatEgresos(resEg.data)
    } catch (err) {
      setError('Error al cargar los catálogos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const endpoint = tab === 'ingresos' ? '/cat-ingresos' : '/cat-egresos'
  const lista    = tab === 'ingresos' ? catIngresos : catEgresos
  const color    = tab === 'ingresos' ? '#1A7A3C' : '#C0392B'
  const colorBg  = tab === 'ingresos' ? '#D4EDDA' : '#FADBD8'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    try {
      if (editando) {
        await api.put(`${endpoint}/${editando}`, form)
        setExito('Tipo actualizado correctamente')
      } else {
        await api.post(endpoint, { ...form, activo: true })
        setExito('Tipo creado correctamente')
      }
      resetForm()
      cargarDatos()
    } catch (err) {
      setError('Error al guardar. Verifica que el código no esté repetido.')
    }
  }

  const handleEditar = (item) => {
    setForm({ codigo: item.codigo, nombre: item.nombre, activo: item.activo })
    setEditando(item.id)
    setShowForm(true)
  }

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Seguro que deseas desactivar este tipo? No aparecerá en los formularios de registro.')) return
    try {
      await api.delete(`${endpoint}/${id}`)
      setExito('Tipo desactivado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al desactivar')
    }
  }

  const handleReactivar = async (item) => {
    try {
      await api.put(`${endpoint}/${item.id}`, { ...item, activo: true })
      setExito('Tipo reactivado correctamente')
      cargarDatos()
    } catch (err) {
      setError('Error al reactivar')
    }
  }

  const resetForm = () => {
    setForm({ codigo: '', nombre: '', activo: true })
    setEditando(null)
    setShowForm(false)
  }

  const cambiarTab = (nuevaTab) => {
    setTab(nuevaTab)
    resetForm()
    setError('')
    setExito('')
  }

  // Sugerir siguiente código disponible
  const sugerirCodigo = () => {
    const prefijo = tab === 'ingresos' ? 'ING' : 'EGR'
    const numeros = lista
      .map(i => parseInt(i.codigo?.split('-')[1]) || 0)
    const max = numeros.length > 0 ? Math.max(...numeros) : 0
    return `${prefijo}-${String(max + 1).padStart(2, '0')}`
  }

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

        <h1 style={styles.pageTitle}>⚙️ Configuración — Catálogos</h1>

        {error && <p style={styles.error}>{error}</p>}
        {exito && <p style={styles.exito}>{exito}</p>}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={tab === 'ingresos' ? styles.tabActiveIng : styles.tab}
            onClick={() => cambiarTab('ingresos')}
          >
            ➕ Tipos de Ingreso ({catIngresos.length})
          </button>
          <button
            style={tab === 'egresos' ? styles.tabActiveEg : styles.tab}
            onClick={() => cambiarTab('egresos')}
          >
            ➖ Tipos de Egreso ({catEgresos.length})
          </button>
        </div>

        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <h3 style={{...styles.cardTitle, color}}>
              {tab === 'ingresos' ? 'Catálogo de Tipos de Ingreso' : 'Catálogo de Tipos de Egreso'}
            </h3>
            <button
              style={showForm ? styles.btnCancelar : { ...styles.btnPrimary, backgroundColor: color }}
              onClick={() => {
                if (!showForm) {
                  setForm({ codigo: sugerirCodigo(), nombre: '', activo: true })
                  setEditando(null)
                  setShowForm(true)
                } else {
                  resetForm()
                }
              }}
            >
              {showForm ? '✕ Cancelar' : '➕ Nuevo Tipo'}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Código *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    placeholder="Ej: ING-23"
                    required
                  />
                </div>
                <div style={{...styles.field, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Nombre *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Ofrenda Especial de Navidad"
                    required
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
                      Tipo activo
                    </label>
                  </div>
                )}
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancelar} onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" style={{...styles.btnGuardar, backgroundColor: color}}>
                  {editando ? '💾 Actualizar' : '💾 Crear Tipo'}
                </button>
              </div>
            </form>
          )}

          {/* Tabla */}
          <table style={styles.table}>
            <thead>
              <tr>
                {['Código','Nombre','Estado','Acciones'].map(h => (
                  <th key={h} style={{...styles.th, backgroundColor: color}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((item, i) => (
                <tr key={item.id} style={{
                  backgroundColor: i % 2 === 0 ? '#ffffff' : (tab === 'ingresos' ? '#f0f7f0' : '#fff5f5')
                }}>
                  <td style={styles.td}><strong>{item.codigo}</strong></td>
                  <td style={styles.td}>{item.nombre}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: item.activo ? colorBg : '#eeeeee',
                      color: item.activo ? color : '#6C757D'
                    }}>
                      {item.activo ? '✅ Activo' : '🚫 Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEditar} onClick={() => handleEditar(item)}>
                      ✏️
                    </button>
                    {item.activo ? (
                      <button style={styles.btnAccion} onClick={() => handleDesactivar(item.id)}>
                        🚫
                      </button>
                    ) : (
                      <button style={styles.btnAccion} onClick={() => handleReactivar(item)}>
                        ✅
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={styles.nota}>
            ⚠️ Desactivar un tipo no borra su historial — solo deja de aparecer en los formularios de registro de {tab === 'ingresos' ? 'ingresos' : 'egresos'} nuevos.
          </p>

        </div>

      </div>
    </div>
  )
}

const styles = {
  page:        { minHeight: '100vh', backgroundColor: '#f2f4f8' },
  container:   { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  centered:    { display: 'flex', justifyContent: 'center', padding: '40px' },
  pageTitle:   { color: '#1B2A4A', fontSize: '22px', fontWeight: 'bold', margin: '0 0 16px 0' },
  error:       { backgroundColor: '#FADBD8', color: '#C0392B', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' },
  exito:       { backgroundColor: '#D4EDDA', color: '#1A7A3C', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' },

  tabs:        { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab:         { backgroundColor: '#ffffff', color: '#6C757D', border: '1px solid #e0e0e0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  tabActiveIng:{ backgroundColor: '#1A7A3C', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  tabActiveEg: { backgroundColor: '#C0392B', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },

  card:        { backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle:   { fontSize: '16px', fontWeight: '600', margin: 0 },

  form:        { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', alignItems: 'end' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldCheckbox: { display: 'flex', alignItems: 'center' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1B2A4A', fontWeight: '600', cursor: 'pointer' },
  label:       { color: '#1B2A4A', fontSize: '13px', fontWeight: '600' },
  input:       { padding: '9px 12px', borderRadius: '7px', border: '1px solid #CCCCCC', fontSize: '13px', outline: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },

  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { color: '#ffffff', padding: '9px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600' },
  td:          { padding: '9px 14px', fontSize: '12px', color: '#333333', borderBottom: '1px solid #f0f0f0' },
  badge:       { fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '10px' },

  nota:        { fontSize: '12px', color: '#6C757D', marginTop: '12px', fontStyle: 'italic' },

  btnPrimary:  { color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnCancelar: { backgroundColor: '#6C757D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnGuardar:  { color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnEditar:   { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '4px' },
  btnAccion:   { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
}