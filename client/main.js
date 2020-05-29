//------------------------------------------------------------------------------------------------//
let THREE = require("three");
let Draw = require("./Draw");
let Enemy = require("./Enemy");
let Player = require("./Player");
let Bullets = require("./Bullets");
let Logic = require("./GameLogic");
let Movement = require("./Movement");
let socket = io({ reconnection: false });
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

let objects = {
  enemies: [],
  players: [],
};

window.addEventListener("resize", Draw.resize, false);
window.addEventListener("load", Draw.resize);

let camera = Draw.sendCamera();
let controls = new PointerLockControls(camera, document.body);
let skyBBox = Draw.drawSkySphereAndGround();

Draw.getLight();
Draw.drawSkySphereAndGround();
let player = new Player.Player(["w", "a", "s", "d"], "yes");
objects.players.push(player);
socket.emit("my id", player.id, player.number);

let firstEnemy = new Enemy.Enemy();
objects.enemies.push(firstEnemy);

/* 
Logic runner functions
::::::::START:::::::::
!!!!!!!!!HERE!!!!!!!!!
*/

let pvpChecker = function () {
  for (let i in objects.players) {
    for (let u in objects.players[i].bulletList) {
      if (
        Logic.collisionChecker(
          objects.players[i].bulletList[u].collisionBBox,
          objects.players[i].collisionBBox
        )
      ) {
        if (
          objects.players[i].id != player.id &&
          objects.players[i].bulletList[u].substitute != true
        ) {
          objects.players[i].health -= 1;
          for (let n in player.bulletList) {
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

let sendPlayerInfo = function () {
  socket.emit("Player info", {
    id: player.id,
    x: player.mesh.position.x,
    y: player.mesh.position.y,
    z: player.mesh.position.z,
    rotation: player.mesh.rotation.y,
    bulletList: player.bulletList.length,
  });
};

let sendBulletInfo = function () {
  if (player.bulletList.length > 0) {
    socket.emit("bullet position", {
      id: player.id,
      bulletsId: player.bulletList[player.bulletList.length - 1].id,
      bulletsX: player.bulletList[player.bulletList.length - 1].mesh.position.x,
      bulletsY: player.bulletList[player.bulletList.length - 1].mesh.position.y,
      bulletsZ: player.bulletList[player.bulletList.length - 1].mesh.position.z,
    });
  }
};

let playerLogicRunner = function () {
  for (let i in objects.players) {
    let players = objects.players[i];
    players.draw();
    Movement.actionChecker(players);
    Movement.mover(players);
    Movement.attackChecker(players);
    Movement.attacker(players);
  }
};

let enemyLogicRunner = function () {
  for (let i in objects.enemies) {
    let enemies = objects.enemies[i];
    enemies.draw();
  }
};

let basicGameLogicRunner = function () {
  Draw.setCanvasStyling();
  Draw.drawCrosshair();
  for (let u in objects.players) {
    let players = objects.players[u];

    for (let i in objects.enemies) {
      let enemies = objects.enemies[i];

      for (let n in objects.players[u].bulletList) {
        let bullets = objects.players[u].bulletList[n];

        for (let m in objects.enemies[i].bulletList) {
          let enemybullets = objects.enemies[i].bulletList[m];
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

      for (let m in objects.enemies[i].bulletList) {
        let enemybullets = objects.enemies[i].bulletList[m];
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

/* 
Logic runner functions
:::::::::END::::::::::
!!!!!!!!!HERE!!!!!!!!!
*/
//---NO MAN'S LAND---//
/*
Socket.on's
:::START:::
!!!HERE!!!!
*/

socket.on("New connection", function (connector) {
  console.log("New player connected");
  let newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  objects.players.push(newPlayer);
  socket.emit("me", { player: player, connector: connector });
});

socket.on("someone quit", function (id) {
  console.log("removing!");
  for (let i in objects.players) {
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
  let newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  newPlayer.id = them.id;
  objects.players.push(newPlayer);
});

socket.on("New players id", function (newId) {
  if (objects.players.length > 1) {
    objects.players[objects.players.length - 1].id = newId;
  }
});

socket.on("updated player health", function (updatedInfo) {
  for (let i in objects.players) {
    if (objects.players[i].id == updatedInfo.id) {
      objects.players[i].setHealth(updatedInfo.health);
    }
  }
});

socket.on("updated player info", function (updatedInfo) {
  for (let i in objects.players) {
    if (objects.players[i].id == updatedInfo.id) {
      objects.players[i].setPosition(
        updatedInfo.x,
        updatedInfo.y,
        updatedInfo.z,
        updatedInfo.rotation
      );
      while (updatedInfo.bulletList > objects.players[i].bulletList.length) {
        objects.players[i].bulletList.push(new Bullets.Bullet(true));
      }
    }
  }
});

socket.on("updated bullet info", function (bulletInfo) {
  for (let i in objects.players) {
    if (objects.players[i].id == bulletInfo.id) {
      if (objects.players[i].bulletList.length > 0) {
        objects.players[i].bulletList[
          objects.players[i].bulletList.length - 1
        ].setPosition(
          bulletInfo.bulletsX,
          bulletInfo.bulletsY,
          bulletInfo.bulletsZ
        );
      }
    }
  }
});
/*
Socket.on's
::::END::::
!!!!HERE!!!
*/
//---NO MAN'S LAND---//
/*
Games main functions
:::::::START::::::::
!!!!!!!!HERE!!!!!!!!
*/

let gameLoop = function () {
  sendPlayerInfo();
  basicGameLogicRunner();
  pvpChecker();
  playerLogicRunner();
  sendBulletInfo();
};

let animate = function () {
  //enemyLogicRunner();
  gameLoop();
  Draw.render();
};

setInterval(() => {
  animate();
}, 10);

/*
Games main functions
::::::::END:::::::::
!!!!!!!!HERE!!!!!!!!
*/
