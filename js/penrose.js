var renderer, camera, settings, materials, bodyGeometry, lightGeometry;

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

function render() {
	var time = new Date().getTime() / 1000;
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

					p = geometry.vertices[ vertexIndex ];

					color = new THREE.Color( 0xffffff );
					
					var scale = 0.0001;
					var speed = 1000;
					var amplitude = 0.4;
					var gain = 0.6;
					var r = Math.cos((p.x * scale) * time * speed ) * amplitude + gain;
					var g = Math.cos((p.y * scale) * time * speed ) * amplitude + gain;
					var b = Math.cos((p.z * scale) * time * speed ) * amplitude + gain;
					
					color.setRGB(r, g, b);
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
	
	triangle.applyMatrix(new THREE.Matrix4().identity().rotateY(0.1 * time));
	var scale = 0.025;
	triangle.scale.set(scale, scale, scale);
	triangle.position.y = -2.2;
	scene.add(triangle);

	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(ambientLight);
	
	scene.fog = new THREE.Fog( 0x111111, 1500, 2100 );

	// add directional light source
	var directionalLight = new THREE.DirectionalLight(0x111111);
//	directionalLight.matrix = THREE.Matrix4.getInverse(camera.matrixWorld);
//	directionalLight.position.set(1, 1, 1).normalize();
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	renderer.render( scene, camera );
}
