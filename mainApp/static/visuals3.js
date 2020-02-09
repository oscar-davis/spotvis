import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';
/////////////////////////
//  GLOBAL VARIABLES   //
/////////////////////////
//props
var artist = 'artist';
var track = 'track';
var acoustic, dance, energy, instrument, speech, valence, tempo, key, liveness, timeSig, mode, loudness;
//scene
var scene;
var camera;
var stats;
var renderer;
//timing
var currentTrack;
var progress = 0.1;
var trackPosition = 0;
var trackDuration = 0;
var lastTrackPositionUpdate = 0;
var trackBeats = [];
var nextTrackBeat = 0;
var beatNo = 1;
///////////////////
// BOOTSTRAPPING //
///////////////////
initScene();
animate();
var timedGETRequests = setInterval(getProps, 2500);
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
    // cycle thru scenes
  }
});
//////////////////
// GET FUNCTION //
//////////////////
function getProps(){
  console.log("getting props");
  $.get("props","",function(data){
    // if song has changed, update scene and HUD
    if ( currentTrack != data.track ){
      //store props
    	artist = data.artist;
    	track = data.track;
      acoustic = data.acoustic;
      dance = data.dance;
      energy = data.energy;
      instrument = data.instrument;
      speech = data.speech;
      valence = data.valence;
      tempo = data.tempo;
      key = data.key;
      liveness = data.liveness;
      timeSig = data.timeSig;
      mode = data.mode;
      loudness = data.loudness;
      //update props HUD
      $('#hudProps').text("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode+", loudness: "+loudness);
      // timing
      trackPosition = data.position;
      trackDuration = data.duration;
      trackBeats.length=0;
      for (var i = 0; i < data.beats.length; i++) {
        trackBeats[i] = Math.round(data.beats[i].start *1000);
      }
      currentTrack = data.track;
      $("#hudArtist").text(artist);
      $("#hudTrack").text(track);
      $("#artwork").attr({ "src": data.art });
      selectScene();
    }
  })
}
////////////////////
// SETUP FUNCTION //
////////////////////
function initScene(){
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
////////////////////
//  SELECT SCENE  //
////////////////////
function selectScene(){
  console.log("about to empty scene\n");
  emptyScene();
  console.log("scene has been emptied\n");
  if(energy>0.5) {
    console.log("energy > 0.5, activate scene1");
    scene1();
  }
  else if(energy<=0.5) {
    console.log("energy < 0.5, activate scene2");
    scene2();
  }

}
function emptyScene(){
  console.log("emptying scene\n");
  while(scene.children.length > 0){
      scene.remove(scene.children[0]);
  }
}
function scene1(){
  console.log("activate scene 1");
  // plane
	var gridDim = 8; // dimensions of one grid cell
	var gridNum = 32; //number of rows of the grid
	var gridSize = gridNum * gridDim; //dimensions of whole
  var geometry = new THREE.PlaneGeometry(gridSize,gridSize,gridNum,gridNum);
  var material = new THREE.MeshStandardMaterial({wireframe:true});
  var plane = new THREE.Mesh( geometry, material );
  scene.add(plane);
  // add lights
  var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1);
  scene.add(ambientLight);
}
function scene2(){
  console.log("activating scene 2");
}
///////////////////
//   ANIMATION   //
///////////////////
function animate() {
  /////////////////
  // SYSTEM BITS //
  /////////////////
	stats.update();
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  // update track position:
  var t = (new Date()).getTime();//1: get the actual time now
  if (lastTrackPositionUpdate == 0) {//if there is no last track position, make it equal to current time
    lastTrackPositionUpdate = t;
  }
  var dt = t - lastTrackPositionUpdate;//2: dt = change in time = current time - track update
  lastTrackPositionUpdate = t;//3: last track update now equals current time
  trackPosition += dt;//4: move along the track position by dt
  var i = nextTrackBeat;// new variable i = next track beat
  while(i < trackBeats.length && trackPosition > trackBeats[i]) {
    i ++;//move to next beat
  }
  if (i > nextTrackBeat) {
    nextTrackBeat = i;
  /////////////////////
  // SYNCED MOVEMENT //
  /////////////////////
  console.log("beat");
  }
  //////////////////////
  // ASYNCED MOVEMENT //
  //////////////////////

  progress = trackPosition/trackDuration;
  $("#progressBar").width(progress*500);
}
