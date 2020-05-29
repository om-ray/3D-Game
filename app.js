let express = require("express");
let app = express();
let serv = require("http").Server(app);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
app.use("/dist", express.static(__dirname + "/dist"));
app.use("/Assets", express.static(__dirname + "/client/Assets"));

serv.listen(2000);
console.log("server up");

let socketList = [];
let playerList = [];

let io = require("socket.io")(serv, {});

let Player = function () {
  this.id = Math.floor(10000 + Math.random() * 90000);
  this.hp = 100;
  this.maxHp = 100;
  this.speed = 0.07;
  this.maxSpeed = 0.09;
  this.bulletList = [];
  this.ammoList = [];
  this.movement = {
    forward: false,
    left: false,
    backwards: false,
    right: false,
  };

  this.attack = {
    shoot: false,
  };

  this.shoot = function () {
    socket.emit("shoot");
  };
};

io.sockets.on("connection", function (socket) {
  console.log(socket.id + " connected on " + new Date());
  let player = new Player();
  playerList.push({ player: player, id: socket.id });

  socket.broadcast.emit("New connection", socket.id);

  socket.on("my id", function (id, number) {
    console.log(`Player ${number}'s id: ${id}`);
    socket.broadcast.emit("New players id", id);
    socketList.push({ socketId: socket.id, id: id });
  });

  socket.on("Player info", function (playerinfo) {
    socket.broadcast.emit("updated player info", playerinfo);
  });

  socket.on("Player health", function (playerHealth) {
    socket.broadcast.emit("updated player health", playerHealth);
  });

  socket.on("me", function (them) {
    io.to(them.connector).emit("add them", them.player);
  });

  socket.on("bullet position", function (bulletInfo) {
    // console.log(bulletInfo)
    socket.broadcast.emit("updated bullet info", bulletInfo);
  });

  socket.on("you took damage", function (id) {
    for (let i in socketList) {
      if (id == socketList[i].id) {
        io.to(socketList[i].socketId).emit("You took damage");
      }
    }
  });

  socket.on("disconnect", function () {
    console.log(socket.id + " left the server on " + new Date());
    for (let i in socketList) {
      if (socket.id == socketList[i].socketId) {
        socket.broadcast.emit("someone quit", socketList[i].id);
      }
    }
  });
});
