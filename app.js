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



			var container, stats;
			var camera, scene, renderer, light;
			var controls, water, sphere;

			init();
			animate();

			function init() {

				container = document.getElementById( 'home-game-container' );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				//

				scene = new THREE.Scene();

				//

				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				camera.position.set( 30, 30, 100 );

				//

				light = new THREE.DirectionalLight( 0xffffff, 0.8 );
				scene.add( light );

				// Water

				var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

				water = new Water(
					waterGeometry,
					{
						textureWidth: 512,
						textureHeight: 512,
						waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

						} ),
						alpha: 1.0,
						sunDirection: light.position.clone().normalize(),
						sunColor: 0xffffff,
						waterColor: 0x001e0f,
						distortionScale: 3.7,
						fog: scene.fog !== undefined
					}
				);

				water.rotation.x = - Math.PI / 2;

				scene.add( water );

				// Skybox

				var sky = new Sky();

				var uniforms = sky.material.uniforms;

				uniforms[ 'turbidity' ].value = 10;
				uniforms[ 'rayleigh' ].value = 2;
				uniforms[ 'luminance' ].value = 1;
				uniforms[ 'mieCoefficient' ].value = 0.005;
				uniforms[ 'mieDirectionalG' ].value = 0.8;

				var parameters = {
					distance: 400,
					inclination: 0.49,
					azimuth: 0.205
				};

				var cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
				cubeCamera.renderTarget.texture.generateMipmaps = true;
				cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;

				scene.background = cubeCamera.renderTarget;

				function updateSun() {

					var theta = Math.PI * ( parameters.inclination - 0.5 );
					var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

					light.position.x = parameters.distance * Math.cos( phi );
					light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
					light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );

					sky.material.uniforms[ 'sunPosition' ].value = light.position.copy( light.position );
					water.material.uniforms[ 'sunDirection' ].value.copy( light.position ).normalize();

					cubeCamera.update( renderer, sky );

				}

				updateSun();

				//

				var geometry = new THREE.IcosahedronBufferGeometry( 20, 1 );
				var count = geometry.attributes.position.count;

				var colors = [];
				var color = new THREE.Color();

				for ( var i = 0; i < count; i += 3 ) {

					color.setHex( Math.random() * 0xffffff );

					colors.push( color.r, color.g, color.b );
					colors.push( color.r, color.g, color.b );
					colors.push( color.r, color.g, color.b );

				}

				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

				var material = new THREE.MeshStandardMaterial( {
					vertexColors: true,
					roughness: 0.0,
					flatShading: true,
					envMap: cubeCamera.renderTarget.texture,
					side: THREE.DoubleSide
				} );

				sphere = new THREE.Mesh( geometry, material );
				scene.add( sphere );

				//

				controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.495;
				controls.target.set( 0, 10, 0 );
				controls.minDistance = 40.0;
				controls.maxDistance = 200.0;
				controls.update();

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				// GUI

				var gui = new GUI();

				var folder = gui.addFolder( 'Sky' );
				folder.add( parameters, 'inclination', 0, 0.5, 0.0001 ).onChange( updateSun );
				folder.add( parameters, 'azimuth', 0, 1, 0.0001 ).onChange( updateSun );
				folder.open();

				var uniforms = water.material.uniforms;

				var folder = gui.addFolder( 'Water' );
				folder.add( uniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
				folder.add( uniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
				folder.add( uniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
				folder.open();

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );
				render();
				stats.update();

			}

			function render() {

				var time = performance.now() * 0.001;

				sphere.position.y = Math.sin( time ) * 20 + 5;
				sphere.rotation.x = time * 0.5;
				sphere.rotation.z = time * 0.51;

				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

				renderer.render( scene, camera );

			}