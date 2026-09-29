import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import logo from '../../assets/logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { username, password })
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <img src={logo} alt="Fondo Local" style={styles.logoImg} />
          <h2 style={styles.title}>Sistema Financiero</h2>
          <p style={styles.subtitle}>Fondo Local de la Iglesia</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={loading ? styles.buttonDisabled : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f8'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logoImg: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    marginBottom: '8px'
  },
  title: {
    color: '#1B2A4A',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#6C757D',
    fontSize: '14px',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: '#1B2A4A',
    fontSize: '14px',
    fontWeight: '600'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #CCCCCC',
    fontSize: '14px',
    outline: 'none'
  },
  error: {
    color: '#C0392B',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0
  },
  button: {
    padding: '12px',
    backgroundColor: '#1B2A4A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonDisabled: {
    padding: '12px',
    backgroundColor: '#6C757D',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'not-allowed'
  }
}