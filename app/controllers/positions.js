const { Schema } = require('mongoose')
const Position = require('../models/positions')
const User = require('../models/users')

class PositionCtl {
    // 新建职位
    async create (ctx) {
        ctx.verifyParams({
            title: {type: 'string', required: true},
            description: { type: 'string', required: true},
            location: { type: 'string', required: true },
            category: { type: 'string', required: true },
            salary: { type: 'string', required: true },
            place: { type: 'string', required: true }
        })
        const position = await new Position({...ctx.request.body, publisher: ctx.state.user._id})
        .save()
        const me = await User.findById(ctx.state.user._id).select('+publishPositions')
        if (!me.publishPositions.map(id => id.toString()).includes(position._id)) {
            me.publishPositions.push(position._id)
            me.save()
        }
        ctx.body = position
    }
    // 查询职位
    async find (ctx) {
        const { per_page = 10 } = ctx.query
        // 当前页数, 至少为1
        const page = Math.max(ctx.query.page * 1, 1) - 1
        // 至少为1项
        const perPage = Math.max(per_page * 1, 1)
        // 使用mongoose limit() 限制返回
        // 使用mongoose skip() 跳过前面叉叉项
        ctx.body = await Position.find({
            $or:[
                {title: new RegExp(ctx.query.q)},
                {category: new RegExp(ctx.query.q)},
                {location: new RegExp(ctx.query.q)}
            ]
            }).populate('publisher')
            // .limit(perPage).skip(page * perPage)
    }
    // 查询特定职位
    async findById (ctx) {
        const position = await Position.findById(ctx.params.id).populate('publisher')
        if (!position) {
            ctx.throw(404, '职位不存在')
        }
        ctx.body = position
    }
    // 检查职位是否存在与是否为发布者
    async checkPositionExistAndOwner (ctx, next) {
        const position = await Position.findById(ctx.params.id)
        if (!position) {
            ctx.throw(404, '职位不存在')
        }
        if (position.publisher != ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    // 更新特定职位
    async update (ctx) {
        const updatePosition = await Position.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = updatePosition
    }
    // 删除特定职位
    async delete (ctx) {
        await Position.findByIdAndRemove(ctx.params.id)
        ctx.status = 204
    }
    // 检查职位是否存在
    async checkPositionExist (ctx, next) {
        const position = await Position.findById(ctx.params.id)
        if (!position) {
            ctx.throw(404, '职位不存在')
        }
        await next()
    }
}

module.exports = new PositionCtl