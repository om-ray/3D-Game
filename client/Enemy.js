var THREE = require("three");
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
var Draw = require("./Draw");
var Bullets = require("./Bullets");
var Movement = require("./Movement");

export var Enemy = function () {
  this.type = "Enemy";
  this.geometry = new THREE.BoxGeometry(1, 1, 1);
  this.shootingClock = new THREE.Clock({ autoStart: false });
  this.turnClock = new THREE.Clock({ autoStart: false });
  this.texture = new THREE.TextureLoader().load("Assets/textures/robot.png");
  // this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
  // this.texture.repeat.set(5, 5);
  this.material = new THREE.MeshPhongMaterial({
    map: this.texture,
    wireframe: false,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.collisionBBox = new THREE.Box3();
  this.bulletList = [];
  this.healthBar = document.createElement("progress");
  this.meshHealth = 100;
  this.collisionBBoxHelper = new THREE.Box3Helper(this.collisionBBox, 0x00ff00);
  this.collisionBBoxHelper.visible = false;
  this.updateBBox = function () {
    this.mesh.geometry.computeBoundingBox();
    this.collisionBBox
      .copy(this.mesh.geometry.boundingBox)
      .applyMatrix4(this.mesh.matrixWorld);
  };
  this.respawn = function () {
    this.mesh.position.x = Math.floor(Math.random() * 50);
    this.mesh.position.z = Math.floor(Math.random() * 50);
  };
  this.shootingClock.start();
  this.turnClock.start();
  this.draw = function () {
    this.state = Movement.sendState();
    if (this.shootingClock.getElapsedTime() >= 4 && this.state == true) {
      this.shoot();
      this.shootingClock.start();
    }
    if (this.turnClock.getElapsedTime() > 1) {
      Draw.lookAtCamera(this.mesh);
      this.turnClock.start();
    }

    for (var i in this.bulletList) {
      Draw.drawMesh(this.bulletList[i].mesh);
      this.bulletList[i].draw();
    }
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    Draw.drawMesh(this.mesh);
    this.mesh.position.y = 1;
    this.updateBBox();
    this.collisionBBoxHelper.updateMatrixWorld();
    Draw.drawMesh(this.collisionBBoxHelper);

    if (this.meshHealth >= 0) {
      this.healthBar.max = 99;
      this.healthBar.value = this.meshHealth;
      this.healthBar.classList.add("healthBar");
      this.health = new CSS2DObject(this.healthBar);
      Draw.drawMesh(this.health);
      this.health.position.set(
        this.mesh.position.x,
        this.mesh.position.y + 1,
        this.mesh.position.z
      );
    }
    if (this.meshHealth <= 0) {
      this.respawn();
      for (var i in this.bulletList) {
        this.bulletList[i].remove();
        this.bulletList.splice(i, 1);
      }
      this.meshHealth = 100;
    }
    if (this.bulletList.length >= 200) {
      for (var i in this.bulletList) {
        this.bulletList[i].remove();
        this.bulletList.splice(i, 1);
      }
    }
  };
  this.shoot = function () {
    var newBullet = new Bullets.enemyBullet(this.mesh);
    this.bulletList.push(newBullet);
  };
};
