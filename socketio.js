// import sqlQuery from "./module/lcMysql"
var sqlQuery = require('./module/lcMysql')
let socketio = {}
function getSocket(server){
    socketio.io = require('socket.io')(server,{cors:true})
    let io = socketio.io
    io.on('connection', function (socket) {//socket为当时的连接对象
        console.log('connect successfully')
        socket.on('login',async function(data){
            console.log('login')
            //online踢出
            let sqlStr1 = 'select * from user where isonline=? and username=?'
            let result1 = await sqlQuery(sqlStr1,['true',data.username])
            if(result1.length>0){//有人登陆
                console.log('有人登陆')
                socket.to(result1[0].socketid).emit('logout',{content:"有人登陆，您已下线"})
            }

            let sqlStr = "update user set socketid=?,isonline=? where username =?"
            let result = await sqlQuery(sqlStr,[socket.id,'true',data.username])
            socket.emit('login',{
                state: 'OK',
                content:'登陆成功'
            })
            //接收未读
            let sqlStr3 = "select * from chatStorage where toUser = ? and isRead = ? "
            let result3 = await sqlQuery(sqlStr3,[data.username,'false'])
            console.log("未读:"+result3.length)
            socket.emit('unread',Array.from(result3))
            //广播
            let sqlStr2 = "select * from user"
            let result2 = await sqlQuery(sqlStr2)
            io.sockets.emit('users',Array.from(result2))
        })
        socket.on('disconnect',async function(){
            console.log('disconnect')
            let sqlStr = "update user set socketid=?,isonline=? where socketid=?"
            let result = await sqlQuery(sqlStr,[null,null,socket.id])
            let sqlStr1 = "select * from user"
            let result1 = await sqlQuery(sqlStr1)
            io.sockets.emit('users',Array.from(result1))
            // socket.emit('users',Array.from(result1))
        })
        socket.on('users',async function(){
            let sqlStr = "select * from user"
            let result = await sqlQuery(sqlStr)
            socket.emit('users',Array.from(result))
        })
        socket.on('sendTo',async function(data){
            let sqlStr = "select * from user where isonline=? and socketid=?"
            let result = await sqlQuery(sqlStr,['true',data.to.socketid])
            if(result.length>0){
                console.log('对方在线')
                socket.to(data.to.socketid).emit('msg',data)
                let sqlStr = 'insert into chatStorage (fromUser, toUser, content, time, isRead) values (?,?,?,?,?)'
                let arr=[data.from.username,data.to.username,data.content,data.time,'true']
                sqlQuery(sqlStr,arr)
            }else{
                console.log('对方不在线')
                let sqlStr = 'insert into chatStorage (fromUser, toUser, content, time, isRead) values (?,?,?,?,?)'
                let arr=[data.from.username,data.to.username,data.content,data.time,'false']
                sqlQuery(sqlStr,arr)
            }
        })
    });
}
socketio.getSocket = getSocket

module.exports = socketio