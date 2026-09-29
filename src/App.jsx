import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Ingresos from './pages/ingresos/Ingresos'
import Egresos from './pages/egresos/Egresos'
import Comites from './pages/comites/Comites'
import Configuracion from './pages/configuracion/Configuracion'
import RutaProtegida from './components/RutaProtegida'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RutaProtegida><Dashboard /></RutaProtegida>
        } />
        <Route path="/ingresos" element={
          <RutaProtegida><Ingresos /></RutaProtegida>
        } />
        <Route path="/egresos" element={
          <RutaProtegida><Egresos /></RutaProtegida>
        } />
        <Route path="/comites" element={
          <RutaProtegida><Comites /></RutaProtegida>
        } />
        <Route path="/configuracion" element={
          <RutaProtegida><Configuracion /></RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App