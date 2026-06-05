import { useState } from 'react'
import axios from 'axios'

function Login() {

  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')

  async function entrar(event) {

    event.preventDefault()

    try {

      const resposta = await axios.post(
        'http://localhost:3000/login',

        {
          login,
          senha
        }
      )

      console.log(resposta.data)

      alert('Login realizado com sucesso!')

      localStorage.setItem(
        'token',
        resposta.data.token
      )

      window.location.reload()

    } catch (error) {

      console.log(error)

      alert('Login inválido')

    }

  }

  return (

    <div className="container mt-5">

      <div className="row justify-content-center">

        <div className="col-md-4">

          <div className="card p-4 shadow">

            <h2 className="text-center mb-4">
              Login
            </h2>

            <form onSubmit={entrar}>

              <div className="mb-3">

                <label className="form-label">
                  Login
                </label>

                <input
                  type="text"
                  className="form-control"

                  value={login}

                  onChange={(e) =>
                    setLogin(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label className="form-label">
                  Senha
                </label>

                <input
                  type="password"
                  className="form-control"

                  value={senha}

                  onChange={(e) =>
                    setSenha(e.target.value)
                  }
                />

              </div>

              <button className="btn btn-primary w-100">
                Entrar
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  )

}

export default Login