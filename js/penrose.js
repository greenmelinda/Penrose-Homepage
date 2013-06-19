
var renderer, camera, settings, materials, bodyGeometry, lightGeometry, triangle, scene;
var modelLoaded = false;

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
	
	camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 1, 900);
	camera.position.z = 70;
	camera.position.x = 50;
	
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
	
	triangle = new THREE.Object3D();

	var base = new THREE.Mesh( 
		new THREE.CircleGeometry(200, 36),
		new THREE.MeshBasicMaterial( { color: 0x111111, shading: THREE.FlatShading } ) 
	);
		
	base.applyMatrix(new THREE.Matrix4().identity().rotateX(-Math.PI / 2));
	base.position.y = -0.6;
	triangle.add(base);

	var loader = new THREE.OBJLoader();
	var bodyLoaded = false;
	var lightsLoaded = false;

	loader.addEventListener( 'load', function ( event ) {
		bodyGeometry = event.content.clone();			
		triangle.add(bodyGeometry);
		if (lightsLoaded)
			finishModelLoad();
		else
			bodyLoaded = true;
	});
	
    loader.load( "resources/obj/penrose-body.obj" );
	
	var lightLoader = new THREE.OBJLoader();
	lightLoader.addEventListener( 'load', function ( event ) {
		lightGeometry = event.content.clone();
		triangle.add(lightGeometry);
		if (bodyLoaded)
			finishModelLoad();
		else
			lightsLoaded = true;
	});
	
    lightLoader.load( "resources/obj/penrose-lights.obj" );
	
	settings = new Settings();	

	scene = new THREE.Scene();

	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(ambientLight);
	
    scene.fog = new THREE.Fog( 0x000000, 0, 1000 );

	// add directional light source
	var directionalLight = new THREE.DirectionalLight(0x404040);
	// directionalLight.matrix = THREE.Matrix4.getInverse(camera.matrixWorld);
	// directionalLight.position.set(1, 1, 1).normalize();
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

}

function finishModelLoad() {
	scene.add(triangle);
	modelLoaded = true;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

var FPS = 30.0;
var msPerTick = 1000 / FPS;
var nextTick = Date.now();

function animate() {
	var currentTime, ticks = 0;

	requestAnimationFrame( animate, renderer.domElement );

    currentTime = Date.now();
    if (currentTime - nextTick > 60 * msPerTick) {
      	nextTick = currentTime - msPerTick;
    }
    while (currentTime > nextTick) {
      	updateModel(scene);
      	nextTick += msPerTick;
      	ticks++;
    }
    if (ticks) {
      	render();
    }

	controls.update();
}

var hue = 0;

function updateModel() 
{
	if (!modelLoaded) 
	{
		return;
	}

	if (settings.isRotatingCheckbox.checked)
	{
		triangle.applyMatrix(new THREE.Matrix4().identity().rotateY(0.0051));
	}

	var scale = 0.025;
	triangle.scale.set(scale, scale, scale);
	triangle.position.y = -2.5;
	
	if (settings.isAnimatingCheckbox.checked && lightGeometry !== undefined)
	{
		var faceIndices = [ 'a', 'b', 'c', 'd' ];
		var f, n;
		var color = new THREE.Color(0xffffff);
		lightGeometry.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				geometry  = child.geometry;

				for ( var i = 0; i < geometry.faces.length; i ++ ) {
					f  = geometry.faces[ i ];
					n = ( f instanceof THREE.Face3 ) ? 3 : 4;

					for( var j = 0; j < n; j++ ) {	
						hue = (hue + 0.0000001) % 1.0;
						color.setHSL(hue, 1.0, 0.5);
						f.vertexColors[ j ] = color;
					}
				}
				
				geometry.colorsNeedUpdate = true;
				child.material = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
			}
		});
	}
}

function render() 
{
	renderer.render( scene, camera );
}

