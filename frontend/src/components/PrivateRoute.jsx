
import { Navigate } from 'react-router-dom'

function PrivateRoute({ children, perfisPermitidos }) {

  const token = localStorage.getItem('token')

  const usuario = JSON.parse(
    localStorage.getItem('usuario') || 'null'
  )

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (
    perfisPermitidos &&
    !perfisPermitidos.includes(usuario?.perfil)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute
