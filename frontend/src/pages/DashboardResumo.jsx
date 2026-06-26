import { useEffect, useState } from 'react'
import axios from 'axios'

function DashboardResumo() {

  const [dados, setDados] = useState(null)

  async function carregarDashboard() {

    try {

      const token = localStorage.getItem('token')

      const resposta = await axios.get(
        'http://localhost:3000/dashboard',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setDados(resposta.data)

    } catch (error) {
      console.log(error)
      alert('Erro ao carregar dashboard')
    }
  }

  useEffect(() => {
    carregarDashboard()
  }, [])

  if (!dados) return <p>Carregando...</p>

  return (

    <div className="row mt-4">

      <div className="col-md-4">
        <div className="card p-3 text-center">
          <h5>Total</h5>
          <h2>{dados.totalPatrimonios}</h2>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card p-3 text-center">
          <h5>Emprestados</h5>
          <h2>{dados.emprestados}</h2>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card p-3 text-center">
          <h5>Disponíveis</h5>
          <h2>{dados.disponiveis}</h2>
        </div>
      </div>

    </div>
  )
}

export default DashboardResumo