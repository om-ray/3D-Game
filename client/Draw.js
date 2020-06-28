let THREE = require("three");
let {
  CSS2DRenderer,
} = require("three/examples/jsm/renderers/CSS2DRenderer.js");

let canvas = document.getElementById("mainGame");
let ctx = canvas.getContext("2d");
let ammocanvas = document.getElementById("ammo");
let ammoctx = ammocanvas.getContext("2d");
let scorecanvas = document.getElementById("score");
let scorectx = scorecanvas.getContext("2d");
let gameContainerDiv = document.getElementById("gameContainerDiv");
let width = document.getElementById("body").clientWidth;
let height = document.getElementById("body").clientHeight;
canvas.width = width;
canvas.height = height;
ammocanvas.width = 100;
ammocanvas.height = 100;
scorecanvas.width = 100;
scorecanvas.height = 100;
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
let grassTexture = new THREE.TextureLoader().load("/Assets/textures/grass.png");

export let sendCamera = function () {
  return camera;
};



//Camera Positioning
camera.position.z = Math.floor(Math.random() * 50);
camera.position.x = Math.floor(Math.random() * 50);
camera.position.y = 1.5;

export let drawCrosshair = function () {
  let material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 5,
  });
  let x = 0.01;
  let y = 0.01;
  let geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(0, y, 0));
  geometry.vertices.push(new THREE.Vector3(0, -y, 0));
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(x, 0, 0));
  geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

  let crosshair = new THREE.Line(geometry, material);
  let crosshairPercentX = 50;
  let crosshairPercentY = 50;
  let crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
  let crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;
  crosshair.position.x = crosshairPositionX * camera.aspect;
  crosshair.position.y = crosshairPositionY;
  crosshair.position.z = -0.3;
  camera.add(crosshair);
  scene.add(camera);
};

export let drawSkySphereAndGround = function () {
  //skyShpere
  let skyGeometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.SphereGeometry(250, 500, 500)
  );
  // let texture = new THREE.TextureLoader().load("Assets/textures/sky.jpg");
  // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(5, 5);
  let skyMaterial = new THREE.MeshBasicMaterial({
    wireframe: false,
    side: THREE.BackSide,
  });
  let skyShpere = new THREE.Mesh(skyGeometry, skyMaterial);
  let skyBBox = new THREE.Box3();
  let skyBBoxHelper = new THREE.Box3Helper(skyBBox, 0x00ff00);
  skyShpere.geometry.computeBoundingBox();
  skyBBox
    .copy(skyShpere.geometry.boundingBox)
    .applyMatrix4(skyShpere.matrixWorld);
  // scene.add(skyShpere);
  scene.add(skyBBoxHelper);
  skyBBoxHelper.visible = false;

  //Ground
  let groudGeometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.PlaneGeometry(500, 500)
  );
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(5000, 5000);
  let groundMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    wireframe: false,
    roughness: 1,
  });
  let ground = new THREE.Mesh(groudGeometry, groundMaterial);
  ground.receiveShadow = true;
  scene.add(ground);
  ground.rotation.x = 98.962;
  ground.position.y = -0.5;

  return skyBBox;
};

export let resize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ammocanvas.width = 100;
  ammocanvas.height = 100;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
};

export let drawMesh = function (mesh) {
  scene.add(mesh);
};

export let removeMesh = function (mesh) {
  scene.remove(mesh);
};

export let followCameraPlayer = function (mesh) {
  mesh.position.copy(camera.position);
  mesh.rotation.y = camera.rotation.y;
};

export let followCamera = function (mesh) {
  mesh.position.copy(camera.position);
  mesh.rotation.copy(camera.rotation);
};

export let lookAtCamera = function (mesh) {
  mesh.lookAt(camera.position.x, camera.position.y, camera.position.z);
};

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#00b0d4");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "renderer";
gameContainerDiv.appendChild(renderer.domElement);

let labelRenderer = new CSS2DRenderer({ antialias: true });
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = 0;
labelRenderer.domElement.id = "labelRenderer";
gameContainerDiv.appendChild(labelRenderer.domElement);

export let render = function () {
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};

export let getLight = function () {
  let spotLight = new THREE.SpotLight(0xffffff, 0.25);
  spotLight.position.set(0, 100, 0);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 4069;
  spotLight.shadow.mapSize.height = 4069;
  scene.add(spotLight);

  let light = new THREE.PointLight(0xffffff, 4, 100, 2);
  light.position.set(0, 80, 0);
  // light.castShadow = true;
  light.shadow.mapSize.width = 4069;
  light.shadow.mapSize.height = 4069;
  light.shadow.radius = 0.01;
  scene.add(light);

  let ambientLight = new THREE.AmbientLight(0xfffccc, 1.1);
  scene.add(ambientLight);
};

export let setCanvasStyling = function () {
  scorectx.font = "25px Cousine-regular";
  scorectx.textAlign = "center";
  scorectx.textBaseline = "middle";
  ammoctx.font = "25px Cousine-regular";
  ammoctx.textAlign = "center";
  ammoctx.textBaseline = "middle";
  ctx.fillStyle = "red";
  ctx.font = "3vw orbitron";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
};

export let drawMessage = function (message, position) {
  clearCanvas();
  if (position == "top" || position == null) {
    ctx.fillText(message.toUpperCase(), canvas.width / 2, canvas.height / 6);
  }
  if (position == "center") {
    ctx.fillText(message.toUpperCase(), canvas.width / 2, canvas.height / 2);
  }
};

export let drawAmmo = function (ammo) {
  clearAmmoCanvas();
  ammoctx.fillText(ammo, ammocanvas.width / 2, ammocanvas.height / 2);
};

export let drawScore = function (score) {
  clearScoreCanvas();
  scorectx.fillText(score, scorecanvas.width / 2, scorecanvas.height / 2);
};

export let clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export let clearAmmoCanvas = function () {
  ammoctx.clearRect(0, 0, ammocanvas.width, ammocanvas.height);
};

export let clearScoreCanvas = function () {
  scorectx.clearRect(0, 0, scorecanvas.width, scorecanvas.height);
};

export let drawDamageOverlay = function () {
  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export let loadContent = function () {
  document.getElementById("notLoadingScreen").style.opacity = "1";
  document.getElementById("loadingScreen").style.opacity = "0";
  document.getElementById("loadingScreen").style.display = "none";
};
