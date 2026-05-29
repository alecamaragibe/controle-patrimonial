const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization

    if (!authHeader) {

      return res.status(401).json({
        erro: 'Token não informado'
      })

    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (error, decoded) => {

        if (error) {

          return res.status(401).json({
            erro: 'Token inválido'
          })

        }

        req.usuarioId = decoded.id

        next()

      }
    )

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    })

  }

}

module.exports = authMiddleware