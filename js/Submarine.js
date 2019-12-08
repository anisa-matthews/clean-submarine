export default function Submarine(){
		//TORSO
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
	mesh = createMesh( geometry, bones );
	mesh.scale.multiplyScalar( 1 );

	torsoMesh.add( mesh );
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

		var bone = new Bone();
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
		color: 0x156289,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		flatShading: true
	} );

	var mesh = new THREE.SkinnedMesh( geometry,	material );
	var skeleton = new THREE.Skeleton( bones );

	mesh.add( bones[ 0 ] );

	mesh.bind( skeleton );

	skeletonHelper = new THREE.SkeletonHelper( mesh );
	skeletonHelper.material.linewidth = 2;
	scene.add( skeletonHelper );

	return mesh;
}