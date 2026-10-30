import * as THREE from "three";

// 1. Scene, camera and renderer
const container = document.getElementById("game-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bbbd9);
scene.fog = new THREE.Fog(0x8bbbd9, 65, 240);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 350
);
camera.position.set(0, 7.5, 17);
camera.lookAt(0, 0, -10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// 2. Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0x536b42, 2.0));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
sunlight.position.set(-25, 45, 20);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -30;
sunlight.shadow.camera.right = 30;
sunlight.shadow.camera.top = 30;
sunlight.shadow.camera.bottom = -30;
scene.add(sunlight);

// 3. Materials and helper
function material(color, roughness = 0.7, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const roadMaterial = material(0x252a32);
const grassMaterial = material(0x427a42);
const whiteMaterial = material(0xffffff);
const treeMaterial = material(0x176b38);
const trunkMaterial = material(0x765037);

function createBox(width, height, depth, mat, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth), mat
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// 4. Ground and road
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500), grassMaterial
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.12, -70);
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 350), roadMaterial
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -50);
scene.add(road);

for (const x of [-6.8, 6.8]) {
  scene.add(createBox(0.18, 0.04, 350, whiteMaterial, x, 0.03, -50));
}

// 5. Lane markings
const laneMarks = [];
for (const x of [-2.33, 2.33]) {
  for (let i = 0; i < 18; i++) {
    const mark = createBox(
      0.13, 0.035, 5, whiteMaterial, x, 0.04, -145 + i * 18
    );
    laneMarks.push(mark);
    scene.add(mark);
  }
}

// 6. Trees
function createTree(x, z) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2, 7), trunkMaterial
  );
  trunk.position.y = 1;

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.35, 3.5, 7), treeMaterial
  );
  leaves.position.y = 3;

  tree.add(trunk, leaves);
  tree.position.set(x, 0, z);
  scene.add(tree);
  return tree;
}

const scenery = [];
for (let i = 0; i < 30; i++) {
  const z = -150 + i * 12;
  scenery.push(createTree(-10 - Math.random() * 5, z));
  scenery.push(createTree(10 + Math.random() * 5, z));
}

// 7. Car model made from 3D shapes
function createCar(color = 0x00aaff) {
  const car = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({
    color, metalness: 0.65, roughness: 0.25
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x142b40, metalness: 0.5, roughness: 0.15
  });
  const black = material(0x101010);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.65, 3.8), paint
  );
  body.position.y = 0.72;
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.78, 1.85), glass
  );
  cabin.position.set(0, 1.35, 0.05);
  cabin.castShadow = true;
  car.add(cabin);

  const roof = createBox(1.4, 0.12, 1.5, paint, 0, 1.76, 0.08);
  car.add(roof);

  for (const x of [-0.62, 0.62]) {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlight.position.set(x, 0.82, -1.94);
    car.add(headlight);

    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.17, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff2222 })
    );
    taillight.position.set(x, 0.8, 1.94);
    car.add(taillight);
  }

  const wheels = [];
  for (const x of [-0.98, 0.98]) {
    for (const z of [-1.25, 1.25]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.28, 20), black
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.42, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);
    }
  }

  car.userData.wheels = wheels;
  return car;
}

// 8. Player and traffic
const player = createCar(0x008cff);
player.position.set(0, 0, 6);
scene.add(player);

const traffic = [];
const trafficColors = [
  0xff3333, 0xffbb22, 0xeeeeee, 0x9944ff, 0x22bb77, 0x222222
];
const lanes = [-4.5, 0, 4.5];

for (let i = 0; i < 7; i++) {
  const color = trafficColors[Math.floor(Math.random() * trafficColors.length)];
  const car = createCar(color);
  car.position.set(
    lanes[Math.floor(Math.random() * lanes.length)],
    0, -50 - i * 22
  );
  scene.add(car);
  traffic.push(car);
}

// 9. Game state and UI references
let speed = 0;
let distance = 0;
let score = 0;
let running = false;
let paused = false;
let gameFinished = false;
const keys = {};

const speedDisplay = document.getElementById("speed");
const distanceDisplay = document.getElementById("distance");
const scoreDisplay = document.getElementById("score");
const menu = document.getElementById("menu");
const gameOver = document.getElementById("game-over");
const pausedScreen = document.getElementById("paused");

// 10. Keyboard controls
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) {
    event.preventDefault();
  }
  keys[key] = true;
  if (key === "escape" && running) togglePause();
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

// 11. Game start, pause, resume and restart
function startGame() {
  speed = 110;
  distance = 0;
  score = 0;
  player.position.x = 0;
  player.rotation.z = 0;

  traffic.forEach((car, i) => {
    car.position.x = lanes[Math.floor(Math.random() * lanes.length)];
    car.position.z = -55 - i * 23;
  });

  menu.classList.add("hidden");
  gameOver.classList.add("hidden");
  pausedScreen.classList.add("hidden");
  running = true;
  paused = false;
  gameFinished = false;
  updateHUD();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  pausedScreen.classList.toggle("hidden", !paused);
}

function endGame() {
  running = false;
  gameFinished = true;
  document.getElementById("final-score").textContent = score.toLocaleString();
  gameOver.classList.remove("hidden");
}

document.getElementById("pause-btn").addEventListener("click", togglePause);
document.getElementById("resume-btn").addEventListener("click", togglePause);
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);

// 12. HUD
function updateHUD() {
  speedDisplay.textContent = Math.round(speed);
  distanceDisplay.textContent = Math.floor(distance);
  scoreDisplay.textContent = score.toLocaleString();
}

// 13. Main game update
function updateGame(delta) {
  if (!running || paused || gameFinished) return;

  if (keys["arrowup"] || keys["w"]) speed += 65 * delta;
  else speed -= 12 * delta;

  if (keys["arrowdown"] || keys["s"]) speed -= 100 * delta;
  speed = THREE.MathUtils.clamp(speed, 70, 190);

  const worldSpeed = speed * 0.12;
  let steering = 0;

  if (keys["arrowleft"] || keys["a"]) steering = -1;
  if (keys["arrowright"] || keys["d"]) steering = 1;

  player.position.x += steering * 8 * delta;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -5.3, 5.3);

  player.rotation.z = THREE.MathUtils.lerp(
    player.rotation.z, -steering * 0.09, 5 * delta
  );

  player.userData.wheels.forEach((wheel) => {
    wheel.rotation.x += worldSpeed * delta;
  });

  laneMarks.forEach((mark) => {
    mark.position.z += worldSpeed * delta;
    if (mark.position.z > 18) mark.position.z -= 324;
  });

  scenery.forEach((tree) => {
    tree.position.z += worldSpeed * delta;
    if (tree.position.z > 20) tree.position.z -= 360;
  });

  traffic.forEach((car) => {
    car.position.z += worldSpeed * delta * 0.85;
    car.userData.wheels.forEach((wheel) => {
      wheel.rotation.x += worldSpeed * delta;
    });

    if (car.position.z > 16) {
      car.position.z = -120 - Math.random() * 60;
      car.position.x = lanes[Math.floor(Math.random() * lanes.length)];
    }

    const distanceZ = Math.abs(player.position.z - car.position.z);
    const distanceX = Math.abs(player.position.x - car.position.x);
    if (distanceZ < 2.7 && distanceX < 1.9) endGame();
  });

  distance += speed * delta / 3.6;
  score = Math.floor(distance * 10);
  updateHUD();

  camera.position.x = THREE.MathUtils.lerp(
    camera.position.x, player.position.x * 0.3, 3 * delta
  );
  camera.lookAt(player.position.x * 0.2, 0.7, -10);
}

// 14. Resize and animation loop
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});

let previousTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  const delta = Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  updateGame(delta);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
