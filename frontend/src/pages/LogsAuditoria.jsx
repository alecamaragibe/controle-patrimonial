import React, { useEffect, useState } from 'react'
import axios from 'axios'

function LogsAuditoria() {
  const [logs, setLogs] = useState([])

  async function buscarLogs() {
    try {
      const token = localStorage.getItem('token')
      // Tentando estar buscando os logs de auditoria do backend 
      const resposta = await axios.get('http://localhost:3000/auditoria', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(resposta.data)
    } catch (error) {
      console.log("Rota de logs ainda não configurada no backend ou erro de busca.")
    }
  }

  useEffect(() => {
    buscarLogs()
  }, [])

  return (
    <div className="container-fluid pt-4">
      
      <h3 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>
        SGP - Controle de Ativos e Inventário Digital
      </h3>

      <div className="mt-4">
        <h5 className="fw-bold mb-3">Registro de Atividades</h5>
        
        <div className="p-4 shadow-sm" style={{ backgroundColor: '#D9D9D9', borderRadius: '10px' }}>
          
          <table className="table table-borderless bg-transparent mb-0">
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th className="pb-3">ID</th>
                <th className="pb-3">Ação</th>
                <th className="pb-3">Usuário</th>
                <th className="pb-3">Detalhes</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="pt-3">{log.id}</td>
                    <td className="pt-3">{log.acao}</td>
                    <td className="pt-3">{log.usuario?.nome || 'Sistema'}</td>
                    <td className="pt-3">{log.detalhes}</td>
                    <td className="pt-3">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="pt-5 pb-4 text-center text-muted">
                    Nenhum log de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>

    </div>
  )
}

export default LogsAuditoria