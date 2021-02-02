let socketio = {}
function getSocket(server){
    socketio.io = require('socket.io')(server,{cors:true})
    let io = socketio.io
    io.on('connection', function (socket) {//socket为当时的连接对象
        console.log('connect successfully')
        io.sockets.emit('addUser',{
            id:socket.id,
            content:"新用户加入.."
        })
        socket.on('register', function (data) {
        console.log(data);
        socket.emit('hello',{content:data})
        });
        socket.on('sendTo',function(data){
            socket.emit('msg',data).to(data.to)
        })
        socket.on('joinRoom',function(data){
            console.log(data)
            let roomObj = socket.join(data.room)
            console.log(roomObj)
        })
        socket.on('sendToRoom',function(data){
            console.log(data)
            socket.to(data.room).emit('groupChat',data)
        })
    });

    //namespace
    let qq = io.of('/qq')
    qq.on('connection',function(){
        qq.emit('hello',{content:'From namespace qq...'})
    })
    
    let wx =  io.of('/wx')
    wx.on('connection',function(){
        wx.emit('hello',{content:'From namespace wx..'})
    })
}
socketio.getSocket = getSocket

module.exports = socketio