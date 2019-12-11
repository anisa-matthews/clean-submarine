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
  geometry = new THREE.PlaneGeometry(80, 80, side, side);

  let texture = new THREE.TextureLoader().load( "sand1.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  material = new THREE.MeshBasicMaterial( { map: texture } );
  // let material = new THREE.MeshStandardMaterial({
  //   roughness: 0.8,
  //   color: new THREE.Color(0xE6D15C),
  // });
  plane = new THREE.Mesh(geometry, material);
  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.position.z = -10;

  scene.add(plane);
}

function setupSub(){
	var torsoGeo = new THREE.SphereGeometry( 7.5, 8, 6 );
	torsoGeo.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.2, 1.5 ) );
	var torsoMaterial = new THREE.MeshPhongMaterial( { color: 536266, flatShading: true } );
	torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);
	torsoMesh.rotation.y = Math.PI / 2;
	torsoMesh.rotation.x = Math.PI / 2;
	torsoMesh.position.z = 10;
	// torsoMesh.position.x = 0;

	var segmentHeight = 4;
	var segmentCount = 2;
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
	scene.add( skeletonHelper );

	torsoMesh.position.z = 5;

	scene.add(torsoMesh);
}

function createGeometry( sizing ) {
	var armGeo = new THREE.CylinderBufferGeometry(
		5, // radiusTop
		5, // radiusBottom
		sizing.height, // height
		8, // radiusSegments
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
	prevBone.position.x = torsoMesh.position.x + 20;
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
	var material = new THREE.MeshPhongMaterial({
		skinning: true,
		color: 0xE8F5FB,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	});

	var mesh = new THREE.SkinnedMesh( geometry,	material );
	mesh.rotation.x = Math.PI / 2;
	var skeleton = new THREE.Skeleton( bones );

	mesh.add( bones[ 0 ] );

	mesh.bind( skeleton );

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