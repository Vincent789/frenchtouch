import * as Three from './node_modules/three/build/three.js';
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';


var farness = 0;

var scene = new THREE.Scene();



			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

			var renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );

			var geometry = new THREE.BoxGeometry();
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			scene.add( cube );


			var geometry = new THREE.BoxGeometry();
			var material = new THREE.MeshBasicMaterial( { color: 0xb234e0 } );
			var cube2 = new THREE.Mesh( geometry, material );
			scene.add( cube2 );
			cube2.position.set(5, 0, 0);

			const sun = new THREE.DirectionalLight(0xffffcc)
			sun.position.set(0, 1, 0)
			scene.add(sun)

			let geo = new THREE.BoxBufferGeometry(10, 10, 10)
			let mat = new THREE.MeshLambertMaterial({
			    color: "red"
			})
			let mesh = new THREE.Mesh(geo, mat)
			scene.add(mesh)

			//Ajout d'une forêt

			//tree geometry (two intersecting y-perpendicular triangles)
			var triangle = new THREE.Shape();
			triangle.moveTo(5, 0);
			triangle.lineTo(0, 12);
			triangle.lineTo(-5, 0);
			triangle.lineTo(5, 0);
			var tree_geometry1 = new THREE.ShapeGeometry(triangle);

			var matrix = new THREE.Matrix4();
			var tree_geometry2 = new THREE.ShapeGeometry(triangle);
			tree_geometry2.applyMatrix(matrix.makeRotationY(Math.PI / 2));


			//tree material
			var basic_material = new THREE.MeshBasicMaterial({color: 0x14190f});
			basic_material.color = new THREE.Color(0x14190f);
			basic_material.side = THREE.DoubleSide;


			//merge into giant geometry for max efficiency
			var forest_geometry = new THREE.Geometry();
			var dummy = new THREE.Mesh();
			for (var i = 0; i < 1000; i++) 
			{
		    dummy.position.x = Math.random() * 1000 - 500;
		    dummy.position.z = Math.random() * 1000 - 500;
		    dummy.position.y = 0;

		    dummy.geometry = tree_geometry1;
		    THREE.GeometryUtils.merge(forest_geometry, dummy);

		    dummy.geometry = tree_geometry2;
		    THREE.GeometryUtils.merge(forest_geometry, dummy);
			}


			//create mesh and add to scene
			var forest_mesh = new THREE.Mesh(forest_geometry, basic_material);
			scene.add(forest_mesh);

			//texture infinie au sol

			let tex = new THREE.TextureLoader().load("https://upload.wikimedia.org/wikipedia/commons/4/4c/Grass_Texture.png")
			tex.anisotropy = 32
			tex.repeat.set(100, 100)
			tex.wrapT = THREE.RepeatWrapping
			tex.wrapS = THREE.RepeatWrapping
			geo = new THREE.PlaneBufferGeometry(10000, 10000)
			mat = new THREE.MeshLambertMaterial({
			  map: tex
			})
			mesh = new THREE.Mesh(geo, mat)
			mesh.position.set(0, -5, 0)
			mesh.rotation.set(Math.PI / -2, 0, 0)
			scene.add(mesh)
			
			camera.position.z += farness;

			var animate = function () {
				requestAnimationFrame( animate );

				cube.rotation.x += 0.01;
				cube.rotation.y += 0.01;
				camera.position.z += farness;

				renderer.render( scene, camera );
			};

			animate();




new Vue({
	el:'#vue-app',
	data:{
	},
	methods:{
		goforward: function(){
			farness -= 0.1;
			console.log(farness);
		}
	}
})


