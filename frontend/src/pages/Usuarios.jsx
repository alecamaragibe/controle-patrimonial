
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:3000'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [inventarios, setInventarios] = useState([])

  const [idUsuarioEdicao, setIdUsuarioEdicao] = useState(null)
  const [idInventarioEdicao, setIdInventarioEdicao] = useState(null)

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    login: '',
    senha: '',
    perfil: 'usuario'
  })

  const [inventarioForm, setInventarioForm] = useState({
    nome: '',
    descricao: '',
    gestorId: ''
  })

  const [buscaUsuario, setBuscaUsuario] = useState('')
  const [carregando, setCarregando] = useState(false)

  function headers() {
    const token = localStorage.getItem('token')

    return {
      Authorization: `Bearer ${token}`
    }
  }

  function mensagemErro(error) {
    return error.response?.data?.erro ||
      'Não foi possível realizar a operação.'
  }

  async function carregarDados() {
    try {
      setCarregando(true)

      const [respostaUsuarios, respostaInventarios] = await Promise.all([
        axios.get(`${API}/usuarios`, {
          headers: headers()
        }),
        axios.get(`${API}/inventarios`, {
          headers: headers()
        })
      ])

      setUsuarios(respostaUsuarios.data)
      setInventarios(respostaInventarios.data)

    } catch (error) {
      console.log(error)
      alert(mensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // =========================
  // GERENCIAMENTO DE USUÁRIOS
  // =========================

  function atualizarCampoUsuario(event) {
    const { name, value } = event.target

    setUsuarioForm({
      ...usuarioForm,
      [name]: value
    })
  }

  function limparFormularioUsuario() {
    setUsuarioForm({
      nome: '',
      login: '',
      senha: '',
      perfil: 'usuario'
    })

    setIdUsuarioEdicao(null)
  }

  async function salvarUsuario(event) {
    event.preventDefault()

    if (!/^\d{8}$/.test(usuarioForm.login)) {
      alert('O NIP deve conter exatamente 8 números.')
      return
    }

    if (!idUsuarioEdicao && usuarioForm.senha.length < 6) {
      alert('A senha deve possuir pelo menos 6 caracteres.')
      return
    }

    if (
      usuarioForm.senha &&
      usuarioForm.senha.length < 6
    ) {
      alert('A nova senha deve possuir pelo menos 6 caracteres.')
      return
    }

    try {
      const dados = {
        ...usuarioForm
      }

      if (idUsuarioEdicao) {
        await axios.put(
          `${API}/usuarios/${idUsuarioEdicao}`,
          dados,
          { headers: headers() }
        )

        alert('Usuário atualizado com sucesso!')
      } else {
        await axios.post(
          `${API}/usuarios`,
          dados,
          { headers: headers() }
        )

        alert('Usuário cadastrado com sucesso!')
      }

      limparFormularioUsuario()
      carregarDados()

    } catch (error) {
      console.log(error)
      alert(mensagemErro(error))
    }
  }

  function prepararEdicaoUsuario(usuario) {
    setIdUsuarioEdicao(usuario.id)

    setUsuarioForm({
      nome: usuario.nome,
      login: usuario.login,
      senha: '',
      perfil: usuario.perfil
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function excluirUsuario(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este usuário?'
    )

    if (!confirmar) return

    try {
      await axios.delete(
        `${API}/usuarios/${id}`,
        { headers: headers() }
      )

      alert('Usuário excluído com sucesso!')

      carregarDados()

    } catch (error) {
      console.log(error)
      alert(mensagemErro(error))
    }
  }

  // =========================
  // GERENCIAMENTO DE INVENTÁRIOS
  // =========================

  function atualizarCampoInventario(event) {
    const { name, value } = event.target

    setInventarioForm({
      ...inventarioForm,
      [name]: value
    })
  }

  function limparFormularioInventario() {
    setInventarioForm({
      nome: '',
      descricao: '',
      gestorId: ''
    })

    setIdInventarioEdicao(null)
  }

  async function salvarInventario(event) {
    event.preventDefault()

    if (!inventarioForm.gestorId) {
      alert('Selecione um gestor responsável.')
      return
    }

    try {
      const dados = {
        ...inventarioForm,
        gestorId: Number(inventarioForm.gestorId)
      }

      if (idInventarioEdicao) {
        await axios.put(
          `${API}/inventarios/${idInventarioEdicao}`,
          dados,
          { headers: headers() }
        )

        alert('Inventário atualizado com sucesso!')
      } else {
        await axios.post(
          `${API}/inventarios`,
          dados,
          { headers: headers() }
        )

        alert('Inventário cadastrado com sucesso!')
      }

      limparFormularioInventario()
      carregarDados()

    } catch (error) {
      console.log(error)
      alert(mensagemErro(error))
    }
  }

  function prepararEdicaoInventario(inventario) {
    setIdInventarioEdicao(inventario.id)

    setInventarioForm({
      nome: inventario.nome,
      descricao: inventario.descricao,
      gestorId: String(inventario.gestorId || '')
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function excluirInventario(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este inventário?'
    )

    if (!confirmar) return

    try {
      await axios.delete(
        `${API}/inventarios/${id}`,
        { headers: headers() }
      )

      alert('Inventário excluído com sucesso!')

      carregarDados()

    } catch (error) {
      console.log(error)
      alert(mensagemErro(error))
    }
  }

  // Gestores sem inventário ou gestor atualmente associado
  const gestoresDisponiveis = usuarios.filter((usuario) => {
    if (usuario.perfil !== 'gestor') return false

    if (!usuario.inventarioGerenciado) return true

    return (
      idInventarioEdicao &&
      usuario.inventarioGerenciado.id === idInventarioEdicao
    )
  })

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = buscaUsuario.toLowerCase()

    return (
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.login.includes(termo) ||
      usuario.perfil.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="container-fluid pt-4">

      <h3
        className="text-center mb-2 fw-bold"
        style={{ color: '#333' }}
      >
        Gerenciamento Administrativo
      </h3>

      <p className="text-center text-muted mb-5">
        Administração de usuários e inventários do sistema
      </p>

      {/* CADASTRO E EDIÇÃO DE USUÁRIOS */}

      <div
        className="p-4 shadow-sm mx-auto mb-5"
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '10px'
        }}
      >

        <h5 className="fw-bold mb-4">
          {idUsuarioEdicao ? 'Editar Usuário' : 'Cadastrar Usuário'}
        </h5>

        <form onSubmit={salvarUsuario}>

          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                name="nome"
                className="form-control border-0 py-2"
                placeholder="Nome completo"
                value={usuarioForm.nome}
                onChange={atualizarCampoUsuario}
                required
              />
            </div>

            <div className="col-md-3">
              <input
                type="text"
                name="login"
                className="form-control border-0 py-2"
                placeholder="NIP (8 números)"
                value={usuarioForm.login}
                onChange={(event) => {
                  const valor = event.target.value.replace(/\D/g, '').slice(0, 8)

                  setUsuarioForm({
                    ...usuarioForm,
                    login: valor
                  })
                }}
                maxLength={8}
                inputMode="numeric"
                required
              />
            </div>

            <div className="col-md-3">
              <input
                type="password"
                name="senha"
                className="form-control border-0 py-2"
                placeholder={
                  idUsuarioEdicao
                    ? 'Nova senha (opcional)'
                    : 'Senha'
                }
                value={usuarioForm.senha}
                onChange={atualizarCampoUsuario}
                required={!idUsuarioEdicao}
                autoComplete="new-password"
              />
            </div>

            <div className="col-md-2">
              <select
                name="perfil"
                className="form-select border-0 py-2"
                value={usuarioForm.perfil}
                onChange={atualizarCampoUsuario}
                required
              >
                <option value="usuario">Usuário</option>
                <option value="gestor">Gestor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2">

              <button
                type="submit"
                className="btn text-white px-4"
                style={{ backgroundColor: '#002F6C' }}
              >
                {idUsuarioEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </button>

              {idUsuarioEdicao && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormularioUsuario}
                >
                  Cancelar
                </button>
              )}

            </div>

          </div>

        </form>
      </div>

      {/* LISTAGEM DE USUÁRIOS */}

      <div
        className="p-4 shadow-sm mx-auto mb-5"
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '10px'
        }}
      >

        <h5 className="fw-bold mb-4">
          Usuários cadastrados
        </h5>

        <input
          type="text"
          className="form-control border-0 py-2 mb-4"
          placeholder="Pesquisar por nome, NIP ou perfil..."
          value={buscaUsuario}
          onChange={(event) => setBuscaUsuario(event.target.value)}
        />

        <div className="table-responsive">

          <table className="table table-borderless mb-0">

            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th>ID</th>
                <th>Nome</th>
                <th>NIP</th>
                <th>Perfil</th>
                <th>Inventário</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>

            <tbody>

              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>

                  <td className="pt-3">{usuario.id}</td>

                  <td className="pt-3">{usuario.nome}</td>

                  <td className="pt-3">{usuario.login}</td>

                  <td className="pt-3">
                    {usuario.perfil === 'admin'
                      ? 'Administrador'
                      : usuario.perfil === 'gestor'
                        ? 'Gestor'
                        : 'Usuário'}
                  </td>

                  <td className="pt-3">
                    {usuario.inventarioGerenciado?.nome || '—'}
                  </td>

                  <td className="pt-3 text-center">

                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() => prepararEdicaoUsuario(usuario)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => excluirUsuario(usuario.id)}
                    >
                      Excluir
                    </button>

                  </td>

                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* CADASTRO E EDIÇÃO DE INVENTÁRIOS */}

      <div
        className="p-4 shadow-sm mx-auto mb-5"
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '10px'
        }}
      >

        <h5 className="fw-bold mb-4">
          {idInventarioEdicao ? 'Editar Inventário' : 'Cadastrar Inventário'}
        </h5>

        <form onSubmit={salvarInventario}>

          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                name="nome"
                className="form-control border-0 py-2"
                placeholder="Nome do inventário"
                value={inventarioForm.nome}
                onChange={atualizarCampoInventario}
                required
              />
            </div>

            <div className="col-md-4">
              <input
                type="text"
                name="descricao"
                className="form-control border-0 py-2"
                placeholder="Descrição"
                value={inventarioForm.descricao}
                onChange={atualizarCampoInventario}
                required
              />
            </div>

            <div className="col-md-4">
              <select
                name="gestorId"
                className="form-select border-0 py-2"
                value={inventarioForm.gestorId}
                onChange={atualizarCampoInventario}
                required
              >

                <option value="">Selecione o gestor responsável</option>

                {gestoresDisponiveis.map((gestor) => (
                  <option key={gestor.id} value={gestor.id}>
                    {gestor.nome} — {gestor.login}
                  </option>
                ))}

              </select>
            </div>

            <div className="col-12 d-flex gap-2">

              <button
                type="submit"
                className="btn text-white px-4"
                style={{ backgroundColor: '#002F6C' }}
              >
                {idInventarioEdicao ? 'Salvar Alterações' : 'Cadastrar Inventário'}
              </button>

              {idInventarioEdicao && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormularioInventario}
                >
                  Cancelar
                </button>
              )}

            </div>

          </div>

        </form>

        {gestoresDisponiveis.length === 0 && (
          <p className="text-muted mt-3 mb-0">
            Não há gestores disponíveis. Cadastre um usuário com perfil de gestor primeiro.
          </p>
        )}

      </div>

      {/* LISTAGEM DE INVENTÁRIOS */}

      <div
        className="p-4 shadow-sm mx-auto"
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '10px'
        }}
      >

        <h5 className="fw-bold mb-4">
          Inventários cadastrados
        </h5>

        <div className="table-responsive">

          <table className="table table-borderless mb-0">

            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Gestor responsável</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>

            <tbody>

              {inventarios.map((inventario) => (
                <tr key={inventario.id}>

                  <td className="pt-3">{inventario.id}</td>

                  <td className="pt-3">{inventario.nome}</td>

                  <td className="pt-3">{inventario.descricao}</td>

                  <td className="pt-3">
                    {inventario.gestor?.nome || 'Sem gestor'}
                  </td>

                  <td className="pt-3 text-center">

                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() => prepararEdicaoInventario(inventario)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => excluirInventario(inventario.id)}
                    >
                      Excluir
                    </button>

                  </td>

                </tr>
              ))}

              {inventarios.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Nenhum inventário cadastrado.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {carregando && (
        <p className="text-center text-muted mt-4">
          Carregando informações...
        </p>
      )}

    </div>
  )
}

export default Usuarios
