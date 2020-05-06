import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';
import {GLTFLoader} from '/static/libraries/three.js/GLTFLoader.js';
/////////////////////////
//  GLOBAL VARIABLES   //
/////////////////////////
//props
var artist = 'artist';
var track = 'track';
var acoustic, dance, energy, instrument, speech, valence, tempo, key, liveness, timeSig, mode, loudness;
var loudness_max = [];
var loudness_start = [];
//scene
var scene;
var camera;
var stats;
var renderer;
var controls;
//timing
var currentTrack;
var progress = 0.1;
var trackPosition = 0;
var trackDuration = 0;
var lastTrackPositionUpdate = 0;
var trackBeats = [];
var nextTrackBeat = 0;
var nextLoudness = 0;
var beatNo = 1;
//ANIMATION
var model;
///////////////////
// BOOTSTRAPPING //
///////////////////
initScene();
loadHeads();
animate();
getProps();
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
    if(trackPosition>data.position){
      lastTrackPositionUpdate = 0;
    }
    trackPosition = data.position;
    // if song has changed, update scene and HUD
    if ( currentTrack != data.track ){
      console.log("song was changed");
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
      loudness_start.length = 0;
      loudness_max.length = 0;
      for (var i = 0; i < data.segments.length; i++) {
        loudness_start[i]=Math.round((data.segments[i]['start']+data.segments[i]['loudness_max_time']) *1000);
        loudness_max[i]=data.segments[i]['loudness_max'];
      }
      trackDuration = data.duration;
      //update props HUD
      // timing
      trackBeats.length=0;
      for (var i = 0; i < data.beats.length; i++) {
        trackBeats[i] = Math.round(data.beats[i].start *1000);
      }
      $("#hudArtist").text(artist);
      $("#hudTrack").text(track);
      if ( $("#artwork").attr("src") != data.art ){
        $("#artwork").attr({ "src": data.art });
      }
      currentTrack = data.track;
      beatNo=1;
      $("#overlayFooter").hide();
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
	renderer = new THREE.WebGLRenderer({antialias:true});
	// render canvas set to the size of the window
	renderer.setSize(window.innerWidth, window.innerHeight);
	// append the renderer to the html page
	document.body.appendChild(renderer.domElement);
	// initialise OrbitControls
	controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );
	// stats
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	$(".stats").append( stats.dom );
  $("#loading").hide();
  $("#overlayFooter").show();
}

//render the heads
function loadHeads(){
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

function render() {
    renderer.render( scene, camera );
}
///////////////////
//   ANIMATION   //
///////////////////
function animate() {
  /////////////////
  // SYSTEM BITS //
  /////////////////
  requestAnimationFrame( animate );
	stats.update();
  renderer.render( scene, camera );
  controls.update();
  // update track position:
  var t = (new Date()).getTime();//1: get the actual time now
  if (lastTrackPositionUpdate == 0) {//if there is no last track position, make it equal to current time
    lastTrackPositionUpdate = t;
  }
  var dt = t - lastTrackPositionUpdate;//2: dt = change in time = current time - track update
  lastTrackPositionUpdate = t;//3: last track update now equals current time
  trackPosition += dt;//4: move along the track position by dt
  // find beat
  var i = nextTrackBeat;// new variable i = next track beat
  while(i < trackBeats.length && trackPosition > trackBeats[i]) {
    i ++;//move to next beat
  }
  if (i > nextTrackBeat) {
    nextTrackBeat = i;
    //////////////////////////
    // BEAT SYNCED MOVEMENT //
    //////////////////////////
  }
  //////////////////////
  // ASYNCED MOVEMENT //
  //////////////////////

  progress = trackPosition/trackDuration;
  $("#progressBar").width(progress*500);
  ////////////////
  // HUD UPDATE //
  ////////////////
	$("#hudCam").text("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));
  $('#hudProps').text("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode+", loudness: ");
}
