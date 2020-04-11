import * as Three from './node_modules/three/build/three.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from './node_modules/three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';

//variables intermédiaires three.js/vue.js
			
			var farness = 100;
			




			var container, camera, controls, scene, renderer, light, stats, transform, composer;

			var water, sphere;

			var sky, sunSphere;

			var loader = new GLTFLoader();

			var params = {
				exposure: 1,
				bloomStrength: 0,
				bloomThreshold: 0,
				bloomRadius: 0
			};

			init();
			animate();
			render();

			function initScene() {

				
				light = new THREE.DirectionalLight( 0xffffff, 0.8 );
				scene.add( light );


				// Load a glTF resource
				loader.load(
					// resource URL
					'yacht/scene.gltf',
					// called when the resource is loaded
					function ( gltf ) {

						scene.add( gltf.scene );

						gltf.animations; // Array<THREE.AnimationClip>
						gltf.scene; // THREE.Group
						gltf.scenes; // Array<THREE.Group>
						gltf.cameras; // Array<THREE.Camera>
						gltf.asset; // Object

							},
							// called while loading is progressing
							function ( xhr ) {

								console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

							},
							// called when loading has errors
							function ( error ) {

								console.log( 'An error happened' );

							}
				    );

				//function gltfPosition(gltfpos){
					//gltfpos.getWorldPosition () : gltfposPosition;
					//console.log(gltfposPosition);
				//};
				// Water

				var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

				water = new Water(
					waterGeometry,
					{
						textureWidth: 512,
						textureHeight: 512,
						waterNormals: new THREE.TextureLoader().load( './textures/waternormals.jpg', function ( texture ) {

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


				//permet de mettre l'eau à l'horizontale
				water.rotation.x = - Math.PI / 2;

				scene.add( water );

				// Add Sky
				sky = new Sky();
				sky.scale.setScalar( 450000 );
				scene.add( sky );

				// Add Sun Helper
				sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				sunSphere.position.y = - 700000;
				sunSphere.visible = false;
				scene.add( sunSphere );

				/// GUI

				var effectController = {
					turbidity: 10,
					rayleigh: 2,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.8,
					luminance: 1,
					inclination: 0.49, // elevation / inclination
					azimuth: 0.25, // Facing front,
					sun: ! true
				};

				var renderScene = new RenderPass( scene, camera );

				var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );

				var distance = 400000;

				function guiChanged() {

					var uniforms = sky.material.uniforms;
					uniforms[ "turbidity" ].value = effectController.turbidity;
					uniforms[ "rayleigh" ].value = effectController.rayleigh;
					uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
					uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;
					uniforms[ "luminance" ].value = effectController.luminance;

					var theta = Math.PI * ( effectController.inclination - 0.5 );
					var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

					sunSphere.position.x = distance * Math.cos( phi );
					sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
					sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

					sunSphere.visible = effectController.sun;

					uniforms[ "sunPosition" ].value.copy( sunSphere.position );

					renderer.render( scene, camera );

				}

				stats = new Stats();
				container.appendChild( stats.dom );

				var gui = new GUI();

				gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
				gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
				gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
				gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
				gui.add( effectController, "luminance", 0.0, 2 ).onChange( guiChanged );
				gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
				gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
				gui.add( effectController, "sun" ).onChange( guiChanged );
				

				gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

				renderer.toneMappingExposure = Math.pow( value, 4.0 );

				} );

			    gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

				bloomPass.threshold = Number( value );

			    } );

			    gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

				bloomPass.strength = Number( value );

			    } );

			    gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

				bloomPass.radius = Number( value );

			    } );


				guiChanged();


				var uniforms = water.material.uniforms;

				//pour ajouter un sous dossier de gui
				var folder = gui.addFolder( 'Water' );

				folder.add( uniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
				folder.add( uniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
				folder.add( uniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
				folder.open();

				
			}

			function init() {

				container = document.getElementById( 'container' );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				//

				scene = new THREE.Scene();

				//nouvelle camera
				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				//nouveaux controls orbitcontrols
				var controls = new OrbitControls( camera, renderer.domElement );
				//on positionne la camera, je laisse farness pour tester depuis les éléments vue
				camera.position.set( 30, 30, farness );
				controls.update();

				//le helper sert à insérer ici 2 lignes qui se croisent au 0
				//var helper = new THREE.GridHelper( 10000, 2, 0xffffff, 0xffffff );
				//scene.add( helper );

				//le helper sert à insérer une grille simple ici
				//scene.add( new THREE.GridHelper( 10000, 100 ) );


				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render );
				//controls.maxPolarAngle = Math.PI / 2;
				controls.enableZoom = false;
				controls.enablePan = false;

				initScene();

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			function animate() {


				requestAnimationFrame( animate );
				render();
				stats.update();
				//farness+=1;
				//camera.position.set( 30, 30, farness );
				// required if controls.enableDamping or controls.autoRotate are set to true
		
			}

			function render() {

				

				var time = performance.now() * 0.001;

				camera.position.set( 30, 30, farness );

				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;


				composer.render( scene, camera );


			}



//

//fonctions batardes
/*function farness_imp() {
	setTimeout(function(){ farness+10 }, 1);
	return farness;
	console.log(farness);
}*/

new Vue({
	el:'#vue-app',
	data:{
	},
	methods:{
		goforward: function(){

		}
	}
})


