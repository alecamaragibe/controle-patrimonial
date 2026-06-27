import { useState } from 'react'
import DashboardResumo from './DashboardResumo'
import Patrimonios from './Patrimonios'
import Movimentacoes from './Movimentacoes'

function Dashboard() {

  const [tela, setTela] = useState('dashboard')

  function sair() {
    localStorage.removeItem('token')
    window.location.reload()
  }

  return (
    <div className="container mt-5">

      <div className="d-flex justify-content-between align-items-center">

        <h1>Descomplica Patrimonial</h1>

        <button className="btn btn-danger" onClick={sair}>
          Sair
        </button>

      </div>

      <hr />

      <div className="card p-4 shadow">

        <h3>Bem-vindo(a) ao Sistema!</h3>
        <p>Login realizado com sucesso.</p>

      </div>

      {/* MENU */}
      <div className="mt-4">

      <button
          className="btn btn-primary me-2"
          onClick={() => setTela('dashboard')}
        >
          Dashboard
        </button>  

        <button
          className="btn btn-primary me-2"
          onClick={() => setTela('movimentacoes')}
        >
          Movimentações
        </button>

        <button
          className="btn btn-primary me-2"
          onClick={() => setTela('patrimonios')}
        >
          Patrimônios
        </button>

      </div>

      {/* TELAS */}
      {tela === 'dashboard' && <DashboardResumo />}
      {tela === 'patrimonios' && <Patrimonios />}
      {tela === 'movimentacoes' && <Movimentacoes />}

    </div>
  )
}

export default Dashboard