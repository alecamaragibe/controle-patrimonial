import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Movimentacoes() {
  // --- MANTENDO 100% O CÉREBRO DO CÓDIGO DO ALEXANDRE ---
  const [movimentacoes, setMovimentacoes] = useState([])
  const [patrimonios, setPatrimonios] = useState([])
  const [patrimonioId, setPatrimonioId] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [novaLocalizacao, setNovaLocalizacao] = useState('')

  async function buscarMovimentacoes() {
    try {
      const token = localStorage.getItem('token')
      const resposta = await axios.get('http://localhost:3000/movimentacoes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMovimentacoes(resposta.data)
    } catch (error) {
      console.log(error)
      // Comentado o alert temporariamente só pra não pular na tela enquanto testa o visual
      // alert('Erro ao buscar movimentações')
    }
  }

  async function buscarPatrimonios() {
    try {
      const token = localStorage.getItem('token')
      const resposta = await axios.get('http://localhost:3000/patrimonios', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPatrimonios(resposta.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function cadastrarMovimentacao(event) {
    event.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:3000/movimentacoes',
        { patrimonioId: Number(patrimonioId), tipo, observacao, novaLocalizacao },
        { headers: { Authorization: `Bearer ${token}` } }
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

  // --- VISUAL DO FIGMA COM BOOTSTRAP ---
  return (
    <div className="container-fluid pt-4">
      
      <h3 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>
        SGP - Controle de Ativos e Inventário Digital
      </h3>

      <div className="mt-4">
        <h5 className="fw-bold mb-3">Histórico de Movimentações</h5>
        
        <div className="p-4 shadow-sm" style={{ backgroundColor: '#D9D9D9', borderRadius: '10px' }}>
          
          {/* Formulário integrado com o visual do Figma */}
          <form onSubmit={cadastrarMovimentacao} className="mb-5">
            <div className="row g-3">
              <div className="col-md-3">
                <select className="form-select border-0 py-2" value={patrimonioId} onChange={(e) => setPatrimonioId(e.target.value)}>
                  <option value="">Selecione o patrimônio</option>
                  {patrimonios.map((patrimonio) => (
                    <option key={patrimonio.id} value={patrimonio.id}>
                      {patrimonio.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select border-0 py-2" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="">Tipo</option>
                  <option value="EMPRESTIMO">Empréstimo</option>
                  <option value="DEVOLUCAO">Devolução</option>
                </select>
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control border-0 py-2" placeholder="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
              </div>
              <div className="col-md-2">
                <input type="text" className="form-control border-0 py-2" placeholder="Nova Localização" value={novaLocalizacao} onChange={(e) => setNovaLocalizacao(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn text-white w-100 py-2" style={{ backgroundColor: '#333' }}>
                  Registrar
                </button>
              </div>
            </div>
          </form>

          {/* Tabela do Alexandre integrada na caixa cinza */}
          <table className="table table-borderless bg-transparent mb-0">
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th className="pb-3">Patrimônio</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Usuário</th>
                <th className="pb-3">Observação</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((movimentacao) => (
                <tr key={movimentacao.id}>
                  <td className="pt-3">{movimentacao.patrimonio?.nome}</td>
                  <td className="pt-3">{movimentacao.tipo}</td>
                  <td className="pt-3">{movimentacao.usuario?.nome}</td>
                  <td className="pt-3">{movimentacao.observacao}</td>
                  <td className="pt-3">{new Date(movimentacao.createdAt).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

    </div>
  )
}

export default Movimentacoes