////////////////
//   SETUP    //
////////////////
//console.log("1 importing");
import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';

//console.log("2 constants");
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

//models

// props
var colors = colors1.slice();
var artist = 'artist';
var track = 'track';
var energy = 0.1;
var key = 5;

//scene
var scene;
var camera;
var stats;
var renderer;

var progress = 0.1;
////////////////////
// EVENT HANDLERS //
////////////////////

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
    //console.log("r key pressed");
    // reload page
    // getInfo();
    // getProps();
  }
});

// setup functions

createScene();
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
	camera.position.y = -30;
	camera.position.z = 18;
	// create a renderer instance that we can use to render to our scene
	renderer = new THREE.WebGLRenderer({antialias:true});
	// render canvas set to the size of the window
	renderer.setSize(window.innerWidth, window.innerHeight);

	//enable shadows
	renderer.shadowMap.enabled = true;

	// append the renderer to the html page
	document.body.appendChild(renderer.domElement);

	// initialise OrbitControls
	var controls = new OrbitControls( camera, renderer.domElement );

	// stats
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	$(".stats").append( stats.dom );
}


//////////////////
//   DRAWING    //
//////////////////
function setup(){
  // plane
	var gridDim = 8; // dimensions of one grid cell
	var gridNum = 32; //number of rows of the grid
	var gridSize = gridNum * gridDim; //dimensions of whole

  var geometry = new THREE.PlaneGeometry(gridSize,gridSize,gridNum,gridNum);
  var material = new THREE.MeshStandardMaterial({
    wireframe:true,
  });
  var plane = new THREE.Mesh( geometry, material );
  scene.add(plane);


  // create cube heightMap
  var cubeMap = [];
  for (var i = 0; i < gridNum*gridNum; i++) {
    cubeMap[i] = 2 + Math.random()*20;
  }


	// create cubes
  var cubes=[];
	for (var i = 0; i < gridNum/4; i++) {
		for (var j = 0; j < gridNum; j++) {
			var cubeGeo = new THREE.BoxGeometry(8,8,cubeMap[(i+1)*j]);
			var distance = (j*gridDim) - (gridSize/2) + (gridDim/2);
			cubeGeo.translate( (i*gridDim*4)-(gridSize/2)+(gridDim/2), distance, cubeMap[(i+1)*j]/2 );
			var cubeMat = new THREE.MeshStandardMaterial({
			  //wireframe:true,
			  color: colors[2],
				transparent: true,
				opacity: 0.8
			});
			var cube = new THREE.Mesh( cubeGeo, cubeMat );

			cubes.push(cube);
		}
	}


	//add cubes to scene
	for (var i = 0; i < cubes.length; i++) {
		scene.add(cubes[i]);
	}


  // add lights
  var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1);
  scene.add(ambientLight);


  // animate
	animate();
}

///////////////////
//   ANIMATION   //
///////////////////
// animation loop
function animate() {

	// update stats
	stats.update();

	// render
  renderer.render( scene, camera );
  requestAnimationFrame( animate );

	//hud
	progress += 0.1;
	if(progress>500){
		progress=0;
	}
	$("#hudCam").text("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));
	$("#progressBar").width(progress);
  // $("#hudProps").text("energy: " + energy + ", key: " + key + ", colors: " + colors);
}

// get the artwork, artist and track name, and update the user HUD
function getInfo(){
	console.log("getting info");
  $.get("info","",function(data){
    $("#artwork").attr({ "src": data.art });
  	artist = data.artist[0].name;
  	track = data.track;
    $("#hudArtist").text(artist);
    $("#hudTrack").text(track);
  })
}

//get props from spotify
function getProps(){
	console.log("getting props");
  $.get("props","",function(data){
    energy =  data.props[0].energy;
  	key = data.props[0].key;
  	if(key<=5){
  		colors = colors1.slice();
  	}
  	else{
  		colors = colors2.slice();
  	}
  });
}
