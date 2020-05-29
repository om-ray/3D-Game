let THREE = require("three");
let Draw = require("./Draw");

let playerBulletTexture = new THREE.TextureLoader().load(
  "/Assets/textures/brass.jpg"
);

let playerBulletgeometry = new THREE.BufferGeometry().fromGeometry(
  new THREE.SphereGeometry(0.02, 32, 32)
);

let playerBulletMaterial = new THREE.MeshBasicMaterial({
  map: playerBulletTexture,
  wireframe: false,
});

let playerBulletSubstituteMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: false,
});

export let Bullet = function (substitute) {
  this.type = "Bullet";
  this.id = Math.floor(100000 + Math.random() * 900000);
  this.substitute = substitute;
  if (this.substitute !== true) {
    this.mesh = new THREE.Mesh(playerBulletgeometry, playerBulletMaterial);
  } else if (this.substitute == true) {
    this.mesh = new THREE.Mesh(
      playerBulletgeometry,
      playerBulletSubstituteMaterial
    );
  }
  this.collisionBBox = new THREE.Box3();
  this.collisionBBoxHelper = new THREE.Box3Helper(this.collisionBBox, 0xffffff);
  this.collisionBBoxHelper.visible = false;
  Draw.followCamera(this.mesh);
  this.mesh.translateY(-0.05);
  this.mesh.castShadow = true;
  this.updateBBox = function () {
    this.mesh.geometry.computeBoundingBox();
    this.collisionBBox
      .copy(this.mesh.geometry.boundingBox)
      .applyMatrix4(this.mesh.matrixWorld);
    this.collisionBBoxHelper.updateMatrixWorld();
  };
  this.remove = function () {
    Draw.removeMesh(this.mesh);
    Draw.removeMesh(this.collisionBBoxHelper);
    Draw.removeMesh(this.collisionBBox);
    Draw.removeMesh(this.material);
    Draw.removeMesh(this.geometry);
  };

  this.setPosition = function (x, y, z) {
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
    this.updateBBox();
  };

  this.draw = function () {
    this.updateBBox();
    Draw.drawMesh(this.collisionBBoxHelper);
    this.mesh.translateZ(-1);
  };
};

let enemyBulletTexture = new THREE.TextureLoader().load(
  "/Assets/textures/slime.jpg"
);

let enemyBulletgeometry = new THREE.BufferGeometry().fromGeometry(
  new THREE.SphereGeometry(0.1, 4, 2)
);

let enemyBulletmaterial = new THREE.MeshBasicMaterial({
  map: enemyBulletTexture,
  wireframe: false,
});

export let enemyBullet = function (enemy) {
  this.type = "enemyBullet";
  this.enemy = enemy;
  this.mesh = new THREE.Mesh(enemyBulletgeometry, enemyBulletmaterial);
  this.collisionBBox = new THREE.Box3();
  this.collisionBBoxHelper = new THREE.Box3Helper(this.collisionBBox, 0xffffff);
  this.collisionBBoxHelper.visible = false;
  this.mesh.position.copy(this.enemy.position);
  this.mesh.rotation.copy(this.enemy.rotation);
  this.mesh.translateY(-0.08);
  this.mesh.castShadow = true;
  Draw.drawMesh(this.collisionBBoxHelper);
  this.updateBBox = function () {
    this.mesh.geometry.computeBoundingBox();
    this.collisionBBox
      .copy(this.mesh.geometry.boundingBox)
      .applyMatrix4(this.mesh.matrixWorld);
  };

  this.remove = function () {
    Draw.removeMesh(this.mesh);
    Draw.removeMesh(this.collisionBBoxHelper);
    Draw.removeMesh(this.collisionBBox);
    Draw.removeMesh(this.material);
    Draw.removeMesh(this.geometry);
  };

  this.draw = function () {
    this.mesh.translateZ(0.5);
    this.updateBBox();
    this.collisionBBoxHelper.updateMatrixWorld();
    Draw.drawMesh(this.collisionBBoxHelper);
  };
};
