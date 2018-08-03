var smileFactor;
var face;

(function exampleCode() {
	"use strict";

	brfv4Example.initCurrentExample = function(brfManager, resolution) {
		brfManager.init(resolution, resolution, brfv4Example.appId);
	};

	brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {

		brfManager.update(imageData);

		draw.clear();

		// Face detection results: a rough rectangle used to start the face tracking.

		draw.drawRects(brfManager.getAllDetectedFaces(),	false, 1.0, 0x00a1ff, 0.5);
		draw.drawRects(brfManager.getMergedDetectedFaces(),	false, 2.0, 0xffd200, 1.0);

		var faces = brfManager.getFaces(); // default: one face, only one element in that array.

		for(var i = 0; i < faces.length; i++) {

			face = faces[i];

			if(		face.state === brfv4.BRFState.FACE_TRACKING_START ||
					face.state === brfv4.BRFState.FACE_TRACKING) {

				// Smile Detection

				setPoint(face.vertices, 48, p0); // mouth corner left
				setPoint(face.vertices, 54, p1); // mouth corner right
				//console.log(face.vertices);

				var mouthWidth = calcDistance(p0, p1);

				setPoint(face.vertices, 39, p1); // left eye inner corner
				setPoint(face.vertices, 42, p0); // right eye outer corner

				var eyeDist = calcDistance(p0, p1);
				smileFactor = mouthWidth / eyeDist;

				smileFactor -= 1.40; // 1.40 - neutral, 1.70 smiling

				if(smileFactor > 0.25) smileFactor = 0.25;
				if(smileFactor < 0.00) smileFactor = 0.00;

				smileFactor *= 4.0;

				if(smileFactor < 0.0) { smileFactor = 0.0; }
				if(smileFactor > 1.0) { smileFactor = 1.0; }

				//console.log(smileFactor);
				// Let the color show you how much you are smiling.

				var color =
					(((0xff * (1.0 - smileFactor) & 0xff) << 16)) +
					(((0xff * smileFactor) & 0xff) << 8);

				// Face Tracking results: 68 facial feature points.

				draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
				draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

				// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple " +
				// 	"smile detection.\nDetects how much someone is smiling. smile factor: " +
				// 	(smileFactor * 100).toFixed(0) + "%");
				brfv4Example.dom.updateHeadline((smileFactor * 100).toFixed(0) + "%");
			}
		}
	};

	var p0				= new brfv4.Point();
	var p1				= new brfv4.Point();

	var setPoint		= brfv4.BRFv4PointUtils.setPoint;
	var calcDistance	= brfv4.BRFv4PointUtils.calcDistance;

	// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple smile " +
	// 	"detection.\nDetects how much someone is smiling.");
	//
	// brfv4Example.dom.updateCodeSnippet(exampleCode + "");
})();

var renderer, scene, camera, video, group;
var objs = [];

init();
animate();

//

function init() {

	var container = document.getElementById( 'container' );

	// SCENE

	scene = new THREE.Scene();
	//scene.background =  new THREE.Color("0x32CD32");

	// LIGHT
	var ambient = new THREE.AmbientLight( 0xffffff );
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(0,50,50);
	scene.add(light);
	scene.add(ambient);


	// CAMERA

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 30 );


	//

	var helper = new THREE.GridHelper( 160, 10 );
	helper.rotation.x = Math.PI / 2;
	//scene.add( helper );

	//

	var loader = new THREE.SVGLoader();
	for(let i=0;i<1;i++) {

		loader.load( 'svg/red.svg', function ( paths ) {

			group = new THREE.Group();
			group.scale.multiplyScalar( 0.1 );
			group.scale.y *= -1;

			for ( var i = 0; i < paths.length; i ++ ) {

				var path = paths[ i ];

				// var material = new THREE.MeshBasicMaterial( {
				// 	color: path.color,
				// 	side: THREE.DoubleSide,
				// 	depthWrite: false
				// } );
				var material = new THREE.MeshPhongMaterial( { color: path.color, specular: 0x009900, shininess: 30, transparent: true } )

				var shapes = path.toShapes( true );

				for ( var j = 0; j < shapes.length; j ++ ) {

					var shape = shapes[ j ];

					var geometry = new THREE.ShapeBufferGeometry( shape );

					var shape3d = new THREE.ExtrudeBufferGeometry( shape, {
						depth: 15,
						bevelEnabled: false
					} );
					var mesh = new THREE.Mesh( shape3d, material );
					mesh.position.set(THREE.Math.randInt(-300,300), THREE.Math.randInt(-200,200),THREE.Math.randInt(-600,100));
					//var mesh = new THREE.Mesh( geometry, material );

					group.add( mesh );
					objs.push(group);
					scene.add( group );
				}
			}
		});
	}

	// for(let i=0;i<10;i++) {
	//
	// 	loader.load( 'svg/icon2.svg', function ( paths ) {
	//
	// 		group = new THREE.Group();
	// 		group.scale.multiplyScalar( 0.1 );
	// 		group.scale.y *= -1;
	//
	// 		for ( var i = 0; i < paths.length; i ++ ) {
	//
	// 			var path = paths[ i ];
	//
	// 			var material = new THREE.MeshPhongMaterial( { color: path.color, specular: 0x009900, shininess: 30, transparent: true } )
	//
	// 			var shapes = path.toShapes( true );
	//
	// 			for ( var j = 0; j < shapes.length; j ++ ) {
	//
	// 				var shape = shapes[ j ];
	//
	// 				var geometry = new THREE.ShapeBufferGeometry( shape );
	//
	// 				var shape3d = new THREE.ExtrudeBufferGeometry( shape, {
	// 					depth: 15,
	// 					bevelEnabled: false
	// 				} );
	// 				var mesh = new THREE.Mesh( shape3d, material );
	// 				mesh.position.set(THREE.Math.randInt(-300,300), THREE.Math.randInt(-200,200),THREE.Math.randInt(-600,100));
	// 				//var mesh = new THREE.Mesh( geometry, material );
	//
	// 				group.add( mesh );
	// 				objs.push(group);
	// 				scene.add( group );
	// 			}
	// 		}
	// 	});
	// }
	//
	// for(let i=0;i<10;i++) {
	//
	// 	loader.load( 'svg/icon3.svg', function ( paths ) {
	//
	// 		group = new THREE.Group();
	// 		group.scale.multiplyScalar( 0.1 );
	// 		group.scale.y *= -1;
	//
	// 		for ( var i = 0; i < paths.length; i ++ ) {
	//
	// 			var path = paths[ i ];
	//
	// 			// var material = new THREE.MeshBasicMaterial( {
	// 			// 	color: path.color,
	// 			// 	side: THREE.DoubleSide,
	// 			// 	depthWrite: false
	// 			// } );
	// 			var material = new THREE.MeshPhongMaterial( { color: path.color, specular: 0x009900, shininess: 30, transparent: true } )
	//
	// 			var shapes = path.toShapes( true );
	//
	// 			for ( var j = 0; j < shapes.length; j ++ ) {
	//
	// 				var shape = shapes[ j ];
	//
	// 				var geometry = new THREE.ShapeBufferGeometry( shape );
	//
	// 				var shape3d = new THREE.ExtrudeBufferGeometry( shape, {
	// 					depth: 15,
	// 					bevelEnabled: false
	// 				} );
	// 				var mesh = new THREE.Mesh( shape3d, material );
	// 				mesh.position.set(THREE.Math.randInt(-300,300), THREE.Math.randInt(-200,200),THREE.Math.randInt(-600,100));
	// 				//var mesh = new THREE.Mesh( geometry, material );
	//
	// 				group.add( mesh );
	// 				objs.push(group);
	// 				scene.add( group );
	// 			}
	// 		}
	// 	});
	// }
	//
	// for(let i=0;i<10;i++) {
	//
	// 	loader.load( 'svg/icon4.svg', function ( paths ) {
	//
	// 		group = new THREE.Group();
	// 		group.scale.multiplyScalar( 0.1 );
	// 		group.scale.y *= -1;
	//
	// 		for ( var i = 0; i < paths.length; i ++ ) {
	//
	// 			var path = paths[ i ];
	//
	// 			var material = new THREE.MeshPhongMaterial( { color: path.color, specular: 0x009900, shininess: 30, transparent: true } )
	//
	// 			var shapes = path.toShapes( true );
	//
	// 			for ( var j = 0; j < shapes.length; j ++ ) {
	//
	// 				var shape = shapes[ j ];
	//
	// 				var geometry = new THREE.ShapeBufferGeometry( shape );
	//
	// 				var shape3d = new THREE.ExtrudeBufferGeometry( shape, {
	// 					depth: 15,
	// 					bevelEnabled: false
	// 				} );
	// 				var mesh = new THREE.Mesh( shape3d, material );
	// 				mesh.position.set(THREE.Math.randInt(-300,300), THREE.Math.randInt(-200,200),THREE.Math.randInt(-600,100));
	// 				//var mesh = new THREE.Mesh( geometry, material );
	//
	// 				group.add( mesh );
	// 				objs.push(group);
	// 				scene.add( group );
	// 			}
	// 		}
	// 	});
	// }

	//

	renderer = new THREE.WebGLRenderer( { alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( 1300, 720 );
	// renderer.setClearColor( 0x000000, 0 );
	//renderer.domElement.style.width = "600px";
	container.appendChild( renderer.domElement );

	//

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.screenSpacePanning = true;

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

var raycaster = new THREE.Raycaster();
function render() {
	var timer = 0.0001 * Date.now();
	var d_Pts = [];
	var objX;
	var objY;

	for (let j=0;j<objs.length;j++) {
		var obj = objs[j];
		// obj.position.x = 15 * Math.cos( timer + j );
		// obj.position.y = 15 * Math.sin( timer + j * 1.1 );
		//let axis = new THREE.Vector3( obj.position.x, obj.position.y, obj.position.z ).normalize();
		//obj.rotateOnAxis( axis, 0.1 );
	}

	if (face) {
		d_Pts.push( {'x':face.vertices[66],'y':face.vertices[67]} );

		for (let j=0;j<objs.length;j++) {
			var obj = objs[j];
			raycaster.setFromCamera( obj, camera );
			var intersects = raycaster.intersectObjects( scene.children );

			objX = ( obj.position.x / window.innerWidth ) * 2 - 1;
			objY = - ( obj.position.y / window.innerHeight ) * 2 + 1;
			console.log(objX);
			// obj.position.y = 15 * Math.sin( timer + j * 1.1 );
		}
	}

	renderer.render( scene, camera );

}
