const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
    __v: {type: Number, select: false},
    name: { type: String, required: true },
    password: {type: String, required: true, select: false},
    avatar_url: { type: String, default: 'http://localhost:3000/uploads/upload_07da02dabebf497a3e4da1c7eabacb48.jpg'}, // 头像地址
    gender: { type: String, enum: ['male','female'], default: 'male', required: true}, // 性别，可枚举
    headline: { type: String},  // 一句话介绍
    // 发布的工作
    publishPositions: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Position'} ],
        select: false
    },
    // 关注的人
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        select: false
    },
    // 关注的工作
    followingPosition: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Position'}],
        select: false
    }
})

module.exports = model('User',userSchema)

