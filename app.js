let scene;
let camera;
let renderer;
let simplex;
let plane;
let geometry;
let torsoMesh;
let xZoom;
let yZoom;
let noiseStrength;

function setup() {
  setupNoise();
  setupScene();
  setupCamera();
  setupRenderer();
  setupPlane();
  setupSub();
  setupLights();
  setupEventListeners();
}

function setupNoise() {
  // By zooming y more than x, we get the
  // appearence of flying along a valley
  xZoom = 18;
  yZoom = 15;
  noiseStrength = 1.5;
  simplex = new THREE.SimplexNoise();
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x143B5E );
}

function setupCamera() {
  let res = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, res, 0.1, 1000);
  camera.position.x = 0;
  camera.position.y = 30;
  camera.up.set( 0, 0, 1 );
  camera.position.z = 0.5;
  
  let controls = new THREE.OrbitControls(camera);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ 
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function setupPlane() {
  let side = 240;
  geometry = new THREE.PlaneGeometry(side, side, side, side);

  let texture = new THREE.TextureLoader().load( "sand1.jpg" );
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // material = new THREE.MeshBasicMaterial( { map: texture } );
  let material = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: new THREE.Color(0xE6D15C),
  });
  plane = new THREE.Mesh(geometry, material);
  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.position.z = -10;

  scene.add(plane);
}

function setupSub(){
	var torsoGeo = new THREE.SphereGeometry( 7.5, 8, 6 );
	torsoGeo.applyMatrix( new THREE.Matrix4().makeScale( 2.0, 1.2, 1.5 ) );
	var torsoMaterial = new THREE.MeshPhongMaterial( { color: 536266, flatShading: true } );
	torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);
	torsoMesh.rotation.y = Math.PI / 2;
	torsoMesh.rotation.x = Math.PI / 2;
	torsoMesh.position.z = 10;
	// torsoMesh.position.x = 0;

	var segmentHeight = 3;
	var segmentCount = 4;
	var height = segmentHeight * segmentCount;
	var halfHeight = height * 0.5;

	var sizing = {
		segmentHeight: segmentHeight,
		segmentCount: segmentCount,
		height: height,
		halfHeight: halfHeight
	};

	//arm one
	var geo1 = createGeometry( sizing );
	var bones1 = createBones( sizing );
	var mesh1 = createMesh( geo1, bones1 );
	mesh1.scale.multiplyScalar( 1 );
	mesh1.position.z = torsoMesh.position.z + 5;
	mesh1.rotation.x = Math.PI / 2;

	torsoMesh.add( mesh1 );

	//arm two
	var geo2 = createGeometry( sizing );
	var bones2 = createBones( sizing );
	var mesh2 = createMesh( geo2, bones2 );
	mesh2.scale.multiplyScalar( 1 );
	mesh2.position.z = torsoMesh.position.z - 25;
	mesh2.rotation.x = Math.PI / 2;

	torsoMesh.add(mesh2);

	var skeletonHelper = new THREE.SkeletonHelper( mesh1 );
	skeletonHelper.material.linewidth = 2;
	scene.add( skeletonHelper );

	torsoMesh.position.z = 5;

	//PALMS
	var cGeo = new THREE.CircleGeometry( 2.5, 32 );
	var cMat= new THREE.MeshPhongMaterial({
		color: 0x536266,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	});
	var circle1 = new THREE.Mesh( cGeo, cMat);
	circle1.rotation.x = Math.PI / 2;
	circle1.position.y = mesh1.position.y + 6;
	mesh1.add( circle1 );

	//FINGERS
	for (var i = 0; i < 5; i++){
		var geometry = new THREE.ConeBufferGeometry( .5, 7, 12 );
		var material = new THREE.MeshBasicMaterial( {color: 0x536266} );
		var cone = new THREE.Mesh( geometry, material );
		cone.rotation.x = i;
		circle1.add( cone );
	}

	var cGeo2 = new THREE.CircleGeometry( 2.5, 32 );
	var cMat2= new THREE.MeshPhongMaterial({
		color: 0x536266,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	});
	var circle2 = new THREE.Mesh( cGeo2, cMat2);
	circle2.rotation.x = Math.PI / 2;
	circle2.position.y = mesh2.position.y - 6;
	mesh2.add( circle2 );

	//FINGERS
	for (var i = 0; i < 5; i++){
		var geometry = new THREE.ConeBufferGeometry( .5, 7, 12 );
		var material = new THREE.MeshBasicMaterial( {color: 0x536266} );
		var cone = new THREE.Mesh( geometry, material );
		cone.rotation.x = i;
		circle2.add( cone );
	}



	scene.add(torsoMesh);
}

function createGeometry( sizing ) {
	var armGeo = new THREE.CylinderBufferGeometry(
		1, // radiusTop
		1, // radiusBottom
		sizing.height, // height
		9, // radiusSegments
		sizing.segmentCount * 3, // heightSegments
		true // openEnded
	);

	var position = armGeo.attributes.position;

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

	armGeo.skinIndex = new THREE.Uint16BufferAttribute( skinIndices, 4 );
	armGeo.skinWeight = new THREE.Float32BufferAttribute( skinWeights, 4 );

	return armGeo;
}

function createBones( sizing ){
	//ARMS//
	let bones = [];

	var prevBone = new THREE.Bone();
	// prevBone.rotation.z = -2;
	// prevBone.position.x = torsoMesh.position.x + 20;
	bones.push( prevBone );
	prevBone.position.y = - sizing.halfHeight;

	for ( var i = 0; i < sizing.segmentCount; i ++ ) {

		var bone = new THREE.Bone();
		bone.position.y = sizing.segmentHeight;
		// if (i == sizing.segmentCount - 2){
		// 	bone.rotation.z = - Math.PI;
		// 	bone.position.x += 7;
		// }
		bones.push( bone );
		prevBone.add( bone );
		prevBone = bone;

	}

	return bones;
}

function createMesh( geometry, bones ){
	var material = new THREE.MeshPhongMaterial({
		skinning: true,
		color: 0x536266,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	});

	var mesh = new THREE.SkinnedMesh( geometry,	material );
	var skeleton = new THREE.Skeleton( bones );

	mesh.add( bones[ 0 ] );

	mesh.bind( skeleton );

	// mesh.skeleton.bones[0].rotation.z = - Math.PI;
	// mesh.skeleton.bones[1].position.x += 7

	return mesh;
}

function setupLights() {
  let ambientLight = new THREE.AmbientLight(0x1F2A2E);
  scene.add(ambientLight);
  
  let spotLight = new THREE.SpotLight(0xABC8D8);
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
  adjustCameraPos(offset);
  renderer.render(scene, camera);
}

function adjustVertices(offset) {
  for (let i = 0; i < plane.geometry.vertices.length; i++) {
    let vertex = plane.geometry.vertices[i];
    let x = vertex.x / xZoom;
    let y = vertex.y / yZoom;
    let noise = simplex.noise(x, y + offset) * noiseStrength; 
    vertex.z = noise;
  }
  geometry.verticesNeedUpdate = true;
  geometry.computeVertexNormals();
}

function adjustCameraPos(offset) {  
  let x = camera.position.x / xZoom;
  let y = camera.position.y / yZoom;
  let noise = simplex.noise(x, y + offset) * noiseStrength + 1.5; 
  camera.position.z = noise;
}

setup();
draw();