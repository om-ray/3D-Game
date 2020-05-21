var THREE = require("three");
var Draw = require("./Draw");
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
// var socket = io();

var camera = Draw.sendCamera();
var state = {
  locked: false,
};

var controls = new PointerLockControls(camera, document.body);

document.addEventListener("click", function () {
  controls.lock();
  state.locked = true;
});

document.addEventListener("keypress", function (e) {
  if (e.keyCode == 27) {
    controls.unlock();
    state.locked = false;
  }
});

export var sendState = function () {
  return state.locked;
};

export var actionChecker = function (player) {
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

export var attackChecker = function (player) {
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

export var mover = function (player) {
  if (state.locked == true) {
    var speed = 0.07;
    if (player.priority === "yes") {
      if (player.movementDirection.up) {
        controls.moveForward(speed);
      }
      if (player.movementDirection.left) {
        controls.moveRight(-speed);
      }
      if (player.movementDirection.down) {
        controls.moveForward(-speed);
      }
      if (player.movementDirection.right) {
        controls.moveRight(speed);
      }
    }
  }
};

var shootingClock = new THREE.Clock({ autoStart: false });
shootingClock.start();

export var attacker = function (player) {
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
