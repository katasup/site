import * as THREE from 'three';

interface Layer {
  mesh: THREE.Mesh;
  scale: number;
  speedX: number;
  speedY: number;
  speedRotate: number;
}

const IS_MOBILE = window.screen.width <= 768;
const EMOJIS = ['1f0cf', '1f30d', '1f31d', '1f336-fe0f', '1f346', '1f34a', '1f34b', '1f34c', '1f351', '1f355', '1f369', '1f36a', '1f37f', '1f389', '1f3b2', '1f3b7', '1f3b8', '1f3c2', '1f3c6', '1f419', '1f42d', '1f437', '1f438', '1f44c', '1f47b', '1f47d', '1f47e', '1f480', '1f48e', '1f4a3', '1f4a9', '1f4ce', '1f4e3', '1f52a', '1f52b', '1f600', '1f602', '1f606', '1f607', '1f609', '1f60d', '1f610', '1f618', '1f61b', '1f621', '1f626', '1f628', '1f62c', '1f62d', '1f62e', '1f631', '1f633', '1f634', '1f636', '1f637', '1f644', '1f680', '1f6b2', '1f6f8', '1f6f9', '1f6fc', '1f911', '1f912', '1f913', '1f914', '1f916', '1f91f', '1f921', '1f923', '1f924', '1f929', '1f92a', '1f92b', '1f92c', '1f92e', '1f92f', '1f951', '1f955', '1f95e', '1f965', '1f96b', '1f970', '1f972', '1f973', '1f975', '1f976', '1f980', '1f981', '1f984', '1f98a', '1f98b', '1f9c0', '1f9c1', '1f9da', '1f9dc-200d-2640-fe0f', '1f9e0', '1fa82', '1fa99', '1fab2', '1fad2', '263a-fe0f', '2693', '270c-fe0f'];

const VSHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FSHADER = `
varying vec2 vUv;

uniform vec3 iResolution;
uniform sampler2D iChannel0;

void main () {
  float Pi = 6.28318530718; // Pi*2

  // GAUSSIAN BLUR SETTINGS {{{
  float Directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
  float Quality = 2.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
  float Size = 6.0; // BLUR SIZE (Radius)
  // GAUSSIAN BLUR SETTINGS }}}

  vec2 Radius = Size/iResolution.xy;

  vec4 Color = texture(iChannel0, vUv);


  for(float d=0.0; d < Pi; d += Pi / Directions) {
    for(float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      Color += texture(iChannel0, vUv + vec2( cos(d), sin(d)) * Radius * i);
    }
  }

  Color /= Quality * Directions;
  gl_FragColor = Color;
}
`;

const loader = new THREE.TextureLoader();
let container: HTMLElement;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let width: number;
let height: number;

let emojiSize: number = 0;
let usedIndexes: number[] = [];
let layersAmount = 0;
let layers: Layer[] = [];

window.addEventListener('resize', handleResize);

export function emojipad(c: HTMLElement) {
    container = c;
    width = container.clientWidth;
    height = container.clientHeight;

    layersAmount = IS_MOBILE ? 50 : 100;
    emojiSize = Math.max(window.innerHeight, window.innerWidth) / (IS_MOBILE ? 5 : 10);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    container.prepend(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('blueviolet');

    const light = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(light);

    camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(width / 2, height / 2, 1000);

    fillLayers();
    requestAnimationFrame(render);
}

function render() {
  renderer.render(scene, camera);

  layers.forEach((layer, i) => {
    layer.mesh.scale.set(layer.scale, layer.scale, 0);
    if (layer.scale !== 1) {
      layer.mesh.position.z = -1;
    }
    transformLayer(layer);
  });

  requestAnimationFrame(render);
}

let resizeTimer: number;

function handleResize () {
  window.clearTimeout(resizeTimer);

  resizeTimer = window.setTimeout(() => {

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  }, 500);
}

function fillLayers() {
  for (let i = layersAmount; i > 0; i--) {
    fillLayer();
  }
}

async function fillLayer() {
  const emoji = randomEmoji();
  const texture = await loader.loadAsync(`/assets/emoji/${emoji}.png`);

  const index = layers.length;
  const blur = index < layersAmount / 2;

  const geometry = new THREE.PlaneBufferGeometry(emojiSize, emojiSize);

  let material;
  if (!blur) {
    material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true });
  } else {
    material = new THREE.ShaderMaterial({
      vertexShader: VSHADER,
      fragmentShader: FSHADER,
      side: THREE.FrontSide,
      transparent: true,
      uniforms: {
        iChannel0: { value: texture },
        iResolution: { value: new THREE.Vector3(emojiSize, emojiSize, 0) },
      },
    });
  }

  let mesh = new THREE.Mesh(geometry, material);

  mesh.position.x = Math.random() * (width);
  mesh.position.y = Math.random() * (height);
  mesh.position.z = 0;

  const layer: Layer = {
    mesh,
    scale: (index < layersAmount / 2 ? 1.2 : 1) + Math.random(),
    speedX: randomDirection(),
    speedY: randomDirection(),
    speedRotate: randomDirection() * Math.PI / 360,
  };

  scene.add(mesh);
  layers.push(layer);
}

function randomEmoji(): string {
  const index = Math.floor(EMOJIS.length * Math.random());

  if (usedIndexes.indexOf(index) >= 0) {
    return randomEmoji();
  }

  usedIndexes.push(index);

  return EMOJIS[index];
}

function randomDirection(): number {
  const dir = (Math.random() * 2 - 1);

  if (dir === 0) {
    return randomDirection();
  }

  return dir;
}

function transformLayer(layer: Layer) {
  if (layer.mesh.position.x < 0 || layer.mesh.position.x > width) {
    layer.speedX = -layer.speedX;
  }

  if (layer.mesh.position.y < 0 || layer.mesh.position.y > height) {
    layer.speedY = -layer.speedY;
  }
  layer.mesh.position.x += layer.speedX;
  layer.mesh.position.y += layer.speedY;

  layer.mesh.rotateZ(layer.speedRotate);
}
