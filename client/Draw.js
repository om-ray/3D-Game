var THREE = require("three");
var {
  CSS2DRenderer,
} = require("three/examples/jsm/renderers/CSS2DRenderer.js");

var canvas = document.getElementById("mainGame");
var ctx = canvas.getContext("2d");
var ammocanvas = document.getElementById("ammo");
var ammoctx = ammocanvas.getContext("2d");
var width = "100vw";
var height = "100vh";
canvas.width = width;
canvas.height = height;
ammocanvas.width = 100;
ammocanvas.height = 100;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
var grassTexture = new THREE.TextureLoader().load("/Assets/textures/grass.png");

export var sendCamera = function () {
  return camera;
};

//Camera Positioning
camera.position.z = Math.floor(Math.random() * 50);
camera.position.x = Math.floor(Math.random() * 50);
camera.position.y = 1;

export var drawCrosshair = function () {
  var material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 5,
  });
  var x = 0.01;
  var y = 0.01;
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(0, y, 0));
  geometry.vertices.push(new THREE.Vector3(0, -y, 0));
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(x, 0, 0));
  geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

  var crosshair = new THREE.Line(geometry, material);
  var crosshairPercentX = 50;
  var crosshairPercentY = 50;
  var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
  var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;
  crosshair.position.x = crosshairPositionX * camera.aspect;
  crosshair.position.y = crosshairPositionY;
  crosshair.position.z = -0.3;
  camera.add(crosshair);
  scene.add(camera);
};

export var drawSkySphereAndGround = function () {
  //skyShpere
  var geometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.SphereGeometry(250, 500, 500)
  );
  // var texture = new THREE.TextureLoader().load("Assets/textures/sky.jpg");
  // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(5, 5);
  var material = new THREE.MeshBasicMaterial({
    color: 0x3977e3,
    wireframe: false,
    side: THREE.BackSide,
  });
  var skyShpere = new THREE.Mesh(geometry, material);
  var skyBBox = new THREE.Box3();
  var skyBBoxHelper = new THREE.Box3Helper(skyBBox, 0x00ff00);
  skyShpere.geometry.computeBoundingBox();
  skyBBox
    .copy(skyShpere.geometry.boundingBox)
    .applyMatrix4(skyShpere.matrixWorld);
  scene.add(skyShpere);
  scene.add(skyBBoxHelper);
  skyBBoxHelper.visible = false;

  //Ground
  var geometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.PlaneGeometry(500, 500)
  );
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(5000, 5000);
  var material = new THREE.MeshPhongMaterial({
    map: grassTexture,
    wireframe: false,
  });
  var ground = new THREE.Mesh(geometry, material);
  ground.receiveShadow = true;
  scene.add(ground);
  ground.rotation.x = 98.962;
  ground.position.y = -0.5;

  return skyBBox;
};

export var resize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ammocanvas.width = 100;
  ammocanvas.height = 100;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
};

export var drawMesh = function (mesh) {
  scene.add(mesh);
};

export var drawMessage = function (message) {
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
};

export var removeMesh = function (mesh) {
  scene.remove(mesh);
};

export var followCameraPlayer = function (mesh) {
  mesh.position.copy(camera.position);
  mesh.rotation.y = camera.rotation.y;
};

export var followCamera = function (mesh) {
  mesh.position.copy(camera.position);
  mesh.rotation.copy(camera.rotation);
};

export var lookAtCamera = function (mesh) {
  mesh.lookAt(camera.position.x, camera.position.y, camera.position.z);
};

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#eee");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var labelRenderer = new CSS2DRenderer({ antialias: true });
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = 0;
document.body.appendChild(labelRenderer.domElement);

export var render = function () {
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};

export var getLight = function () {
  var spotLight = new THREE.SpotLight(0xffffff, 0.25);
  spotLight.position.set(0, 100, 0);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 4069;
  spotLight.shadow.mapSize.height = 4069;
  scene.add(spotLight);

  var light = new THREE.PointLight(0xffffff, 4, 100, 2);
  light.position.set(0, 80, 0);
  // light.castShadow = true;
  light.shadow.mapSize.width = 4069;
  light.shadow.mapSize.height = 4069;
  light.shadow.radius = 0.01;
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0xfffccc, 1.1);
  scene.add(ambientLight);
};

export var setCanvasStyling = function () {
  ammoctx.font = "25px Courier New";
  ammoctx.textAlign = "center";
  ammoctx.textBaseline = "middle";
  ctx.fillStyle = "red";
  ctx.font = "30px Courier New";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
};

export var drawAmmo = function (ammo) {
  clearAmmoCanvas();
  ammoctx.fillText(ammo, ammocanvas.width / 2, ammocanvas.height / 2);
};

export var clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export var clearAmmoCanvas = function () {
  ammoctx.clearRect(0, 0, ammocanvas.width, ammocanvas.height);
};
