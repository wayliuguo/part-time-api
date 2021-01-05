const mongoose = require('mongoose')

const { Schema, model } = mongoose

const positionSchema = new Schema({
    __v: { type: Number, select: false},
    // 工作标题
    title: { type: String, required: true},
    // 工作内容
    description: { type: String, required: true},
    // 品类
    category: { type: String, required: true},
    salary: { type: String, required: true },
    location: { type: String, required: true},
    place: { type: String, required: true },
    publisher: { type: Schema.Types.ObjectId, ref: 'User'}
})

module.exports = model('Position',positionSchema)