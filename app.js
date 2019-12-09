import FirstPersonControls from './js/FirstPersonControls.js';

var container;
var cameraL, cameraR, controlsL, controlsR, renderer;
var sceneL, sceneR;
var bgMesh, texture;
var worldWidth = 256, worldDepth = 256,
	worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var clock = new THREE.Clock();
var sliderPos = window.innerWidth / 2;
var sliderMoved = false;

var state = { animateBones: false };

init();
animate();

function init() {

	//SCENE//
	container = document.getElementById( 'container' );

	cameraL = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	var data = generateHeight( worldWidth, worldDepth );
	cameraL.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;

	cameraR = new THREE.OrthographicCamera( 75, window.innerWidth / window.innerHeight, 0.1, 200 );
	cameraR.position.z = 30;
	cameraR.position.y = 30;

	scene1(data);
	scene2();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( container.clientWidth, container.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setScissorTest( true );
	container.appendChild( renderer.domElement );
	renderer.setAnimationLoop( function () {
		render();
	} );
	initComparisons();
	
	//CONTROLS
	controlsL = new FirstPersonControls( cameraL, renderer.domElement );
	controlsL.movementSpeed = 1000;
	controlsL.lookSpeed = 0.1;

	controlsR = new THREE.OrbitControls( cameraR, renderer.domElement );
	// controlsR.enableZoom = false;
	//
	window.addEventListener( 'resize', onWindowResize, false );
}

function scene1(data){
	sceneL = new THREE.Scene();
	sceneL.background = new THREE.Color( 0x143B5E );
	sceneL.fog = new THREE.FogExp2( 0x4E5C5E, 0.00025 );

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
	
		//CORAL//
	var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
	var material = new THREE.MeshPhongMaterial( { color: 0xFCAEB3, flatShading: true } );
	for ( var i = 0; i < 500; i ++ ) {
		var cMesh = new THREE.Mesh( geometry, material );
		cMesh.position.x = Math.random() * 1600 - 800;
		cMesh.position.y = 20;
		cMesh.position.z = Math.random() * 16000 - 800;
		cMesh.updateMatrix();
		cMesh.matrixAutoUpdate = false;
		bgMesh.add(cMesh);
	}

	sceneL.add( bgMesh );

	////LIGHTS////
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	sceneL.add( light );
	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set(-1, -1, -1);
	sceneL.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	sceneL.add( light );
}

function scene2(){
	sceneR = new THREE.Scene();
	sceneR.background = new THREE.Color( 0x5695BC );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	sceneR.add( light );
	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set(-1, -1, -1);
	sceneR.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	sceneR.add( light );

	// var geometry = new THREE.BoxGeometry(45,48,26);
	// var material = new THREE.MeshPhongMaterial( { color: 0x222222, flatShading: true } );
	// var mesh = new THREE.Mesh(geometry, material);

	// sceneR.add(mesh);
	
	//SUBMARINE//
	var torsoGeo = new THREE.SphereGeometry( 15, 16, 12 );
	torsoGeo.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.2, 1.5 ) );
	var torsoMaterial = new THREE.MeshPhongMaterial( { color: 0x222222, flatShading: true } );
	var torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);

	var segmentHeight = 8;
	var segmentCount = 4;
	var height = segmentHeight * segmentCount;
	var halfHeight = height * 0.5;

	var sizing = {
		segmentHeight: segmentHeight,
		segmentCount: segmentCount,
		height: height,
		halfHeight: halfHeight
	};

	var geometry = createGeometry( sizing );
	var bones = createBones( sizing );
	var mesh = createMesh( geometry, bones );
	mesh.scale.multiplyScalar( 1 );

	torsoMesh.add( mesh );

	var skeletonHelper = new THREE.SkeletonHelper( mesh );
	skeletonHelper.material.linewidth = 2;
	sceneR.add( skeletonHelper );

	sceneR.add(torsoMesh);
}

function createGeometry( sizing ) {
	var geometry = new THREE.CylinderBufferGeometry(
		5, // radiusTop
		5, // radiusBottom
		sizing.height, // height
		8, // radiusSegments
		sizing.segmentCount * 3, // heightSegments
		true // openEnded
	);

	var position = geometry.attributes.position;

	var vertex = new THREE.Vector3();

	var skinIndices = [];
	var skinWeights = [];

	for ( var i = 0; i < position.count; i ++ ) {

		vertex.fromBufferAttribute( position, i );

		var y = ( vertex.y + sizing.halfHeight );

		var skinIndex = Math.floor( y / sizing.segmentHeight );
		var skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

		skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
		skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

	}

	geometry.skinIndex = new THREE.Uint16BufferAttribute( skinIndices, 4 );
	geometry.skinWeight = new THREE.Float32BufferAttribute( skinWeights, 4 );

	return geometry;
}

function createBones( sizing ){
	//ARMS//
	let bones = [];

	var prevBone = new THREE.Bone();
	bones.push( prevBone );
	prevBone.position.y = - sizing.halfHeight;

	for ( var i = 0; i < sizing.segmentCount; i ++ ) {

		var bone = new THREE.Bone();
		bone.position.y = sizing.segmentHeight;
		bones.push( bone );
		prevBone.add( bone );
		prevBone = bone;

	}

	return bones;
}

function createMesh( geometry, bones ){
	var material = new THREE.MeshPhongMaterial( {
		skinning: true,
		color: 0xE8F5FB,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	} );

	var mesh = new THREE.SkinnedMesh( geometry,	material );
	var skeleton = new THREE.Skeleton( bones );

	mesh.add( bones[ 0 ] );

	mesh.bind( skeleton );

	return mesh;
}

function onWindowResize() {
	cameraL.aspect = window.innerWidth / window.innerHeight;
	cameraL.updateProjectionMatrix();
	cameraR.aspect = window.innerWidth / window.innerHeight;
	cameraR.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controlsL.handleResize();
	controlsR.handleResize();

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


function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	controlsL.update(clock.getDelta());
	// controlsR.update();
	renderer.setScissor( 0, 0, sliderPos, window.innerHeight );
	renderer.render( sceneL, cameraL );
	renderer.setScissor( sliderPos, 0, window.innerWidth, window.innerHeight );
	renderer.render( sceneR, cameraR );
}

function initComparisons() {
	var slider = document.querySelector( '.slider' );
	var clicked = false;
	function slideReady() {
		clicked = true;
		controls.enabled = false;
	}
	function slideFinish() {
		clicked = false;
		controls.enabled = true;
	}
	function slideMove( e ) {
		if ( ! clicked ) return false;
		sliderMoved = true;
		sliderPos = e.pageX || e.touches[ 0 ].pageX;
		//prevent the slider from being positioned outside the window bounds
		if ( sliderPos < 0 ) sliderPos = 0;
		if ( sliderPos > window.innerWidth ) sliderPos = window.innerWidth;
		slider.style.left = sliderPos - ( slider.offsetWidth / 2 ) + "px";
	}
	slider.addEventListener( 'mousedown', slideReady );
	slider.addEventListener( 'touchstart', slideReady );
	window.addEventListener( 'mouseup', slideFinish );
	window.addEventListener( 'touchend', slideFinish );
	window.addEventListener( 'mousemove', slideMove );
	window.addEventListener( 'touchmove', slideMove );
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