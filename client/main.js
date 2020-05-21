//------------------------------------------------------------------------------------------------//
var Draw = require("./Draw");
var Enemy = require("./Enemy");
var Player = require("./Player");
var Bullets = require("./Bullets");
var Logic = require("./GameLogic");
var Movement = require("./Movement");
var socket = io();

var objects = {
  enemies: [],
  players: [],
};

window.addEventListener("resize", Draw.resize, false);
window.addEventListener("load", Draw.resize);

var camera = Draw.sendCamera();

Draw.getLight();
Draw.drawSkySphereAndGround();
var skyBBox = Draw.drawSkySphereAndGround();

var player = new Player.Player(["w", "a", "s", "d"], "yes");
objects.players.push(player);
socket.emit("my id", player.id);

socket.on("New connection", function (connector) {
  console.log("New player connected");
  var newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  objects.players.push(newPlayer);
  socket.emit("me", { player: player, connector: connector });
});

socket.on("someone quit", function (id) {
  console.log("removing!");
  for (var i in objects.players) {
    console.log("removing@");
    if (objects.players[i].id == id) {
      console.log("removing#");
      objects.players[i].remove();
      objects.players.splice(i, 1);
    }
  }
});

socket.on("add them", function (them) {
  console.log("Other players added");
  var newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  newPlayer.id = them.id;
  objects.players.push(newPlayer);
});

socket.on("New players id", function (newId) {
  if (objects.players.length > 1) {
    objects.players[objects.players.length - 1].id = newId;
  }
});

var firstEnemy = new Enemy.Enemy();
objects.enemies.push(firstEnemy);

var playerLogicRunner = function () {
  for (var i in objects.players) {
    var players = objects.players[i];
    players.draw();
    Movement.actionChecker(players);
    Movement.mover(players);
    Movement.attackChecker(players);
    Movement.attacker(players);
  }
};

var pvpChecker = function () {
  for (var i in objects.players) {
    for (var u in objects.players[i].bulletList) {
      if (
        Logic.collisionChecker(
          objects.players[i].bulletList[u].collisionBBox,
          objects.players[i].collisionBBox
        )
      ) {
        if (objects.players[i].id != player.id) {
          objects.players[i].health -= 1;
          for (var n in player.bulletList) {
            player.bulletList[n].remove();
            player.bulletList.splice(n, 1);
          }
          socket.emit("Player health", {
            id: objects.players[i].id,
            health: objects.players[i].health,
          });
        }
      }
    }
  }
};

socket.on("updated player health", function (updatedInfo) {
  objects.players
    .find(function (player) {
      return player.id == updatedInfo.id;
    })
    .setHealth(updatedInfo.health);
});

var enemyLogicRunner = function () {
  for (var i in objects.enemies) {
    var enemies = objects.enemies[i];
    enemies.draw();
  }
};

var basicGameLogicRunner = function () {
  Draw.setCanvasStyling();
  Draw.drawCrosshair();
  for (var u in objects.players) {
    var players = objects.players[u];

    for (var i in objects.enemies) {
      var enemies = objects.enemies[i];

      for (var n in objects.players[u].bulletList) {
        var bullets = objects.players[u].bulletList[n];

        for (var m in objects.enemies[i].bulletList) {
          var enemybullets = objects.enemies[i].bulletList[m];
          if (
            Logic.collisionChecker(
              enemybullets.collisionBBox,
              bullets.collisionBBox
            )
          ) {
            bullets.remove();
            enemybullets.remove();
            enemies.meshHealth -= 10;
            players.bulletList.splice(n, 1);
            objects.enemies[i].bulletList.splice(m, 1);
          }
        }

        if (
          Logic.collisionChecker(enemies.collisionBBox, bullets.collisionBBox)
        ) {
          bullets.remove();
          enemies.meshHealth -= 1;
          players.bulletList.splice(n, 1);
        }
        if (Logic.collisionChecker(skyBBox, bullets.collisionBBox) == false) {
          bullets.remove();
        }
        if (bullets.mesh.position.y <= 0) {
          bullets.remove();
        }
        if (bullets.collisionBBox.distanceToPoint(camera.position) >= 500) {
          bullets.remove();
        }
        if (objects.players[u].bulletList.length >= 500) {
          bullets.remove();
        }
      }

      for (var m in objects.enemies[i].bulletList) {
        var enemybullets = objects.enemies[i].bulletList[m];
        if (
          Logic.collisionChecker(
            enemybullets.collisionBBox,
            players.collisionBBox
          )
        ) {
          enemybullets.remove();
          players.health -= 2;
          objects.enemies[i].bulletList.splice(m, 1);
        }
        if (objects.enemies[i].bulletList.length >= 5) {
          enemybullets.remove();
          objects.enemies[i].bulletList.splice(m, 1);
        }
        if (
          Logic.collisionChecker(skyBBox, enemybullets.collisionBBox) == false
        ) {
          enemybullets.remove();
        }
      }
    }
  }
};

var updatePlayerValues = function () {
  socket.on("updated player info", function (updatedInfo) {
    for (var i in objects.players) {
      if (objects.players[i].id == updatedInfo.id) {
        objects.players[i].setPosition(
          updatedInfo.x,
          updatedInfo.y,
          updatedInfo.z,
          updatedInfo.rotation
        );
      }
    }
    while (updatedInfo.bulletList > objects.players[i].bulletList.length) {
      objects.players[i].bulletList.push(new Bullets.Bullet(true));
    }
  });

  socket.on("updated bullet info", function (bulletInfo) {
    for (var i in objects.players) {
      for (var u in objects.players[i].bulletList) {
        if (objects.players[i].id == bulletInfo.id) {
          objects.players[i].bulletList[u].setPosition(
            bulletInfo.bulletsX,
            bulletInfo.bulletsY,
            bulletInfo.bulletsZ,
            bulletInfo.bulletsRotationX,
            bulletInfo.bulletsRotationY,
            bulletInfo.bulletsRotationZ
          );
          // objects.players[i].bulletList[u].updateBBox();
        }
      }
    }
  });
};

var sendPlayerInfo = function () {
  socket.emit("Player info", {
    id: player.id,
    x: player.mesh.position.x,
    y: player.mesh.position.y,
    z: player.mesh.position.z,
    rotation: player.mesh.rotation.y,
    bulletList: player.bulletList.length,
  });

  if (player.bulletList.length > 0) {
    socket.emit("bullet position", {
      id: player.id,
      bulletsX: player.bulletList[player.bulletList.length - 1].mesh.position.x,
      bulletsY: player.bulletList[player.bulletList.length - 1].mesh.position.y,
      bulletsZ: player.bulletList[player.bulletList.length - 1].mesh.position.z,
      bulletsRotationX:
        player.bulletList[player.bulletList.length - 1].mesh.rotation.x,
      bulletsRotationY:
        player.bulletList[player.bulletList.length - 1].mesh.rotation.y,
      bulletsRotationZ:
        player.bulletList[player.bulletList.length - 1].mesh.rotation.z,
    });
  }
};

var gameLoop = function () {
  sendPlayerInfo();
  updatePlayerValues();
  basicGameLogicRunner();
  pvpChecker();
  playerLogicRunner();
};

var animate = function () {
  // enemyLogicRunner();
  gameLoop();
  Draw.render();
  requestAnimationFrame(animate);
};

animate();
