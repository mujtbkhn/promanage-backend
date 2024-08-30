const jwt = require('jsonwebtoken')

const decodeJWT = async (req, res, next) => {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
}
module.exports = decodeJWT

