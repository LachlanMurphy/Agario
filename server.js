// Initial server setup
var express = require('express'); // import express
var socket = require('socket.io'); // import socket.io

let port = 3000; // Port server is running on
let path = "public/Agario"; // File path server is hosting

var app = express();
var server = app.listen(port);
app.use(express.static(path));

var io = socket(server);

console.log("Server running " + path + " on port: " + port);

// Change these to match the arena size in client
let arenaWidth = 4000;
let arenaHeight = 4000;

// Random number generator
function random(min,max) {
  return Math.random() * (max - min) + min;
}

// Keep track of all the balls
let balls = new Map();
class ball {
  constructor(x,y,r,col,name) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;
    this.name = name;
  }
}

// Keep track of all of the food
let food = new Map();
class Food {
  constructor(x,y,col) {
    this.x = x;
    this.y = y;
    this.col = col;
  }
}

for (let i = 0; i < 800; i++) {
  food.set(i, new Food(random(10,arenaWidth-10),random(10,arenaHeight-10),[random(0,255),random(0,255),random(0,255)]));
}

// Keep track of all the clients
let allClients = [];

// Update the clients with server info
setInterval(() => {
  io.sockets.emit('update', JSON.stringify(Array.from(balls)));
  io.sockets.emit('updateFood', JSON.stringify(Array.from(food)));
}, 30);

io.sockets.on('connection', socket => {
  console.log("new connection: " + socket.id);
  allClients.push(socket);

  socket.on('start', data => {
    balls.set(socket.id, new ball(data.pos.x,data.pos.y,data.r,data.col,data.id));
  });
  
  socket.on('update', ball => {
    if (balls.has(socket.id)) {
      balls.get(socket.id).x = ball.pos.x;
      balls.get(socket.id).y = ball.pos.y;
      balls.get(socket.id).r = ball.r;
    }
  });

  socket.on('eat', ball => {
    io.to(ball[0]).emit('eaten', ball);
    balls.delete(ball[0]);
  });

  socket.on('eatFood', f => {
    food.get(f[0]).x = random(10,arenaWidth-10);
    food.get(f[0]).y = random(10,arenaHeight-10);
  });

  socket.on('disconnect', socket => {
    for (let j = allClients.length-1; j >= 0; j--) {

      if (!allClients[j].connected) {
        for (let i = balls.length-1; i >= 0; i--) {
          if (balls[i].id === allClients[j].id) {
            balls.splice(i,1);
          }
        }

        console.log("DISCONNECT: " + allClients[j].id);
        allClients.splice(j,1);
      }
    }
  });
});