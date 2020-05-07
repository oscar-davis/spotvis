
import {GLTFLoader} from '/static/libraries/three.js/GLTFLoader.js';
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
var bar;
var direction=1;
//ANIMATION
var head1,head2,head3,head4;
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
    console.log("camera: x:"+ Math.round(camera.position.x)+" y:"+Math.round(camera.position.y)+" z:"+Math.round(camera.position.z));
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
      trackDuration = data.duration;
      //update props HUD
      // timing
      trackBeats.length=0;
      for (var i = 0; i < data.beats.length; i++) {
        trackBeats[i] = Math.round(data.beats[i].start *1000);
      }
      ////////////////
      // HUD UPDATE //
      ////////////////
      console.log("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode);
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

	renderer = new THREE.WebGLRenderer({antialias:true});
	// render canvas set to the size of the window
	renderer.setSize(window.innerWidth, window.innerHeight);
	// append the renderer to the html page
	$("#visualContainer").append(renderer.domElement);
  // create camera to provide a user's perspective
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
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
    scene1();
  }
  $("#loading").hide();
}
function emptyScene(){
  console.log("emptying scene\n");
  while(scene.children.length > 0){
      scene.remove(scene.children[0]);
  }
}
//scene 1
function scene1(){
  loadHeads();
  // loadHead(head2,headChoice,220,50);
  // loadHead(head3,headChoice,-220,-250);
  // loadHead(head4,headChoice,220,-250);
  //position the camera so we can see the whole scene
	camera.position.x = 0;
	camera.position.y = -500;
	camera.position.z = 0;
	// LIGHTS
	var light = new THREE.PointLight( 0xFFCF1F, 100, 500 );
	light.position.set( 0, -150, 100  );
	scene.add( light );

	var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
	scene.add(ambientLight);
}
function scene2(){

}
function loadHeads(){
  var headChoice;
  if(acoustic>0.5){
    headChoice = "head1";
  }
  else{headChoice = "head2"}

  	var loader1 = new GLTFLoader().setPath( '/static/models/'+headChoice+'/' );
  	loader1.load( headChoice+'.gltf', function ( gltf ) {
  		head1 = gltf.scene;
  		head1.receiveShadow = true;
  		head1.scale.multiplyScalar( 12 );
  		head1.rotation.z += 3.1415;
      head1.translateX(-220);
      head1.translateZ(50);

  		head1.traverse((node) => {
  			if (!node.isMesh) return;
  			//node.material.color = new THREE.Color(0xf00fff);
        node.material = new THREE.MeshNormalMaterial();
  		});
  		scene.add( head1 );
  	});

    var loader2 = new GLTFLoader().setPath( '/static/models/'+headChoice+'/' );
  	loader2.load( headChoice+'.gltf', function ( gltf ) {
  		head2 = gltf.scene;
  		head2.receiveShadow = true;
  		head2.scale.multiplyScalar( 12 );
  		head2.rotation.z += 3.1415;
      head2.translateX(220);
      head2.translateZ(50);

  		head2.traverse((node) => {
  			if (!node.isMesh) return;
  			//node.material.color = new THREE.Color(0xf00fff);
        node.material = new THREE.MeshNormalMaterial();
  		});
  		scene.add( head2 );
  	});

    var loader3 = new GLTFLoader().setPath( '/static/models/'+headChoice+'/' );
  	loader3.load( headChoice+'.gltf', function ( gltf ) {
  		head3 = gltf.scene;
  		head3.receiveShadow = true;
  		head3.scale.multiplyScalar( 12 );
  		head3.rotation.z += 3.1415;
      head3.translateX(-220);
      head3.translateZ(-250);

  		head3.traverse((node) => {
  			if (!node.isMesh) return;
  			//node.material.color = new THREE.Color(0xf00fff);
        node.material = new THREE.MeshNormalMaterial();
  		});
  		scene.add( head3 );
  	});

    var loader4 = new GLTFLoader().setPath( '/static/models/'+headChoice+'/' );
  	loader4.load( headChoice+'.gltf', function ( gltf ) {
  		head4 = gltf.scene;
  		head4.receiveShadow = true;
  		head4.scale.multiplyScalar( 12 );
  		head4.rotation.z += 3.1415;
      head4.translateX(220);
      head4.translateZ(-250);

  		head4.traverse((node) => {
  			if (!node.isMesh) return;
  			//node.material.color = new THREE.Color(0xf00fff);
        node.material = new THREE.MeshNormalMaterial();
  		});
  		scene.add( head4 );
  	});
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

    if(beatNo==1){
      head1.rotation.z=1.2*direction;
    }
    if(beatNo==2){
      head2.rotation.z=1.2*direction;
    }
    if(beatNo==3){
      head3.rotation.z=1.2*direction;
    }
    if(beatNo==4){
      head4.rotation.z=1.2*direction;
      beatNo = 0;
      direction=direction*-1;
    }
    beatNo ++;
    bar ++;
  }
  //////////////////////
  // ASYNCED MOVEMENT //
  //////////////////////
  if(start>100){
    head1.rotation.z+=direction*0.05;
    head2.rotation.z+=direction*0.05;
    head3.rotation.z+=direction*0.05;
    head4.rotation.z+=direction*0.05;
  }
  start++;
  progress = trackPosition/trackDuration;
  $("#progressBar").width(progress*window.innerWidth);
}
