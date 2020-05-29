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

let io = require("socket.io")(serv, {});

io.sockets.on("connection", function (socket) {
  console.log(socket.id + " connected on " + new Date());

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

  socket.on("disconnect", function () {
    console.log(socket.id + " left the server on " + new Date());
    for (let i in socketList) {
      if (socket.id == socketList[i].socketId) {
        socket.broadcast.emit("someone quit", socketList[i].id);
      }
    }
  });
});
