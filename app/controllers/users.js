const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const { secret } = require('../config')

class UsersCtl {
    // 查询用户
    async find (ctx) {
        const { per_page = 3 } = ctx.query
        // 当前页数, 至少为1
        const page = Math.max(ctx.query.page * 1, 1) - 1
        // 至少为1项
        const perPage = Math.max(per_page * 1, 1)
        // 使用mongoose limit() 限制返回
        // 使用mongoose skip() 跳过前面叉叉项
        ctx.body = await User.find({ name: new RegExp(ctx.query.q) })
        .limit(perPage).skip(page * perPage)
    }
    async findById (ctx) {
        const { fields = '' } = ctx.query
        console.log(fields)  // locations;business
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const populateStr = fields.split(';').filter( f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job'
            }
            if (f === 'educations') {
                return 'educations.school educations.major'
            }
            return f
        }).join(' ')
        console.log(selectFields) // +locations +business
        const user = await User.findById(ctx.params.id).select(selectFields)
        .populate(populateStr)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user
    }
    // 新建用户
    async create (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: { type: 'string', required: true}
        })
        const { name } = ctx.request.body
        const repeatedUser = await User.findOne({name})
        if (repeatedUser) {
            ctx.throw(409, '用户已经占用')
        } 
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403,'没有权限')
        }
        await next()
    }
    async update (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: false},
            password: { type: 'string', required: false},
            avatar_url: { type: 'string', required: false},
            gender: { type: 'string', required: false},
            headline: { type: 'string', required: false}
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user
    }
    async delete (ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.status = 204
    }
    async login (ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true},
            password: { type: 'string', required: true}
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) {
            ctx.throw('401', '用户名或密码不正确')
        }
        const {_id, name} = user
        const token = jsonwebtoken.sign({_id, name }, secret, {expiresIn: '1d'})
        ctx.body = { token, _id }
    }
    // 搜索id或用户名
    async searchName (ctx) {
        const user = await User.findOne(ctx.request.body).select('+publishPositions')
        if (!user) {
            ctx.throw('401', '不存在此id或用户名')
        }
        ctx.body = user
    }
    // 关注的人列表
    async listFollowing (ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) {
            ctx.throw(404, '不存在此用户')
        }
        ctx.body = user.following
    }
    // 粉丝列表
    async listFollowers (ctx) {
        const users = await User.find({ following: ctx.params.id })
        ctx.body = users
    }
    // 检查用户存在与否中间件
    async checkUserExist (ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        await next()
    }
    // 关注某人
    async follow (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    // 取消关注某人
    async unfollow (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
    // 关注的工作列表
    async listFollowingPositions (ctx) {
        const user = await User.findById(ctx.params.id).select('+followingPosition').populate('followingPosition')
        if (!user) {
            ctx.throw(404, '不存在此用户')
        }
        ctx.body = user.followingPosition
    }
    // 关注某工作
    async followPosition (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingPosition')
        if (!me.followingPosition.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingPosition.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    // 取消关注某工作
    async unfollowPosition (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingPosition')
        const index = me.followingPosition.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.followingPosition.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
}

module.exports = new UsersCtl