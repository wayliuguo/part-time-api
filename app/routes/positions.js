const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/positions'})
const {
    create, find, findById, update, checkPositionExistAndOwner,
    delete: del
} = require('../controllers/positions')


const { secret } = require('../config')

const auth = jwt({ secret })

router.post('/', auth, create)
router.get('/', find)
router.get('/:id', findById)
router.patch('/:id', auth, checkPositionExistAndOwner, update)
router.delete('/:id', auth, checkPositionExistAndOwner, del)

module.exports = router
