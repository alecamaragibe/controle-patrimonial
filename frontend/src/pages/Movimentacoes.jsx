import { useEffect, useState } from 'react'
import axios from 'axios'

function Movimentacoes() {

  const [movimentacoes, setMovimentacoes] = useState([])
  const [patrimonios, setPatrimonios] = useState([])
  const [patrimonioId, setPatrimonioId] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [novaLocalizacao, setNovaLocalizacao] = useState('')

  async function buscarMovimentacoes() {

    try {

      const token = localStorage.getItem('token')

      const resposta = await axios.get(
        'http://localhost:3000/movimentacoes',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setMovimentacoes(resposta.data)

    } catch (error) {

      console.log(error)

      alert('Erro ao buscar movimentações')

    }

  }

  async function buscarPatrimonios() {

    try {

      const token = localStorage.getItem('token')

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

  async function cadastrarMovimentacao(event) {

    event.preventDefault()

    try {

      const token = localStorage.getItem('token')

      await axios.post(
        'http://localhost:3000/movimentacoes',
        {
          patrimonioId: Number(patrimonioId),
          tipo,
          observacao,
          novaLocalizacao
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Movimentação registrada!')

      setPatrimonioId('')
      setTipo('')
      setObservacao('')
      setNovaLocalizacao('')

      buscarMovimentacoes()
      buscarPatrimonios()

    } catch (error) {

      console.log(error)

      alert('Erro ao registrar movimentação')

    }

  }

  useEffect(() => {

    buscarMovimentacoes()
    buscarPatrimonios()

  }, [])

  return (

    <div className="card p-4 shadow mt-4">

      <h3 className="mb-4">
        Movimentações
      </h3>

      <form
        onSubmit={cadastrarMovimentacao}
        className="mb-4"
      >

        <div className="row">

          <div className="col-md-4 mb-3">

            <select
              className="form-select"
              value={patrimonioId}
              onChange={(e) => setPatrimonioId(e.target.value)}
            >

              <option value="">
                Selecione o patrimônio
              </option>

              {patrimonios.map((patrimonio) => (

                <option
                  key={patrimonio.id}
                  value={patrimonio.id}
                >
                  {patrimonio.nome}
                </option>

              ))}

            </select>

          </div>

          <div className="col-md-3 mb-3">

            <select
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >

              <option value="">
                Tipo
              </option>

              <option value="EMPRESTIMO">
                Empréstimo
              </option>

              <option value="DEVOLUCAO">
                Devolução
              </option>

            </select>

          </div>

          <div className="col-md-3 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />

          </div>

          <div className="col-md-3 mb-3">

            <input
                type="text"
                classname="form-control"
                placeholder="Nova Localização"
                value={novaLocalizacao}
                onChange={(e) => setNovaLocalizacao(e.target.value)}
            />    

          </div>
        

          <div className="col-md-2 mb-3">

            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Registrar
            </button>

          </div>

        </div>

      </form>

      <table className="table">

        <thead>

          <tr>
            <th>Patrimônio</th>
            <th>Tipo</th>
            <th>Usuário</th>
            <th>Observação</th>
            <th>Data</th>
          </tr>

        </thead>

        <tbody>

          {movimentacoes.map((movimentacao) => (

            <tr key={movimentacao.id}>

              <td>{movimentacao.patrimonio.nome}</td>
              <td>{movimentacao.tipo}</td>
              <td>{movimentacao.usuario.nome}</td>
              <td>{movimentacao.observacao}</td>
              <td>{new Date(movimentacao.createdAt).toLocaleString('pt-BR')}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}

export default Movimentacoes