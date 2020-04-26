// Importer three
import * as Three from './node_modules/three/build/three.js';
// Orbitcontrols permet de tourner autour de l'objet avec la souris
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// TransformControls permet de déplacer un objet avec la souris
import { TransformControls } from './node_modules/three/examples/jsm/controls/TransformControls.js';
//GLTFLoader permet de lire des modèles GLTF (texture non intégrée) et GLB (texture intégrée)
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
//élméments de post processing
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
//ajoute un halo de lumière
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
//ajoute des contrôles utilisateur
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
//ajoute des stats de rendu (en fps par exemple)
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
//module ciel
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
//module eau
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';

let scene;
let camera;
let renderer;
let simplex;
let plane;
let geometry;
let xZoom;
let yZoom;
let noiseStrength;
let controls;
let container;
let guiParameters;
var parameters = {
	distance: 400,
	inclination: 0.49,
	azimuth: 0.205
};

function setup() {
  setupNoise();
  setupScene();
  setupCamera();
  setupPlane();
  setupLights();
  setupEventListeners();
  addGui();
}

function setupNoise() {
  // By zooming y more than x, we get the
  // appearence of flying along a valley
  xZoom = 6;
  yZoom = 18;
  noiseStrength = 1.5;
  simplex = new SimplexNoise();
}

function setupScene() {
    //on crée un container, celui déclaré dans le html #game-container
	container = document.getElementById( 'home-game-container' );
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
  	scene = new THREE.Scene();
}

function setupCamera() {
  let res = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, res, 0.1, 1000);
  camera.position.x = 0;
  camera.position.y = -20;
  camera.position.z = 10;
  controls = new OrbitControls( camera, renderer.domElement );
}

function setupPlane() {
  let side = 120;
  geometry = new THREE.PlaneGeometry(40, 40, side, side);
  let material = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: new THREE.Color(0x00c500),
  });
  plane = new THREE.Mesh(geometry, material);
  plane.castShadow = true;
  plane.receiveShadow = true;

  scene.add(plane);
}

function setupLights() {
  let ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);
  
  let spotLight = new THREE.SpotLight(0xcccccc);
  spotLight.position.set(-30, 60, 60);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function draw() {
  requestAnimationFrame(draw);
  let offset = Date.now() * 0.0004;
  adjustVertices(offset);
	//adjustCameraPos(offset);
  controls.update();
  renderer.render(scene, camera);
}

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
};

function adjustVertices(offset) {
  for (let i = 0; i < plane.geometry.vertices.length; i++) {
    let vertex = plane.geometry.vertices[i];
    let x = vertex.x / xZoom;
    let y = vertex.y / yZoom;
    let noise = simplex.noise2D(x, y + offset) * noiseStrength; 
    
    let vX = vertex.x;
    let ss = smoothstep(5, 10, vX);
    
    let shelf = -1.5;
    let shelfSS = smoothstep(-5, -10, vX);
    vertex.z = noise * ss + (shelf * shelfSS);
  }
  geometry.verticesNeedUpdate = true;
  geometry.computeVertexNormals();
}

function addGui() {
	var gui = new GUI();

	var folder = gui.addFolder( 'Sky' );
	folder.add( parameters, 'inclination', 0, 0.5, 0.0001 ).onChange( console.log('hello') );
	folder.add( parameters, 'azimuth', 0, 1, 0.0001 ).onChange( console.log('hello') );
	folder.open();
}


function adjustCameraPos(offset) {  
  let x = camera.position.x / xZoom;
  let y = camera.position.y / yZoom;
  let noise = simplex.noise2D(x, y + offset) * noiseStrength + 1.5; 
  camera.position.z = noise;
}


setup();
draw();