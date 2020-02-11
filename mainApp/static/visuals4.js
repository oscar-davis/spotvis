import {OrbitControls} from "/static/libraries/three.js/OrbitControls.js";
import Stats from '/static/libraries/three.js/stats.module.js';
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
var start=0;
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
var cube;
var cubeScale = 1;
var cubeScaleNow = 1;
///////////////////
// BOOTSTRAPPING //
///////////////////
initScene();
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
      selectScene();
      currentTrack = data.track;
      beatNo=1;
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
}
function render() {
    renderer.render( scene, camera );
}
////////////////////
//  SELECT SCENE  //
////////////////////
function selectScene(){
  emptyScene();
  // check if 2d or 3d needed:
  if(energy<0.7) {
    console.log("energy > 0.5, activate scene1");
    scene1();
  }
  else if(energy>=0.7) {
    console.log("energy < 0.5, activate scene2");
    scene2();
  }
  $("#loading").hide();
  $("#overlayFooter").show();
}
function emptyScene(){
  console.log("emptying scene\n");
  while(scene.children.length > 0){
      scene.remove(scene.children[0]);
  }
}
//scene 1
function scene1(){
  console.log("activate scene 1");
  controls.autoRotate = true;
	//position the camera so we can see the whole scene
	camera.position.x = 0;
	camera.position.y = -20;
	camera.position.z = 28;
  controls.update();
	//cubemap
	var path = '/static/textures/cube/Day'+rando(1, 14)+'/';
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;
  scene.background = reflectionCube;
  //cube
  var cubeGeo = new THREE.BoxGeometry(10,10,10);
  var cubeMat = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );
  cube = new THREE.Mesh( cubeGeo, cubeMat );
  scene.add(cube);
  // add lights
  var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1);
  scene.add(ambientLight);
}
function scene2(){
  console.log("activate scene 2");
  controls.autoRotate = true;
	//position the camera so we can see the whole scene
	camera.position.x = 0;
	camera.position.y = -7;
	camera.position.z = 7;
  controls.update();
	//cubemap
	var path = '/static/textures/cube/Night'+rando(1, 6)+'/';
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;
	scene.background = new THREE.Color( 0x000000 );
  //cube
  var cubeGeo = new THREE.BoxGeometry(10,10,10);
  var cubeMat = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );
  cube = new THREE.Mesh( cubeGeo, cubeMat );
  scene.add(cube);
  // add lights
  var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1);
  scene.add(ambientLight);
}
///////////////////
//   ANIMATION   //
///////////////////
function animate() {
  /////////////////
  // SYSTEM BITS //
  /////////////////
  start++;
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
    if(beatNo==1||beatNo==3){
      cubeScale = -1;
      beatNo ++;
    }
    else if(beatNo==2||beatNo==4){
      cubeScale = 1;
      beatNo ++;
    }
    if(beatNo==5){
      beatNo=1;
    }
  }
  //////////////////////
  // ASYNCED MOVEMENT //
  //////////////////////
  if(start>100){
    //cube.rotation.z += 0.007*energy;
    cube.rotation.y += 0.007*energy;
    if(energy>0.7){
      cube.scale.y += cubeScale*0.5;
      cube.scale.x += cubeScale*0.5;
      cube.rotation.z += 0.07*energy;
    }
    else{
      cube.scale.y += cubeScale*0.01;
      cube.scale.x += cubeScale*0.01;
    }
  }
  progress = trackPosition/trackDuration;
  $("#progressBar").width(progress*500);
  ////////////////
  // HUD UPDATE //
  ////////////////
	$("#hudCam").text("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));
  $('#hudProps').text("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode+", loudness: ");
}
