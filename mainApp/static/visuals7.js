/////////////////////////
//  GLOBAL VARIABLES   //
/////////////////////////
//props
var artist = 'artist';
var track = 'track';
var acoustic, dance, energy, instrument, speech, valence, tempo, key, liveness, timeSig, mode, loudness;
var loudness_max = [];
var loudness_start = [];
var pitches = [];
//scene
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
var x = 0;
var y = 0;
var dim =[10,10,10,10,10,10,10,10,10,10,10,10];
///////////////////
// BOOTSTRAPPING //
///////////////////
getProps();
var timedGETRequests = setInterval(getProps, 2500);
////////////////////
// EVENT HANDLERS //
////////////////////
$(window).keydown(function( event ) {
  // console.log(event.which);
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
  }else if ( event.which == 86 ) {// v key pressed
    $("#video").toggle();
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
      progress = 0.1;
      trackPosition = 0;
      lastTrackPositionUpdate = 0;
      nextTrackBeat = 0;
      loudness_start.length = 0;
      loudness_max.length = 0;
      pitches.length = 0;
      for (var i = 0; i < data.segments.length; i++) {
        loudness_start[i]=Math.round((data.segments[i]['start']+data.segments[i]['loudness_max_time']) *1000);
        loudness_max[i]=data.segments[i]['loudness_max'];
        pitches[i]=data.segments[i]['timbre'];
      }
      trackDuration = data.duration;
      //update props HUD
      // timing
      trackBeats.length=0;
      for (var i = 0; i < data.beats.length; i++) {
        trackBeats[i] = Math.round(data.beats[i].start *1000);
      }
      console.log(trackBeats);
      $("#hudArtist").text(artist);
      $("#hudTrack").text(track);
      if ( $("#artwork").attr("src") != data.art ){
        $("#artwork").attr({ "src": data.art });
      }
      currentTrack = data.track;
      ////////////////
      // HUD UPDATE //
      ////////////////
      $('#hudProps').text("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode+", loudness: ");
    }
  })
}
////////////////////
// SETUP FUNCTION //
////////////////////
function setup(){
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.style('z-index', '1');
  background(255,255,255,0);
  frameRate(60);
  rectMode(CENTER);
  // $("#overlayFooter").show();
  $("#video").hide();
  $("#loading").hide();
}
///////////////////
//   ANIMATION   //
///////////////////
function draw() {
  background(0);
  drawSun();
  /////////////////
  // SYSTEM BITS //
  /////////////////
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
  // console.log(dim);
  progress = trackPosition/trackDuration;
  $("#progressBar").width(progress*500);
}
function drawSun(){
  // position
  var posX = progress*(width)-width/2;
  var posY = progress*(height)-height/2;
  // draw circle
  fill(200,200,0,200);
  noStroke();
  ellipse(posX, 0, 90, 90);
  //incremment rotation
  x+=0.01;
  // draw sphere
  noFill(0,255,0,0.1);
  stroke(255,255,0);
  push();
  translate(posX,0,0);
  rotateX(x);
  rotateY(x);
  rotateZ(x);
  sphere(50);
  pop();
}
