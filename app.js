import FirstPersonControls from './js/FirstPersonControls.js';

var container;
var camera, controls, scene, renderer;
var bgMesh, texture;
var worldWidth = 256, worldDepth = 256,
	worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var clock = new THREE.Clock();

var data = generateHeight( worldWidth, worldDepth );

//VIEWS
var views = [
	{
		left: 0,
		bottom: 0,
		width: 0.5,
		height: 1.0,
		background: new THREE.Color( 0.5, 0.5, 0.7 ),
		eye: [ 0, 300, 1800 ],
		up: [ 0, 1, 0 ],
		fov: 30,
		updateCamera: function ( camera, scene, mouseX ) {
		  // camera.position.x += mouseX * 0.05;
		  // camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
		  camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;
		  camera.lookAt( scene.position );
		}
	},
	{
		left: 0.5,
		bottom: 0,
		width: 0.5,
		height: 0.5,
		background: new THREE.Color( 0.7, 0.5, 0.5 ),
		eye: [ 0, 1800, 0 ],
		up: [ 0, 0, 1 ],
		fov: 45,
		updateCamera: function ( camera, scene, mouseX ) {
		  camera.position.x -= mouseX * 0.05;
		  camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
		  camera.lookAt( camera.position.clone().setY( 0 ) );
		}
	},
	{
		left: 0.5,
		bottom: 0.5,
		width: 0.5,
		height: 0.5,
		background: new THREE.Color( 0.5, 0.7, 0.7 ),
		eye: [ 1400, 800, 1400 ],
		up: [ 0, 1, 0 ],
		fov: 60,
		updateCamera: function ( camera, scene, mouseX ) {
		  camera.position.y -= mouseX * 0.05;
		  camera.position.y = Math.max( Math.min( camera.position.y, 1600 ), - 1600 );
		  camera.lookAt( scene.position );
		}
	}
];

init();
animate();

function init() {

	//SCENE//
	container = document.getElementById( 'container' );
	for ( var ii = 0; ii < views.length; ++ ii ) {
		var view = views[ ii ];
		var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.fromArray( view.eye );
		camera.up.fromArray( view.up );
		view.camera = camera;
	}

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x5695BC );
	scene.fog = new THREE.FogExp2( 0x4E5C5E, 0.00025 );
	// camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;


	////OBJECTS////

		//BACKGROUND//
	var planeGeo = new THREE.PlaneBufferGeometry(7500, 7500, worldWidth - 1, worldDepth - 1 );

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
	bgMesh = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: texture } ) );
	scene.add( bgMesh );
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );



		//CORAL//
	// var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
	// var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
	// for ( var i = 0; i < 500; i ++ ) {
	// 	var cMesh = new THREE.Mesh( geometry, material );
	// 	cMesh.position.x = Math.random() * 1600 - 800;
	// 	cMesh.position.y = 0;
	// 	cMesh.position.z = Math.random() * 16000 - 800;
	// 	cMesh.updateMatrix();
	// 	cMesh.matrixAutoUpdate = false;
	// 	bgMesh.add(cMesh);
	// }



	
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

//ADD FUNCTIONALITY OF ROBOT//



function updateSize() {
	if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize( windowWidth, windowHeight );
	}
}


function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	controls.update(clock.getDelta());
	updateSize();
	for ( var ii = 0; ii < views.length; ++ ii ) {
		var view = views[ ii ];
		var camera = view.camera;
		view.updateCamera( camera, scene, mouseX, mouseY );
		var left = Math.floor( windowWidth * view.left );
		var bottom = Math.floor( windowHeight * view.bottom );
		var width = Math.floor( windowWidth * view.width );
		var height = Math.floor( windowHeight * view.height );
		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.setScissorTest( true );
		renderer.setClearColor( view.background );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.render( scene, camera );
	}
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


// ////ANIMATE////
// function animate() {
// 	requestAnimationFrame( animate );
// 	controls.update();
// 	renderer.render( scene, camera );
// }