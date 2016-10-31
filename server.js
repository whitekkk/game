// var express = require('express')
// var app = express()

// app.use(express.static('dist'))

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!')
// })

var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

server.listen(8080, function () {
  console.log('app listening on port 8080!')
})

app.use(express.static('dist'))

io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' })
  socket.on('put name', function (data) {
    console.log(data)
    socket.emit('news', data)
  })
})
