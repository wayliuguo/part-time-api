const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/users'})
const {find, findById, create, update, 
    delete: del, login, checkOwner,
    searchName, listFollowing,listFollowers,
    checkUserExist, follow, unfollow,
    listFollowingPositions, followPosition,
    unfollowPosition
} = require('../controllers/users')
const { checkPositionExist } = require('../controllers/positions')


const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', create)
router.get('/:id', findById) 
router.patch('/:id', auth, checkOwner, update) 
router.delete('/:id', auth, checkOwner, del)

router.post('/login',login)

// 搜索id或用户名
router.post('/search', searchName)

// 关注系列接口
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)

// 关注工作系列接口
router.get('/:id/positionFollowing', listFollowingPositions)
router.put('/followingPosition/:id', auth, checkPositionExist, followPosition)
router.delete('/followingPosition/:id', auth, checkPositionExist, unfollowPosition)

module.exports = router
