////////////////
//   SETUP    //
////////////////
// gtlf converter: https://products.aspose.app/3d/conversion/obj-to-glb
import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';
import {GLTFLoader} from '/static/libraries/three.js/GLTFLoader.js';

//CONSTANTS
//colors
const colors1 = [
	"#1155FF",
	"#1199FF",
	"#11CCFF",
	"#11FFFF",
];

const colors2 = [
	"#11FF55",
	"#11FF99",
	"#11FFCC",
	"#11FFFF",
];

// props
var colors = colors1.slice();
var artist = 'artist';
var track = 'track';
var energy = 0.1;
var key = 5;

// animating indexes
var index = 1;
var framecount = 0;

//models
var stars;
var starGeo;
var cubes = [];// create an array of cubes
var plane;
var geometry;//terrain geometry
var heightMap = [];
var model;

//scene
var scene;
var camera;
var stats;
var renderer;
////////////////////
// EVENT HANDLERS //
////////////////////

console.log("3 event handlers");
$(window).keydown(function( event ) {
  if ( event.which == 72 ) {// h key pressed
		//hide user HUD
		$("#overlayFooter").toggle({duration:0});
	}
	else if ( event.which == 73 ) {// i key pressed
		// hide info display
		$("#overlayHeader").toggle({duration:0});
	}
  else if ( event.which == 82 ) {// r key pressed
    console.log("r key pressed");
    // reload page
    getInfo();
    getProps();
  }
});

// setup functions
console.log("4 about to run createScene");
createScene();
console.log("5 about to run getInfo");
getInfo();
console.log("6 about to run getProps");
getProps();
console.log("7 about to run head, colors: "+colors);
head();
console.log("8 about to run setup, colors: "+colors);
setup();

function createScene(){
	// create scene to render onto
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	scene.fog = new THREE.Fog( 0x000000, 200, 600 );
	// create camera to provide a user's perspective
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
	//position the camera so we can see the whole scene
	camera.position.x = 0;
	camera.position.y = -245;
	camera.position.z = 15;
	// create a renderer instance that we can use to render to our scene
	renderer = new THREE.WebGLRenderer({antialias:true});
	// render canvas set to the size of the window
	renderer.setSize(window.innerWidth, window.innerHeight);

	//enable shadows
	renderer.shadowMap.enabled = true;

	// append the renderer to the html page
	$("#visualContainer").append(renderer.domElement);

	// initialise OrbitControls
	var controls = new OrbitControls( camera, renderer.domElement );

	// stats
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	$(".stats").append( stats.dom );

}

//render the head
function head(){
	var loader = new GLTFLoader().setPath( '/static/models/head4/' );
	loader.load( 'head4.gltf', function ( gltf ) {
		model = gltf.scene

		// model.receiveShadow = true;
		model.scale.multiplyScalar( 12 );
		model.rotation.z += 3.1415;

		model.traverse((node) => {
			if (!node.isMesh) return;
			node.material.wireframe = true;
			node.material.color = 0xffffff;
		});

		// var newMaterial = new THREE.MeshStandardMaterial({color: colors[0]});
		// model.traverse((node) => {
		// 	if (!node.isMesh) return;
		// 	node.material = newMaterial;
		// });
		scene.add( model );
	});
}

//////////////////
//   DRAWING    //
//////////////////
function setup(){
	// // CUBES
	// // cycle through the array and create a new cube, then add to the array
	// for(var i=0;i<10;i++){
	// 	var cubeGeo = new THREE.BoxGeometry( 10+i*4, 1, i );
	// 	var distance = i*2;
	// 	cubeGeo.translate(distance,distance+100,distance);
	// 	var material = new THREE.MeshStandardMaterial({
	// 		color: colors[(i%colors.length)],
	// 	});
	// 	var cube = new THREE.Mesh( cubeGeo, material );
	// 	cubes.push(cube);
	// 	scene.add(cubes[i]);
	//   $("#loading").hide();
	// }
	//
	// // TERRAIN
	// // global variables
	// var terrainDim = 32;
	//
	// var seed = 32;
	//
	// heightMap[0] = Math.random()*seed;
	// heightMap[1] =((Math.random()*seed) + heightMap[0])/2;
	// heightMap[2] =((Math.random()*seed) + heightMap[1] + heightMap[0])/3;
	//
	// for (var i = 3; i < terrainDim*terrainDim*4; i++){
	//     heightMap[i] = ((Math.random()*seed) + heightMap[i-1] + heightMap[i-2] + heightMap[i-3])/4;
	// }

	// // draw terrain
	// geometry = new THREE.PlaneGeometry(terrainDim*40, terrainDim*20, (terrainDim*4)-1, (terrainDim*2)-1);
	// for (var i = 0, l = geometry.vertices.length; i < l; i++) {
	//   geometry.vertices[i].z = heightMap[i];
	// }
	//
	// var material = new THREE.MeshStandardMaterial({
	//   //wireframe:true,
	//   color: colors[2],
	// 	transparent: true,
	// 	opacity: 0.8
	// });
	//
	// plane = new THREE.Mesh( geometry, material );
	// scene.add(plane);
	//
	//
	// // STARS
	// starGeo = new THREE.Geometry();
	// for (var i = 0; i < 600; i++) {
	//   var star = new THREE.Vector3(
	//     Math.random()*600 - 300,
	//     Math.random()*600 - 300,
	//     Math.random()*600 - 300
	//   );
	//   star.velocity = 0.1;
	//   star.acceleration = 0.005;
	//   starGeo.vertices.push(star);
	// }
	//
	// var sprite = new THREE.TextureLoader().load('static/images/star.png')
	// var starMaterial = new THREE.PointsMaterial({
	//   color: 0xaaaaaa,
	//   size: 0.7,
	//   map: sprite
	// });
	//
	// stars = new THREE.Points(starGeo,starMaterial);
	// scene.add(stars);

	// LIGHTS
	var light = new THREE.PointLight( 0xFFFFFF, 50, 100 );
	light.position.set( 0, -150, 100 );
	scene.add( light );

	var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
	scene.add(ambientLight);

	// run the animation loop
	animate();
}

///////////////////
//   ANIMATION   //
///////////////////
// animation loop
function animate() {
  // // move stars
  // for (var i = 0; i < 600; i++) {
  //   var p = starGeo.vertices[i];
	// 	p.acceleration= 0.0008*energy;
  //   p.velocity += p.acceleration
  //   p.x -= p.velocity;
	//
  //   if (p.x < -200) {
  //     p.x = 200;
  //     p.velocity = 0;
  //   }
  // }
	// //stars.rotation.z +=0.001;
  // starGeo.verticesNeedUpdate = true;
	//
  // // move cubes
  // for (var i = 0; i < cubes.length; i++) {
	//   cubes[i].rotation.z += (energy*i/40)+0.001;
	// 	cubes[i].rotation.x += (energy*i/40)+0.001;
	// 	cubes[i].rotation.y
	// 	 += (energy*i/40)+0.001;
	// 	cubes[i].material.color = new THREE.Color(colors[(i%colors.length)]);
	// }

  // // move terrain
	// geometry.verticesNeedUpdate = true;
	// for (var i = 0, l = geometry.vertices; i < l.length; i++) {
	//   l[i].z = heightMap[((i+index) % heightMap.length + heightMap.length) % heightMap.length];
	// }
	// plane.material.colorNeedUpdate = true;
	// plane.material.color = new THREE.Color(colors[2]);
	//
	// framecount += energy;
	// if(framecount>=1){
	// 	index += 1;
	// 	framecount = 0;
	// }

	// update model color
	if(model){
		model.traverse((node) => {
			if (!node.isMesh) return;
			node.material.color = new THREE.Color(colors[1]);
		});
	}

	// update stats
	stats.update();

	// render
  renderer.render( scene, camera );
  requestAnimationFrame( animate );

	//hud
	$("#hudCam").text("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));
  $("#hudProps").text("energy: " + energy + ", key: " + key + ", colors: " + colors);
}

// get the artwork, artist and track name, and update the user HUD
function getInfo(){
	console.log("getting info");
}

//get props from spotify
function getProps(){
	console.log("getting props");
  $.get("props","",function(data){
		$("#artwork").attr({ "src": data.art });
		artist = data.artist;
		track = data.track;
		$("#hudArtist").text(artist);
		$("#hudTrack").text(track);
    energy =  data.energy;
  	key = data.key;
  	if(key<=5){
  		colors = colors1.slice();
  	}
  	else{
  		colors = colors2.slice();
  	}
  });
}
