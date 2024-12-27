const {Router} = require('express')
const signUpControllers = require('../controllers/signUpController')
const signUpRouter = Router()

signUpRouter.get('/', signUpControllers.signUpGet)
signUpRouter.post('/', signUpControllers.signUpPost)

module.exports = signUpRouter;