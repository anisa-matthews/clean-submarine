export default function Submarine(){
		//TORSO
	var torsoGeo = new THREE.SphereGeometry( 15, 16, 12 );
	torsoGeo.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.2, 1.5 ) );
	var torsoMaterial = new THREE.MeshPhongMaterial( { color: 0x222222, flatShading: true } );
	var torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);

	var sizing = {
		segmentHeight: 8,
		segmentCount: 4,
		height: segmentHeight * segmentCount,
		halfHeight: height * 0.5
	};

	var geometry = createGeometry( sizing );
	var bones = createBones( sizing );
	mesh = createMesh( geometry, bones );
	mesh.scale.multiplyScalar( 1 );

	torsoMesh.add( mesh );
}

function createGeometry( sizing ) {
	var geometry = new CylinderBufferGeometry(
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

	geometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( skinIndices, 4 ) );
	geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( skinWeights, 4 ) );

	return geometry;
}

function createBones( sizing ){
	//ARMS//
	bones = [];

	var prevBone = new Bone();
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
	var material = new MeshPhongMaterial( {
		skinning: true,
		color: 0x156289,
		emissive: 0x072534,
		side: DoubleSide,
		flatShading: true
	} );

	var mesh = new SkinnedMesh( geometry,	material );
	var skeleton = new Skeleton( bones );

	mesh.add( bones[ 0 ] );

	mesh.bind( skeleton );

	skeletonHelper = new SkeletonHelper( mesh );
	skeletonHelper.material.linewidth = 2;
	scene.add( skeletonHelper );

	return mesh;
}