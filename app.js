let express = require("express");
let app = express();
let serv = require("http").Server(app);
let Sequelize = require("sequelize");
let Op = Sequelize.Op;
let nodemailer = require("nodemailer");

let db = new Sequelize("3D Game", "postgres", "aq123edsMI.", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
});

db.authenticate()
  .then(function () {
    console.log("Database connected");
  })
  .catch(function (err) {
    console.log("Error:", err);
  });

let Accounts = db.define("Accounts", {
  Email: Sequelize.TEXT,
  Username: Sequelize.TEXT,
  Password: Sequelize.TEXT,
  Code: Sequelize.INTEGER,
  Verified: Sequelize.BOOLEAN,
  Score: Sequelize.BIGINT,
  MatchesWon: Sequelize.BIGINT,
  Ties: Sequelize.BIGINT,
  HP: Sequelize.BIGINT,
});

db.sync(/*{ force: true }*/);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
app.use("/dist", express.static(__dirname + "/dist"));
app.use("/Assets", express.static(__dirname + "/client/Assets"));

serv.listen(2000);
console.log("server up");

let current_minutes;
let current_minutes2;
let current_seconds;
let current_seconds2;
let matchIsEnding = false;
let betweenMatches = false;

let countdown = function (seconds) {
  seconds = seconds;

  function tick() {
    seconds--;
    current_minutes = parseInt(seconds / 60);
    current_seconds = seconds % 60;

    if (seconds > 0) {
      setTimeout(tick, 1000);
    } else if (seconds <= 0) {
      matchIsEnding = true;
      between(60);
    }
  }
  tick();
};

let between = function (seconds2) {
  seconds2 = seconds2;

  function tick2() {
    seconds2--;
    current_minutes2 = parseInt(seconds2 / 60);
    current_seconds2 = seconds2 % 60;
    if (seconds2 > 0) {
      betweenMatches = true;
      setTimeout(tick2, 1000);
    } else if (seconds2 <= 0) {
      betweenMatches = false;
      reset();
    }
  }
  tick2();
};

let reset = function () {
  countdown(300);
};

countdown(300);

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

let sendVerificationCode = function (data) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "omihridesh",
      pass: "aq123edsMI.changed",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: '"WAR" <omihridesh@gmail.com>',
    to: data.Email,
    subject: "WAR verification",
    text: `Here is your verification code:\n ${data.Code.toString()}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.render("contact", { msg: "Email has been sent" });
  });
};

io.sockets.on("connection", function (socket) {
  console.log(
    socket.id + " joined the server on " + new Date().toLocaleString()
  );
  let player = new Player();
  playerList.push({ player: player, id: socket.id });

  socket.broadcast.emit("New connection", socket.id);

  socket.on("my id", function (id, number) {
    console.log(`Player ${number}'s id: ${id}`);
    socket.broadcast.emit("New players id", id);
    socketList.push({ socketId: socket.id, id: id });
  });

  socket.on("Verification Code", function (code, username) {
    Accounts.findOne({
      where: { Username: username, Code: code },
    }).then(function (accountExists) {
      if (accountExists != null) {
        socket.emit("correct verification code");
        Accounts.update({ Verified: true }, { where: { Username: username } });
      }
      if (accountExists == null) {
        socket.emit("wrong code");
      }
    });
  });

  socket.on("sign in attempt", function (username, password) {
    Accounts.findOne({
      where: { Username: username, Password: password },
    }).then(function (accountExists) {
      if (accountExists != null && accountExists.dataValues.Verified == true) {
        socket.emit("log in successful");
      }
      if (accountExists != null && accountExists.dataValues.Verified == false) {
        socket.emit("Please verify your account");
      }
      if (accountExists == null) {
        socket.emit("log in unsuccessful");
      }
    });
  });

  socket.on("sign up attempt", function (email, username, password) {
    Accounts.findOne({
      where: { [Op.or]: [{ Email: email }, { Username: username }] },
    }).then(function (accountExists) {
      if (accountExists == null) {
        Accounts.create({
          Email: email,
          Username: username,
          Password: password,
          Code: Math.floor(100000 + Math.random() * 900000),
          Verified: false,
          Score: 0,
          MatchesWon: 0,
          Ties: 0,
          HP: 100,
        });
        socket.emit("account created", email);
      }
      if (
        accountExists != null &&
        accountExists.dataValues.Username == username
      ) {
        socket.emit("username taken");
      }
      if (accountExists != null) {
        socket.emit("account exists");
      }
    });
  });

  socket.on("send verification code", function (data) {
    Accounts.findOne({ where: { Email: data } }).then(function (accountExists) {
      if (accountExists != null && accountExists.dataValues.Verified == false) {
        sendVerificationCode(accountExists.dataValues);
        socket.emit("Verification code sent");
      }
    });
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
    console.log(
      socket.id + " left the server on " + new Date().toLocaleString()
    );
    for (let i in socketList) {
      if (socket.id == socketList[i].socketId) {
        socket.broadcast.emit("someone quit", socketList[i].id);
      }
    }
  });
});

setInterval(() => {
  if (betweenMatches == false) {
    io.emit("current time", {
      minutes: current_minutes,
      seconds: current_seconds,
    });
  }
  if (betweenMatches == true) {
    io.emit("current time2", {
      minutes: current_minutes2,
      seconds: current_seconds2,
    });
  }
  if (matchIsEnding == true) {
    socket.emit("match");
    matchIsEnding = false;
    betweenMatches = true;
  }
}, 10);
