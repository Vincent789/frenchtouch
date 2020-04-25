// Créer le container HTML

		//<div id="game-container"> </div>

		//on crée un container, celui déclaré dans le html #game-container

				container = document.getElementById( 'game-container' );

		//

// Importer three et ses dépendances // ES6

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


// Déclarer une nouvelle scène dans three

		// https://threejs.org/docs/#manual/en/introduction/Creating-a-scene


// Caméras
				
				//nouvelle camera
				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				//on positionne la camera, 
				camera.position.set( 30, 30, 30 );

//helpers

				//le helper sert à insérer ici 2 lignes qui se croisent au 0
				var helper = new THREE.GridHelper( 10000, 2, 0xffffff, 0xffffff );
				scene.add( helper );

				//le helper sert à insérer une grille simple ici
				scene.add( new THREE.GridHelper( 10000, 100 ) );

				// Ajouter de l'eau sur une surface plane
				//déclarer une surface plane de 10000 par 10000 (10000 quoi ? pixels j'imagine)
				var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
				// Les surfaces planes sont toujours insérées verticalement
				// Cela explique un peu la suite
				// Elles ne sont pas insérées comme un sol mais comme un mur																
				water = new Water(
					waterGeometry, //on utilise la surface déclarée
					{
						textureWidth: 512, //on déclare une texture de 512*512
						textureHeight: 512, //de même puisque c'est un mur, j'imagine qu'on déclare une height et pas une propfondeur
						waterNormals: new THREE.TextureLoader().load( './textures/waternormals.jpg', function ( texture ) {
							//on déclare une nouvelle textue
							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
							//on met le reppeat wrapping pour qu'elle prenne tout le solide
							//pour le reste, voir cette documentation sur wrapS et wrapT
							//https://threejs.org/docs/#api/en/textures/Texture
						} ),
						alpha: 1.0,//J'ai encore un doute sur le point suivant : est-ce que ça dit qu'il ya un alpha ou est-ce que c'est la valeur de l'alpha-opacité
						sunDirection: light.position.clone().normalize(),//très important à mon avis mais je n'ai pas bien poussé le truc, je ne sais pas comment/quel soleil ça récupère
						sunColor: 0xffffff,
						waterColor: 0x001e0f,
						distortionScale: 3.7,
						fog: scene.fog !== undefined //le fog est une notion importante en 3d dans le cadre d'un affichage qui fait "bouger", ça permet de cacher l'horizon. Ici, visiblement, il n'y en a pas.
					}
				);

				//permet de mettre l'eau à l'horizontale
				water.rotation.x = - Math.PI / 2;




//Application de test, début :



//On note qu'elle fait appel aux fonctions suivantes successivement, c'est un modèle qui peut changer
			
			//les bases de la scène, insertion des objets
			function initScene() {
			}
			//tout ce qui concerne l'évolution des interfaces utilisateur
			function guiChanged() {
	
			}
			//
			function init() {

			}
			//fonction qui permet le responsive sans bug
			function onWindowResize() {

			}
			//fonction qui anime la scène
			function animate() {
		
			}
			//fonction qui fait le rendu
			function render() {

			}
//****************************
			//on déclare les variables dont on aura besoin
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

			//on utilise nos fonctions

			init();
			animate();
			render();

			function initScene() {

				//création d'une lumière
				light = new THREE.DirectionalLight( 0xffffff, 0.8 );
				scene.add( light );


				// Load a glTF resource
				loader.load(
					// resource URL
					'yacht/scene.glb', //scène GLB, donc fournie avec la texture
					// called when the resource is loaded
					function ( gltf ) {

						scene.add( gltf.scene );
						gltf.animations; // Array<THREE.AnimationClip>
						gltf.scene; // THREE.Group
						gltf.scenes; // Array<THREE.Group>
						gltf.cameras; // Array<THREE.Camera>
						gltf.asset; // Object

						var model;
						model = gltf.scene;
						model.position.y = 12; //on récupère et modifie la position verticale du modèle
					},
				//éléments de débuggage
					// called while loading is progressing
					function ( xhr ) {

							console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

					},
					
					// called when loading has errors
					function ( error ) {

							console.log( 'An error happened' );

					}
				);

				//eau décrite ci dessus
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

				//on ajoute l'effet de rendu bloom qui est un halo de lumière

				var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );


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

				//on crée un container, celui déclaré dans le html #game-container

				container = document.getElementById( 'game-container' );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				//élément indispensable, on crée une scènhe

				scene = new THREE.Scene();

				//nouvelle camera
				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				//nouveaux controls orbitcontrols
				var controls = new OrbitControls( camera, renderer.domElement );
				//on positionne la camera, je laisse farness pour tester depuis les éléments vue
				camera.position.set( 30, 30, 30 );
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

				// required if controls.enableDamping or controls.autoRotate are set to true
		
			}

			function render() {

				

				var time = performance.now() * 0.001;


				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;


				composer.render( scene, camera );
				//normalement, on devrait utiliser renderer.render()
				//comme j'ai rajouté effect composer pour rajouter l'effet bloom de rendu, on utilise composer.render()

			}

