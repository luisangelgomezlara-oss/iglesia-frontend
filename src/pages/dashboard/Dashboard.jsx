import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { exportarInformeMensual } from '../../utils/exportarExcel'

const MESES = [
  'Ene','Feb','Mar','Abr','May','Jun',
  'Jul','Ago','Sep','Oct','Nov','Dic'
]

const COLORES_PIE = [
  '#C5A028','#2E4B8F','#1A7A3C','#C0392B','#1B2A4A',
  '#6C757D','#E67E22','#8E44AD','#16A085','#2C3E50','#8B5E3C'
]

export default function Dashboard() {
  const [balance, setBalance]   = useState(null)
  const [ingresos, setIngresos] = useState([])
  const [egresos, setEgresos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  useEffect(() => {
    cargarBalance()
  }, [])

  const cargarBalance = async () => {
    try {
      const [resBalance, resIngresos, resEgresos] = await Promise.all([
        api.get('/balance/general'),
        api.get('/ingresos'),
        api.get('/egresos')
      ])
      setBalance(resBalance.data)
      setIngresos(resIngresos.data)
      setEgresos(resEgresos.data)
    } catch (err) {
      setError('Error al cargar el balance')
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = () => {
    const ahora = new Date()
    exportarInformeMensual(
      ingresos,
      egresos,
      ahora.getMonth() + 1,
      ahora.getFullYear()
    )
  }

  if (loading) return (
    <div style={styles.loadingContainer}>
      <p style={styles.loading}>Cargando dashboard...</p>
    </div>
  )

  if (error) return (
    <div style={styles.loadingContainer}>
      <p style={styles.errorText}>{error}</p>
    </div>
  )

  // ─── Separar ingresos: con comité vs sin comité (Fondo General) ───
  const ingresosFondoGeneral = ingresos.filter(i => !i.comiteId)
  const totalFondoGeneral    = ingresosFondoGeneral.reduce((s, i) => s + Number(i.monto), 0)

  // Datos para la gráfica de barras por comité
  const dataComites = balance?.balancePorComite?.map(c => ({
    name: c.comiteNombre.length > 10
      ? c.comiteNombre.substring(0, 10) + '...'
      : c.comiteNombre,
    Ingresos: Number(c.totalIngresos),
    Egresos:  Number(c.totalEgresos)
  })) || []

  // Datos para la gráfica de torta — comités + Fondo General
  const dataTorta = [
    ...(totalFondoGeneral > 0 ? [{ name: 'Fondo General (Diezmos/Donaciones)', value: totalFondoGeneral }] : []),
    ...(balance?.balancePorComite
      ?.filter(c => Number(c.totalIngresos) > 0)
      ?.map(c => ({ name: c.comiteNombre, value: Number(c.totalIngresos) })) || [])
  ]

  const saldoPositivo = Number(balance?.saldoNeto) >= 0

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Título */}
        <div style={styles.titleRow}>
          <h1 style={styles.pageTitle}>📊 Dashboard Financiero</h1>
          <div style={styles.actions}>
            <button style={styles.btnExportar} onClick={handleExportar}>
              📥 Exportar Informe
            </button>
            <button style={styles.btnIngreso} onClick={() => navigate('/ingresos')}>
              ➕ Registrar Ingreso
            </button>
            <button style={styles.btnEgreso} onClick={() => navigate('/egresos')}>
              ➖ Registrar Egreso
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={styles.kpiRow}>
          <div style={{...styles.kpiCard, borderTop: '4px solid #1A7A3C'}}>
            <p style={styles.kpiLabel}>Total Ingresos</p>
            <p style={{...styles.kpiValue, color: '#1A7A3C'}}>
              {formatCurrency(balance?.totalIngresos)}
            </p>
          </div>

          <div style={{...styles.kpiCard, borderTop: '4px solid #C0392B'}}>
            <p style={styles.kpiLabel}>Total Egresos</p>
            <p style={{...styles.kpiValue, color: '#C0392B'}}>
              {formatCurrency(balance?.totalEgresos)}
            </p>
          </div>

          <div style={{
            ...styles.kpiCard,
            borderTop: `4px solid ${saldoPositivo ? '#1B2A4A' : '#C0392B'}`
          }}>
            <p style={styles.kpiLabel}>Saldo Neto</p>
            <p style={{
              ...styles.kpiValue,
              color: saldoPositivo ? '#1B2A4A' : '#C0392B'
            }}>
              {formatCurrency(balance?.saldoNeto)}
            </p>
            <span style={{
              ...styles.badge,
              backgroundColor: saldoPositivo ? '#D4EDDA' : '#FADBD8',
              color: saldoPositivo ? '#1A7A3C' : '#C0392B'
            }}>
              {saldoPositivo ? '✅ Superávit' : '❌ Déficit'}
            </span>
          </div>

          <div style={{...styles.kpiCard, borderTop: '4px solid #C5A028'}}>
            <p style={styles.kpiLabel}>Comités Activos</p>
            <p style={{...styles.kpiValue, color: '#C5A028'}}>
              {balance?.balancePorComite?.length || 0}
            </p>
          </div>
        </div>

        {/* Tarjeta Fondo General */}
        <div style={styles.fondoCard}>
          <div style={styles.fondoLeft}>
            <span style={styles.fondoIcon}>⛪</span>
            <div>
              <p style={styles.fondoTitle}>Fondo General — Junta Local</p>
              <p style={styles.fondoSubtitle}>
                Diezmos, donaciones y aportes voluntarios (sin comité asignado)
              </p>
            </div>
          </div>
          <div style={styles.fondoRight}>
            <p style={styles.fondoValue}>{formatCurrency(totalFondoGeneral)}</p>
            <p style={styles.fondoCount}>{ingresosFondoGeneral.length} movimientos</p>
          </div>
        </div>

        {/* Gráficas */}
        <div style={styles.chartsRow}>

          {/* Barras por comité */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Ingresos vs Egresos por Comité</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataComites} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#1A7A3C" radius={[4,4,0,0]} />
                <Bar dataKey="Egresos"  fill="#C0392B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Torta distribución ingresos */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Distribución de Ingresos (con Fondo General)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dataTorta}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.substring(0,10)}... ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dataTorta.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name.includes('Fondo General')
                        ? '#C5A028'
                        : COLORES_PIE[(index) % COLORES_PIE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Tabla balance por comité */}
        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>Balance por Comité</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Comité','Total Ingresos','Total Egresos','Saldo','Estado'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fila especial: Fondo General */}
              <tr style={{ backgroundColor: '#FFF8E1' }}>
                <td style={{...styles.td, fontWeight: '700', color: '#C5A028'}}>
                  ⛪ Fondo General (Diezmos/Donaciones)
                </td>
                <td style={{...styles.td, color: '#1A7A3C', fontWeight: '600'}}>
                  {formatCurrency(totalFondoGeneral)}
                </td>
                <td style={{...styles.td, color: '#6C757D'}}>—</td>
                <td style={{...styles.td, color: '#1B2A4A', fontWeight: 'bold'}}>
                  {formatCurrency(totalFondoGeneral)}
                </td>
                <td style={styles.td}>
                  <span style={{...styles.badge, backgroundColor: '#FFF3CD', color: '#C5A028'}}>
                    ⛪ Fondo General
                  </span>
                </td>
              </tr>

              {balance?.balancePorComite?.map((c, i) => {
                const positivo = Number(c.saldo) >= 0
                return (
                  <tr key={c.comiteId} style={{
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    <td style={styles.td}>{c.comiteNombre}</td>
                    <td style={{...styles.td, color: '#1A7A3C', fontWeight: '600'}}>
                      {formatCurrency(c.totalIngresos)}
                    </td>
                    <td style={{...styles.td, color: '#C0392B', fontWeight: '600'}}>
                      {formatCurrency(c.totalEgresos)}
                    </td>
                    <td style={{
                      ...styles.td,
                      color: positivo ? '#1B2A4A' : '#C0392B',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(c.saldo)}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: positivo ? '#D4EDDA' : '#FADBD8',
                        color: positivo ? '#1A7A3C' : '#C0392B'
                      }}>
                        {positivo ? '✅ Superávit' : '❌ Déficit'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(Number(value))
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f2f4f8' },
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loading: { color: '#6C757D', fontSize: '16px' },
  errorText: { color: '#C0392B', fontSize: '16px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { color: '#1B2A4A', fontSize: '22px', fontWeight: 'bold', margin: 0 },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  btnExportar: { backgroundColor: '#C5A028', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnIngreso: { backgroundColor: '#1A7A3C', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnEgreso: { backgroundColor: '#C0392B', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' },
  kpiCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  kpiLabel: { color: '#6C757D', fontSize: '13px', margin: '0 0 8px 0', fontWeight: '500' },
  kpiValue: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0' },
  badge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', display: 'inline-block' },

  fondoCard: {
    backgroundColor: '#1B2A4A',
    borderRadius: '10px',
    padding: '20px 24px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  fondoLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  fondoIcon: { fontSize: '32px' },
  fondoTitle: { color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' },
  fondoSubtitle: { color: '#D6E4F7', fontSize: '12px', margin: 0 },
  fondoRight: { textAlign: 'right' },
  fondoValue: { color: '#C5A028', fontSize: '24px', fontWeight: 'bold', margin: '0 0 2px 0' },
  fondoCount: { color: '#D6E4F7', fontSize: '11px', margin: 0 },

  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  chartCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { color: '#1B2A4A', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' },
  tableCard: { backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#1B2A4A', color: '#ffffff', padding: '10px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' },
  td: { padding: '10px 16px', fontSize: '13px', color: '#333333', borderBottom: '1px solid #f0f0f0' }
}