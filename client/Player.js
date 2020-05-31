//------------------------------------------------------------------------------------------------//
var THREE = require("three");
var Draw = require("./Draw");
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
var Bullets = require("./Bullets");
var camera = Draw.sendCamera();

var geometry = new THREE.BufferGeometry().fromGeometry(
  new THREE.CylinderGeometry(0.5, 0.5, 2, 8, 1)
);

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var material = new THREE.MeshBasicMaterial({
  color: getRandomColor(),
  wireframe: false,
});

var body = document.getElementById("body");

export var Player = function (keycodes, priority) {
  this.number = Math.floor(Math.random() * 10000);
  this.type = "Player";
  this.id = Math.floor(1000 + Math.random() * 9000);
  this.totalAmmo = 500;
  this.priority = priority;
  this.speed = 0.07;
  this.score = 0;
  if (this.priority === "yes") {
    var healthValue = document.createElement("p");
    var healthContainer = document.createElement("div");
    healthContainer.id = this.id;
    var healthBar = document.createElement("progress");
    healthBar.id = this.id;
    healthValue.id = this.id;
    healthContainer.appendChild(healthBar);
    healthContainer.appendChild(healthValue);
    body.appendChild(healthContainer);
    healthContainer.classList.add("health");
    healthContainer.classList.add("healthContainer");
    healthBar.classList.add("healthBar");
    healthBar.classList.add("healthExtra");
    healthValue.classList.add("healthValue");
  }
  this.keycodes = keycodes;
  this.bulletList = [];
  this.ammoList = [];
  this.collisionBBox = new THREE.Box3();
  this.collisionBBoxHelper = new THREE.Box3Helper(this.collisionBBox, 0x00ff00);
  this.collisionBBoxHelper.visible = false;
  this.updateBBox = function () {
    this.mesh.geometry.computeBoundingBox();
    this.collisionBBox
      .copy(this.mesh.geometry.boundingBox)
      .applyMatrix4(this.mesh.matrixWorld);
  };

  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.castShadow = true;
  this.state = {
    reloading: false,
  };

  this.movementDirection = {
    forwards: false,
    left: false,
    backwards: false,
    right: false,
  };

  this.attack = {
    shooting: false,
  };

  this.shoot = function () {
    var newBullet = new Bullets.Bullet();
    this.bulletList.push(newBullet);
    this.ammoList.push(newBullet);
  };

  this.remove = function () {
    Draw.removeMesh(this.mesh);
    Draw.removeMesh(this.collisionBBoxHelper);
    Draw.removeMesh(this.collisionBBox);
    Draw.removeMesh(this.material);
    Draw.removeMesh(this.geometry);
    Draw.removeMesh(this.Barhealth);
  };

  this.health = 100;
  this.respawn = function () {
    camera.position.x = Math.floor(Math.random() * 50);
    camera.position.z = Math.floor(Math.random() * 50);
  };

  this.setPosition = function (x, y, z, rotation) {
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
    this.mesh.rotation.y = rotation;
  };

  this.setHealth = function (health) {
    this.health = health;
  };

  this.displayHealth = document.createElement("progress");
  this.Barhealth = new CSS2DObject(this.displayHealth);
  if (this.health <= 0) {
    this.respawn();
    for (var i in this.bulletList) {
      this.bulletList[i].remove();
      this.bulletList.splice(i, 1);
    }
    this.health = 100;
  }

  this.draw = function () {
    if (this.health >= 0) {
      this.displayHealth.max = 100;
      this.displayHealth.value = this.health;
      this.displayHealth.classList.add("healthBar");
      Draw.drawMesh(this.Barhealth);
      this.Barhealth.position.set(
        this.mesh.position.x,
        this.mesh.position.y + 2,
        this.mesh.position.z
      );
    }

    if (this.priority === "yes") {
      healthValue.innerHTML = `Health: ${this.health}`;

      if (this.health <= 30) {
        healthValue.style.color = "black";
      } else if (this.health > 30) {
        healthValue.style.color = "white";
      }
      healthBar.max = 100;
      healthBar.value = this.health;
    }
    Draw.drawMesh(this.collisionBBoxHelper);
    this.updateBBox();
    this.ammoLeft = this.totalAmmo - this.ammoList.length;
    for (var i in this.bulletList) {
      Draw.drawMesh(this.bulletList[i].mesh);
      this.bulletList[i].draw();
    }
    Draw.drawMesh(this.mesh);
    Draw.drawAmmo(this.ammoLeft);
    this.mesh.updateMatrix();
    if (this.priority === "yes") {
      Draw.followCameraPlayer(this.mesh);
    }
    this.mesh.position.y = 1;
    if (this.state.reloading) {
      for (var i in this.bulletList) {
        Draw.drawMesh(this.bulletList[i].mesh);
        this.bulletList[i].remove();
      }
      this.bulletList = [];
      this.ammoList = [];
      this.state.reloading = false;
    }
    if (this.health <= 0) {
      this.health = 100;
    }
  };
};

// module.exports = {
//   Player,
// };
