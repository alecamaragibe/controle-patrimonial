const prisma = require('../database/prisma')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const criarUsuario = async (req, res) => {

  try {

    const { nome, login, senha, perfil } = req.body

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        login,
        senha: senhaHash,
        perfil
      }
    })

    return res.status(201).json(usuario)

  } catch (error) {

    if (error.code === 'P2002') {

      return res.status(400).json({
        erro: 'Login já cadastrado'
      })

    }

    return res.status(500).json({
      erro: error.message
    })

  }

}

const loginUsuario = async (req, res) => {

  try {

    const { login, senha } = req.body

    const usuario = await prisma.usuario.findUnique({
      where: {
        login
      }
    })

    if (!usuario) {

      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      })

    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    )

    if (!senhaValida) {

      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      })

    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    )

    return res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        perfil: usuario.perfil
      },
      token
    })

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}
const listarUsuarios = async (req, res) => {

  try {

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        perfil: true
      }
    })

    return res.json(usuarios)

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}
const deletarUsuario = async (req, res) => {

  try {

    const { id } = req.params

    await prisma.usuario.delete({
      where: {
        id: Number(id)
      }
    })

    return res.json({
      mensagem: 'Usuário deletado com sucesso'
    })

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}

const editarUsuario = async (req, res) => {

  try {

    const { id } = req.params

    const {
      nome,
      login,
      senha,
      perfil
    } = req.body

    const dadosAtualizados = {
      nome,
      login,
      perfil
    }

    if (senha) {

      dadosAtualizados.senha = await bcrypt.hash(
        senha,
        10
      )

    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: {
        id: Number(id)
      },
      data: dadosAtualizados
    })

    return res.json(usuarioAtualizado)

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}
module.exports = {
  criarUsuario,
  loginUsuario,
  listarUsuarios,
  deletarUsuario,
  editarUsuario
}