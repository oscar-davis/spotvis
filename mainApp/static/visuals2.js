////////////////
//   SETUP    //
////////////////
import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';
//CONSTANTS
// props
var artist = 'artist';
var track = 'track';
var energy = 0.1;
var key = 5;
var cube;
//scene
var scene;
var camera;
var stats;
var renderer;
var progress = 0.1;
var trackPosition = 0;
var lastTrackPositionUpdate = 0;
var trackBeats = [];
var nextTrackBeat = 0;
var beatNo = 1;
////////////////////
// TIMED REQUESTS //
////////////////////
function timedGetRequest() {
  getTrackPosition();
}
// setup functions
createScene();
getTrackPosition();
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
  // call get interval functions
  var myVar = setInterval(timedGetRequest, 2500);

  // add cube
  var cubeGeo = new THREE.BoxGeometry(10,10,10);
  var cubeMat = new THREE.MeshNormalMaterial({
    //wireframe:true,
    transparent: true,
    opacity: 0.8
  });
  cube = new THREE.Mesh( cubeGeo, cubeMat );
  scene.add(cube);

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
	//$("#hudCam").text("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));


  // update track position:
  var t = (new Date()).getTime();//1: get the actual time now
  if (lastTrackPositionUpdate == 0) {//if there is no last track position, make it equal to current time
    lastTrackPositionUpdate = t;
  }
  var dt = t - lastTrackPositionUpdate;//2: dt = change in time = current time - track update

  lastTrackPositionUpdate = t;//3: last track update now equals current time
  trackPosition += dt;//4: move along the track position by the amount of time that has passed

  var i = nextTrackBeat;// new variable i = next track beat

  while(i < trackBeats.length && trackPosition > trackBeats[i]) {
    i ++;//move to next beat
  }



  // do stuff on beat:
  if (i > nextTrackBeat) {
    // console.log("nextTrackBeat: "+nextTrackBeat);
    // console.log('BEAT #' + i + ' at ' + trackPosition + ' ms')
    nextTrackBeat = i;
    if(beatNo==1||beatNo==3){
      cube.scale.y += 1;
      cube.scale.x += 1;
      beatNo ++;
    }
    else if(beatNo==2||beatNo==4){
      cube.scale.y -= 1;
      cube.scale.x -= 1;
      beatNo ++;
    }
    if(beatNo==5){
      beatNo=1;
    }


  }

  //constant animation bits
  cube.rotation.z += 0.01;
  cube.rotation.y += 0.01;

}

// get the artwork, artist and track name, and update the user HUD
function getTrackPosition(){
  $.get("trackPosition","",function(data){
    if ( $("#artwork").attr("src") != data.art ){
      $("#artwork").attr({ "src": data.art });
    }
  	artist = data.artist[0].name;
  	track = data.track;
    trackPosition = data.position;
    progress = data.position/data.duration;
    $("#progressBar").width(progress*500);

    //trackBeats=data.beats.slice(0);
    trackBeats.length=0;
    for (var i = 0; i < data.beats.length; i++) {
      trackBeats[i] = Math.round(data.beats[i].start *1000);
    }
    //console.log(trackBeats);
    //console.log(trackBeats);
    $("#hudArtist").text(artist);
    $("#hudTrack").text(track);

  })
}
