
import React, { useState } from 'react'
import axios from 'axios'

function Login() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modoCadastro, setModoCadastro] = useState(false)

  function validarNIP() {
    if (!/^\d{8}$/.test(login)) {
      alert('NIP inválido. O NIP deve conter exatamente 8 números.')
      return false
    }

    return true
  }

  async function entrar(event) {
    event.preventDefault()

    if (!validarNIP()) return

    try {
      const resposta = await axios.post(
        'http://localhost:3000/login',
        { login, senha }
      )

      console.log(resposta.data)

      localStorage.setItem('token', resposta.data.token)

      localStorage.setItem(
        'usuario',
        JSON.stringify(resposta.data.usuario)
      )

      alert('Login realizado com sucesso!')
      window.location.reload()

    } catch (error) {
      console.log(error)
      alert(error.response?.data?.erro || 'Login inválido')
    }
  }

  async function cadastrar(event) {
    event.preventDefault()

    if (!validarNIP()) return

    try {
      const resposta = await axios.post(
        'http://localhost:3000/cadastro',
        { nome, login, senha }
      )

      alert('Cadastro realizado com sucesso! Agora você pode entrar.')

      setModoCadastro(false)
      setNome('')
      setLogin('')
      setSenha('')

      console.log(resposta.data)

    } catch (error) {
      console.log(error)
      alert(error.response?.data?.erro || 'Não foi possível realizar o cadastro')
    }
  }

  return (
    <div className="container-fluid pt-5 mt-5">

      <h3 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>
        Sistema de Gestão de Patrimônio
      </h3>

      <div
        className="p-4 shadow-sm mx-auto"
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '10px',
          maxWidth: '500px'
        }}
      >

        <h5 className="text-center mb-4 fw-bold">
          {modoCadastro ? 'Criar uma conta' : 'Acessar o sistema'}
        </h5>

        <form onSubmit={modoCadastro ? cadastrar : entrar}>

          {modoCadastro && (
            <div className="mb-3">
              <label className="form-label text-dark">
                Nome completo:
              </label>

              <input
                type="text"
                className="form-control border-0 py-2"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-dark">
              NIP:
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="Digite seu NIP"
              className="form-control border-0 py-2"
              value={login}
              onChange={(e) => setLogin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark">
              Senha:
            </label>

            <input
              type="password"
              className="form-control border-0 py-2"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />

            {modoCadastro && (
              <small className="text-muted">
                A senha deve ter pelo menos 6 caracteres.
              </small>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button
              type="submit"
              className="btn text-white px-5 py-2"
              style={{
                backgroundColor: '#333',
                width: '180px'
              }}
            >
              {modoCadastro ? 'Cadastrar' : 'Entrar'}
            </button>
          </div>

        </form>

        <div className="text-center mt-4">

          {modoCadastro ? (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-dark fw-bold"
                onClick={() => setModoCadastro(false)}
              >
                Fazer login
              </button>
            </p>
          ) : (
            <p>
              Ainda não possui uma conta?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-dark fw-bold"
                onClick={() => setModoCadastro(true)}
              >
                Cadastre-se
              </button>
            </p>
          )}

        </div>

      </div>

    </div>
  )
}

export default Login
