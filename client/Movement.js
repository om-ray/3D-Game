let THREE = require("three");
let Draw = require("./Draw");
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
let gameContainerDiv = document.getElementById("gameContainerDiv");
// let socket = io();
let cursor = document.getElementById("cursor");
let camera = Draw.sendCamera();
let state = {
  locked: false,
};

let controls = new PointerLockControls(camera, document.body);

gameContainerDiv.addEventListener("click", function () {
  cursor.style.left = 50 + "vw";
  cursor.style.top = 50 + "vh";
  controls.lock();
  state.locked = true;
});

gameContainerDiv.addEventListener("keypress", function (e) {
  if (e.keyCode == 27) {
    controls.unlock();
    state.locked = false;
  }
});

export let sendState = function () {
  return state.locked;
};

export let actionChecker = function (player) {
  if (state.locked) {
    document.addEventListener("keydown", function (e) {
      if (e.key == player.keycodes[0]) {
        player.movementDirection.up = true;
      }
      if (e.key == player.keycodes[1]) {
        player.movementDirection.left = true;
      }
      if (e.key == player.keycodes[2]) {
        player.movementDirection.down = true;
      }
      if (e.key == player.keycodes[3]) {
        player.movementDirection.right = true;
      }
      if (
        e.key == "r" &&
        player.state.reloading == true &&
        player.ammoLeft <= 0
      ) {
        Draw.clearCanvas();
        Draw.drawMessage("You are still reloading!");
        setTimeout(() => {
          Draw.clearCanvas();
        }, 1 * 500);
      }
      if (e.key == "r" && player.ammoLeft > 0) {
        Draw.clearCanvas();
        Draw.drawMessage("You still have ammo!");
        setTimeout(() => {
          Draw.clearCanvas();
        }, 1 * 500);
      }
      if (e.key == "r" && player.ammoLeft <= 0) {
        player.state.reloading = true;
      }
    });

    document.addEventListener("keyup", function (e) {
      if (e.key == player.keycodes[0]) {
        player.movementDirection.up = false;
      }
      if (e.key == player.keycodes[1]) {
        player.movementDirection.left = false;
      }
      if (e.key == player.keycodes[2]) {
        player.movementDirection.down = false;
      }
      if (e.key == player.keycodes[3]) {
        player.movementDirection.right = false;
      }
    });
  }
};

export let attackChecker = function (player) {
  if (state.locked) {
    document.addEventListener("mousedown", function (e) {
      if (e.button == 0) {
        player.attack.shooting = true;
      }
    });
    document.addEventListener("mouseup", function () {
      player.attack.shooting = false;
    });
  }
};

export let mover = function (player) {
  if (player.priority === "yes") {
    if (player.movementDirection.up) {
      controls.moveForward(player.speed);
    }
    if (player.movementDirection.left) {
      controls.moveRight(-player.speed);
    }
    if (player.movementDirection.down) {
      controls.moveForward(-player.speed);
    }
    if (player.movementDirection.right) {
      controls.moveRight(player.speed);
    }
  }
};

let shootingClock = new THREE.Clock({ autoStart: false });
shootingClock.start();

export let attacker = function (player) {
  if (player.attack.shooting && player.ammoLeft > 0) {
    if (shootingClock.getElapsedTime() >= 0) {
      player.shoot();
      shootingClock.start();
    }
  } else if (player.attack.shooting && player.ammoLeft <= 0) {
    Draw.clearCanvas();
    Draw.drawMessage("You have no ammo left! Press 'r' to reload!");
    setTimeout(() => {
      Draw.clearCanvas();
    }, 1 * 500);
  }
};
