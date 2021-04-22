const koa = require('koa')
const koabody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const app = new koa()
const routing = require('./routes')
const { connectionStr} = require('./config')
const cors = require('koa2-cors')

// socket.io
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server, {
    transports: ['websocket']
})

io.on('connection', socket => {
    console.log('连接成功')
    // 发送
    socket.emit('test1', {'test': 1})
    // 接收
    socket.on('test2', data => {
      console.log('收到', data)
    })
})
server.listen(8000)

mongoose.connect(connectionStr, { useNewUrlParser: true,useUnifiedTopology: true },() => console.log('MongoDB 连接成功了！'))
mongoose.connection.on('error', console.error)

app.use(cors())
app.use(koaStatic(path.join(__dirname,'public')))

app.use(error({
    postFormat: (e,{stack, ...rest}) =>process.env.NODE_ENV === 'production' ? rest: {stack, ...rest}
}))

app.use(koabody({
    multipart: true, // 启用文件
    formidable: {
        uploadDir: path.join(__dirname,'/public/uploads'), // 上传目录
        keepExtensions: true  // 保留拓展名
    }
}))

app.use(parameter(app))
routing(app)

app.listen(3000, () => console.log('程序启动在 3000 端口了'))