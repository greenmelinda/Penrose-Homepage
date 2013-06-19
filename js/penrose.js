var renderer, camera, settings, materials, bodyGeometry, lightGeometry;

init();
animate();

document.onselectstart = function() {
  return false;
};

function init() {
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 70;
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );

	window.addEventListener( 'resize', onWindowResize, false );

	var Settings = function () {
		this.isRotatingCheckbox = document.getElementById("isRotating");
		this.isAnimatingCheckbox = document.getElementById("isAnimating");
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
	
	var lightLoader = new THREE.OBJLoader();
	lightLoader.addEventListener( 'load', function ( event ) {
		lightGeometry = event.content;
	});
	
    lightLoader.load( "resources/obj/penrose-lights.obj" );
	
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

var lastTime = 0, lastAnimation = 0, lastRotation = 0;
function render() {
	var time = new Date().getTime() / 1000;
	if (settings.isAnimatingCheckbox.checked) 
		lastAnimation += time - lastTime;

	if (settings.isRotatingCheckbox.checked) 
		lastRotation += time - lastTime;

	lastTime = time;
	
	var scene = new THREE.Scene();
	var triangle = new THREE.Object3D();
	
	if (lightGeometry === undefined)
		return;
	
	var lights = lightGeometry.clone();	

	lights.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			var faceIndices = [ 'a', 'b', 'c', 'd' ];
			var color, f, p, n, vertexIndex;
			geometry  = child.geometry;

			for ( var i = 0; i < geometry.faces.length; i ++ ) {
				f  = geometry.faces[ i ];
				n = ( f instanceof THREE.Face3 ) ? 3 : 4;

				for( var j = 0; j < n; j++ ) {
					vertexIndex = f[ faceIndices[ j ] ];
	
					var h = ((lastAnimation * 5) % 100) / 100.0;
					var color = new THREE.Color();
					color = color.setHSL(h, 1.0, 0.5);
					f.vertexColors[ j ] = color;
				}
			}
			
			geometry.colorsNeedUpdate = true;

			child.material = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		}

	} );
	triangle.add(lights);
	
	if (bodyGeometry !== undefined) {
		var geometry = bodyGeometry.clone();
		triangle.add(geometry);
	}
	

	var mesh = new THREE.Mesh( 
		new THREE.CircleGeometry(200, 36),
		new THREE.MeshBasicMaterial( { color: 0x111111, shading: THREE.FlatShading } ) 
	);
	
	mesh.applyMatrix(new THREE.Matrix4().identity().rotateX(-Math.PI / 2));
	mesh.position.y = -0.6;
	triangle.add(mesh);
	
	triangle.applyMatrix(new THREE.Matrix4().identity().rotateY(0.1 * lastRotation));
		
	var scale = 0.025;
	triangle.scale.set(scale, scale, scale);
	triangle.position.y = -2.5;
	scene.add(triangle);

	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(ambientLight);
	
    scene.fog = new THREE.Fog( 0x000000, 0, 1000 );

	// add directional light source
	var directionalLight = new THREE.DirectionalLight(0x404040);
//	directionalLight.matrix = THREE.Matrix4.getInverse(camera.matrixWorld);
//	directionalLight.position.set(1, 1, 1).normalize();
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	renderer.render( scene, camera );
}
