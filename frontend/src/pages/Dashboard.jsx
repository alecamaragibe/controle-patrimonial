import Patrimonios from './Patrimonios'

function Dashboard() {

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
      
        <Patrimonios />

      </div>
  
    )
  
  }
  
  export default Dashboard