import React, { useEffect, useState } from 'react'
import axios from 'axios'

function CadastrarBem() {
  const [patrimonios, setPatrimonios] = useState([])
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [patrimonio, setPatrimonio] = useState('')
  const [status, setStatus] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [idEdicao, setIdEdicao] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  async function buscarPatrimonios() {
    try {
      const token = localStorage.getItem('token')
      const resposta = await axios.get('http://localhost:3000/patrimonios', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPatrimonios(resposta.data)
    } catch (error) {
      console.log(error)
      // alert('Erro ao buscar patrimônios') // Comentado pro visual não travar antes do DB ligar
    }
  }

  async function cadastrarPatrimonio(event) {
    event.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (idEdicao)  {
        await axios.put(
          `http://localhost:3000/patrimonios/${idEdicao}`,
          { nome, tipo, patrimonio, status, localizacao },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert('Patrimônio atualizado!')
      } else {
        await axios.post(
          'http://localhost:3000/patrimonios',
          { nome, tipo, patrimonio, status, localizacao },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert('Patrimônio cadastrado!')
      } 
      setNome('')
      setTipo('')
      setPatrimonio('')
      setStatus('')
      setLocalizacao('')
      setIdEdicao(null)
      buscarPatrimonios()
    } catch (error) {
      console.log(error)
      alert('Erro ao cadastrar patrimônio')
    }
  }

  async function excluirPatrimonio(id) {
    const confirmar = window.confirm('Deseja realmente excluir este patrimônio?')
    if (!confirmar) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:3000/patrimonios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Patrimônio excluído com sucesso!')
      buscarPatrimonios()
    } catch (error) {
      console.log(error)
      alert('Erro ao excluir patrimônio')
    }
  }

  function prepararEdicao(item) {
    setIdEdicao(item.id)
    setNome(item.nome)
    setTipo(item.tipo)
    setPatrimonio(item.patrimonio)
    setStatus(item.status)
    setLocalizacao(item.localizacao)
  }

  useEffect(() => {
    buscarPatrimonios()
  }, [])

  // --- VISUAL DO SEU FIGMA COM BOOTSTRAP ---
  return (
    <div className="container-fluid pt-4">
      
      <h3 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>
        SGP - Controle de Ativos e Inventário Digital
      </h3>

      <div className="p-4 shadow-sm mx-auto mb-5" style={{ backgroundColor: '#D9D9D9', borderRadius: '10px' }}>
        
        <h5 className="fw-bold mb-4">Cadastrar / Editar Bem</h5>
        
        <form onSubmit={cadastrarPatrimonio}>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <input type="text" className="form-control border-0 py-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control border-0 py-2" placeholder="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control border-0 py-2" placeholder="Número Patrimônio" value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control border-0 py-2" placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control border-0 py-2" placeholder="Localização" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} />
            </div>
            
            <div className="col-md-4 d-flex gap-2">
              <button type="submit" className="btn text-white w-100 py-2" style={{ backgroundColor: '#333' }}>
                {idEdicao ? 'Atualizar' : 'Cadastrar'}
              </button>
              {idEdicao && (
                 <button type="button" className="btn btn-secondary py-2" onClick={() => setIdEdicao(null)}>
                   Cancelar
                 </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Tabela de Listagem e Filtros do Alexandre (Com visual adaptado) */}
      <div className="p-4 shadow-sm mx-auto" style={{ backgroundColor: '#D9D9D9', borderRadius: '10px' }}>
        <div className="row mb-4">
          <div className="col-md-8">
            <input type="text" className="form-control border-0 py-2" placeholder="Pesquisar patrimônio..." value={busca} onChange={(e) => setBusca(e.target.value)} />  
          </div>
          <div className="col-md-4">
            <select className="form-select border-0 py-2" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="TODOS">Todos os Status</option>
              <option value="Disponível">Disponível</option>
              <option value="Emprestado">Emprestado</option>
            </select>  
          </div>
        </div>

        <table className="table table-borderless bg-transparent mb-0">
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th className="pb-3">ID</th>
              <th className="pb-3">Nome</th>
              <th className="pb-3">Tipo</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Localização</th>
              <th className="pb-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {patrimonios
              .filter((pat) => {
                const matchBusca = pat.nome.toLowerCase().includes(busca.toLowerCase())
                const matchStatus = filtroStatus === 'TODOS' || pat.status === filtroStatus
                return matchBusca && matchStatus
              })    
              .map((pat) => (
                <tr key={pat.id}>
                  <td className="pt-3">{pat.id}</td>
                  <td className="pt-3">{pat.nome}</td>
                  <td className="pt-3">{pat.tipo}</td>
                  <td className="pt-3">{pat.status}</td>
                  <td className="pt-3">{pat.localizacao}</td>
                  <td className="pt-3 text-center">
                    <button type="button" className="btn btn-sm btn-outline-dark me-2" onClick={() => prepararEdicao(pat)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluirPatrimonio(pat.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default CadastrarBem