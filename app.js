import FirstPersonControls from './js/FirstPersonControls.js';

var container;
var camera, controls, scene, renderer;
var mesh, texture;
var worldWidth = 256, worldDepth = 256,
	worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

init();
animate();

function init() {

	//SCENE//
	container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbfd1e5 );
	var data = generateHeight( worldWidth, worldDepth );
	camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;


	////OBJECTS////

		//BACKGROUND//
	var planeGeo = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	planeGeo.rotateX( - Math.PI / 2 );
	var vertices = planeGeo.attributes.position.array;
	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
		vertices[ j + 1 ] = data[ i ] * 10;
	}
	// texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
	// texture.wrapS = THREE.ClampToEdgeWrapping;
	// texture.wrapT = THREE.ClampToEdgeWrapping;
	texture = new THREE.TextureLoader().load( "sand1.jpg" );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	mesh = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: texture } ) );
	scene.add( mesh );
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );





	
	//CONTROLS
	controls = new FirstPersonControls( camera, renderer.domElement );
	controls.movementSpeed = 1000;
	controls.lookSpeed = 0.1;
	//
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
}

function generateHeight( width, height ) {
	var size = width * height, data = new Uint8Array( size ),
		perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
	for ( var j = 0; j < 4; j ++ ) {
		for ( var i = 0; i < size; i ++ ) {
			var x = i % width, y = ~ ~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
		}
		quality *= 5;
	}
	return data;
}

function generateTexture( data, width, height ) {
	var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;
	vector3 = new THREE.Vector3( 0, 0, 0 );
	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();
	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;
	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );
	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;
	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();
		shade = vector3.dot( sun );
		imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
	}
	context.putImageData( image, 0, 0 );
	// Scaled 4x
	canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;
	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );
	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;
	for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
		var v = ~ ~ ( Math.random() * 5 );
		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;
	}
	context.putImageData( image, 0, 0 );
	return canvasScaled;
}


function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	renderer.render( scene, camera );
}

















////OBJECTS////

// //plane
// var geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var plane = new THREE.Mesh( geometry, material );
// plane.rotation.x = Math.PI / 2;
// scene.add( plane );


// //add these on top of plane
// var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
// var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
// for ( var i = 0; i < 500; i ++ ) {
// 	var mesh = new THREE.Mesh( geometry, material );
// 	mesh.position.x = Math.random() * 1600 - 800;
// 	mesh.position.y = 0;
// 	mesh.position.z = Math.random() * 16000 - 800;
// 	mesh.updateMatrix();
// 	mesh.matrixAutoUpdate = false;
// 	scene.add( mesh );
// }
// //submarine: body, head(camera), arms, legs

// ////LIGHTS////
// var light = new THREE.DirectionalLight( 0xffffff );
// light.position.set( 1, 1, 1 );
// scene.add( light );
// var light = new THREE.DirectionalLight( 0x002288 );
// light.position.set(-1, -1, -1);
// scene.add( light );
// var light = new THREE.AmbientLight( 0x222222 );
// scene.add( light );


// ////ANIMATE////
// function animate() {
// 	requestAnimationFrame( animate );
// 	controls.update();
// 	renderer.render( scene, camera );
// }