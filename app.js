import * as THREE from 'node_modules/three/build/three.module.js';
import { FirstPersonControls } from 'node_modules/three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'node_modules/three/examples/jsm/math/ImprovedNoise.js';

////SETUP////
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x3699C8 );
scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

var worldWidth = 256, worldDepth = 256, worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

////CONTROLS////

var controls = new FirstPersonControls( camera, renderer.domElement );
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

camera.position.set(400, 200, 0);
controls.update();

////OBJECTS////

// //plane
// var geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var plane = new THREE.Mesh( geometry, material );
// plane.rotation.x = Math.PI / 2;
// scene.add( plane );


//add these on top of plane
var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
for ( var i = 0; i < 500; i ++ ) {
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = Math.random() * 1600 - 800;
	mesh.position.y = 0;
	mesh.position.z = Math.random() * 16000 - 800;
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	scene.add( mesh );
}
//submarine: body, head(camera), arms, legs

////LIGHTS////
var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1, 1, 1 );
scene.add( light );
var light = new THREE.DirectionalLight( 0x002288 );
light.position.set(-1, -1, -1);
scene.add( light );
var light = new THREE.AmbientLight( 0x222222 );
scene.add( light );


////ANIMATE////
function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}
animate();