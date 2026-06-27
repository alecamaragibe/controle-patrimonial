import React, { useState } from 'react'
import axios from 'axios'

function Login() {
  // --- MOTOR DO ALEXANDRE MANTIDO ---
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')

  async function entrar(event) {
    event.preventDefault()
    try {
      const resposta = await axios.post(
        'http://localhost:3000/login',
        { login, senha }
      )
      console.log(resposta.data)
      alert('Login realizado com sucesso!')
      localStorage.setItem('token', resposta.data.token)
      window.location.reload()
    } catch (error) {
      console.log(error)
      alert('Login inválido')
    }
  }

  // --- VISUAL DO SEU FIGMA COM BOOTSTRAP ---
  return (
    <div className="container-fluid pt-5 mt-5">
      
      <h3 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>
        SGP - Controle de Ativos e Inventário Digital
      </h3>

      <div className="p-4 shadow-sm mx-auto" style={{ backgroundColor: '#D9D9D9', borderRadius: '10px', maxWidth: '500px' }}>
        <form onSubmit={entrar}>
          
          <div className="mb-3">
            <label className="form-label text-dark">E-mail (Login):</label>
            <input 
              type="text" 
              className="form-control border-0 py-2" 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark">Senha:</label>
            <input 
              type="password" 
              className="form-control border-0 py-2" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn text-white px-5 py-2" style={{ backgroundColor: '#333', width: '150px' }}>
              Entrar
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}

export default Login