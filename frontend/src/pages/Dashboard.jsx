import { useState } from 'react'
import Patrimonios from './Patrimonios'
import Movimentacoes from './Movimentacoes'

function Dashboard() {
const [tela, setTela] = useState('patrimonios')

    function sair() {
  
      localStorage.removeItem('token')
  
      window.location.reload()
  
    }
  
    return (
  
      <div className="container mt-5">
  
        <div className="d-flex
                        justify-content-between
                        align-items-center">
  
          <h1>
            Descomplica Patrimonial
          </h1>
  
          <button
            className="btn btn-danger"
            onClick={sair}
          >
            Sair
          </button>
  
        </div>
  
        <hr />
  
        <div className="card p-4 shadow">
  
          <h3>
            Bem-vindo(a) ao Sistema!
          </h3>
  
          <p>
            Login realizado com sucesso.
          </p>

        </div>
      
        <div className="mt-4">

  <button
    className="btn btn-primary me-2"
    onClick={() => setTela('patrimonios')}
  >
    Patrimônios
  </button>

  <button
    className="btn btn-secondary"
    onClick={() => setTela('movimentacoes')}
  >
    Movimentações
  </button>

</div>

{
  tela === 'patrimonios'
    ? <Patrimonios />
    : <Movimentacoes />
}

      </div>
  
    )
  
  }
  
  export default Dashboard