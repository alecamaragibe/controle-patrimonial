import { useEffect, useState } from 'react'
import axios from 'axios'

function Patrimonios() {

  const [patrimonios, setPatrimonios] = useState([])
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [patrimonio, setPatrimonio] = useState('')
  const [status, setStatus] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  async function buscarPatrimonios() {

    try {

      const token = localStorage.getItem('token')
      
      console.log('TOKEN:', token)
        
      const resposta = await axios.get(
        'http://localhost:3000/patrimonios',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setPatrimonios(resposta.data)

    } catch (error) {

      console.log(error)

      alert('Erro ao buscar patrimônios')

    }

  }

  async function cadastrarPatrimonio(event) {

    event.preventDefault()

    try {

      const token = localStorage.getItem('token')

      await axios.post(
        'http://localhost:3000/patrimonios',
        {
          nome,
          tipo,
          patrimonio,
          status,
          localizacao
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Patrimônio cadastrado!')

      setNome('')
      setTipo('')
      setPatrimonio('')
      setStatus('')
      setLocalizacao('')

      buscarPatrimonios()

    } catch (error) {

      console.log(error)

      alert('Erro ao cadastrar patrimônio')

    }

  }

  async function excluirPatrimonio(id) {

    const confirmar = window.confirm(
      'Deseja realmente excluir este patrimônio?'
    )

    if (!confirmar) {
      return
    }

    try {

      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:3000/patrimonios/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Patrimônio excluído com sucesso!')

      buscarPatrimonios()

    } catch (error) {

      console.log(error)

      alert('Erro ao excluir patrimônio')

    }

  }

  useEffect(() => {

    buscarPatrimonios()

  }, [])

  return (

    <div className="card p-4 shadow mt-4">

      <h3 className="mb-4">
        Patrimônios
      </h3>

      <form
        onSubmit={cadastrarPatrimonio}
        className="mb-4"
      >

        <div className="row">

          <div className="col-md-4 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

          </div>

          <div className="col-md-4 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />

          </div>

          <div className="col-md-4 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Número patrimônio"
              value={patrimonio}
              onChange={(e) => setPatrimonio(e.target.value)}
            />

          </div>

          <div className="col-md-4 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />

          </div>

          <div className="col-md-4 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Localização"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
            />

          </div>

          <div className="col-md-4 mb-3">

            <button
              type="submit"
              className="btn btn-success w-100"
            >
              Cadastrar
            </button>

          </div>

        </div>

      </form>

      <table className="table">

        <thead>

          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Localização</th>
            <th>Ações</th>
          </tr>

        </thead>

        <tbody>

          {patrimonios.map((patrimonio) => (

            <tr key={patrimonio.id}>

              <td>{patrimonio.id}</td>
              <td>{patrimonio.nome}</td>
              <td>{patrimonio.tipo}</td>
              <td>{patrimonio.status}</td>
              <td>{patrimonio.localizacao}</td>

              <td>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    excluirPatrimonio(patrimonio.id)
                  }
                >
                  Excluir
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}

export default Patrimonios