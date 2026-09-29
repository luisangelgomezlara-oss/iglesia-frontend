import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <img src={logo} alt="Logo" style={styles.logoImg} />
        <span style={styles.title}>Iglesia — Fondo Local</span>
      </div>

      <div style={styles.links}>
        <button style={styles.link} onClick={() => navigate('/dashboard')}>
          📊 Dashboard
        </button>
        <button style={styles.link} onClick={() => navigate('/ingresos')}>
          ➕ Ingresos
        </button>
        <button style={styles.link} onClick={() => navigate('/egresos')}>
          ➖ Egresos
        </button>
        <button style={styles.link} onClick={() => navigate('/comites')}>
          🏛️ Comités
        </button>
        <button style={styles.link} onClick={() => navigate('/configuracion')}>
          ⚙️ Configuración
        </button>
      </div>

      <div style={styles.usuario}>
        <span style={styles.nombre}>👤 {usuario?.nombre}</span>
        <span style={styles.rol}>{usuario?.rol}</span>
        <button style={styles.logout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2A4A',
    padding: '0 24px',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoImg: {
    width: '36px',
    height: '36px',
    objectFit: 'contain'
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  links: {
    display: 'flex',
    gap: '8px'
  },
  link: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#D6E4F7',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    fontWeight: '500'
  },
  usuario: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  nombre: {
    color: '#ffffff',
    fontSize: '13px'
  },
  rol: {
    color: '#C5A028',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(197,160,40,0.15)',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  logout: {
    backgroundColor: '#C0392B',
    border: 'none',
    color: '#ffffff',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: '500'
  }
}