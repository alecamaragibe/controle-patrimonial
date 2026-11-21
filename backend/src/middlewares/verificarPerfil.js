
const verificarPerfil = (...perfisPermitidos) => {

    return (req, res, next) => {

      if (!req.usuarioPerfil) {

        return res.status(403).json({
          erro: 'Perfil de usuário não identificado'
        })

      }

      if (!perfisPermitidos.includes(req.usuarioPerfil)) {

        return res.status(403).json({
          erro: 'Você não tem permissão para realizar esta operação'
        })

      }

      next()

    }

  }

  module.exports = verificarPerfil
