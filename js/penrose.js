var renderer, camera, settings, materials, bodyGeometry;

init();
animate();

function init() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 7;
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );

	window.addEventListener( 'resize', onWindowResize, false );

	var Settings = function () {
		this.modelListSelect = document.getElementById("modelList");
		this.isStereographicCheckbox = document.getElementById("isStereographic");
		this.isInvertingCheckbox = document.getElementById("isInverting");
	};
	
	materials = [
		new THREE.MeshLambertMaterial( { 
			color: 0x222222, 
			side: THREE.DoubleSide,
			shading: THREE.FlatShading, 
			transparent: true,  
			opacity: 0.5
		} ),
		new THREE.MeshBasicMaterial( { 
			color: 0xEEEEEE, 
			shading: THREE.FlatShading, 
			wireframe: true
		} )
	];
	
	
	var loader = new THREE.OBJLoader();
	loader.addEventListener( 'load', function ( event ) {
		bodyGeometry = event.content;
	});
	
    loader.load( "resources/obj/penrose-body.obj" );
	
	settings = new Settings();	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate, renderer.domElement );

	render();
	controls.update();
	//stats.update();
}

function render() {
	var time = new Date().getTime() / 1000;
	var scene = new THREE.Scene();
	
	if (bodyGeometry !== undefined)
	var geometry = bodyGeometry.clone();
	geometry.applyMatrix(new THREE.Matrix4().identity().rotateY(0.1 * time));
	var scale = 0.025;
	geometry.scale.set(scale, scale, scale);
	geometry.position.y = -2.2;
	scene.add(geometry);

	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(ambientLight);
	
	// add directional light source
	var directionalLight = new THREE.DirectionalLight(0xffffff);
//	directionalLight.matrix = THREE.Matrix4.getInverse(camera.matrixWorld);
//	directionalLight.position.set(1, 1, 1).normalize();
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	renderer.render( scene, camera );
}
