const express = require('express')
const { registeredUser, loginUser, reset, addUserByEmail, getUserByEmail } = require('../controllers/auth')
const decodeJWT = require('../middlewares/decodeJWT')
const router = express.Router()


router.post('/register', registeredUser)
router.post('/login', loginUser)
router.post('/reset', decodeJWT, reset)
router.post('/add', decodeJWT, addUserByEmail);
router.get('/allowedEmails', decodeJWT, getUserByEmail)

module.exports = router