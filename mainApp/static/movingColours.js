/////////////////////////
//  GLOBAL VARIABLES   //
/////////////////////////
//props
var artist = 'artist';
var track = 'track';
var acoustic, dance, instrument, speech, valence, tempo, key, liveness, timeSig, mode, loudness;
var energy = 0.5;
//scene
//timing
var currentTrack;
var progress = 0.1;
var trackPosition = 0;
var trackDuration = 0;
var lastTrackPositionUpdate = 0;
var trackBeats = [];
var nextTrackBeat = 0;
//ANIMATION
var x = 0;
var dim =[10,10,10,10,10,10,10,10,10,10,10,10];
///////////////////
// BOOTSTRAPPING //
///////////////////
getProps();
var timedGETRequests = setInterval(getProps, 2500);
//////////////////
// GET FUNCTION //
//////////////////
var numPropsCalls = 0;
function getProps(){
  numPropsCalls+=1;
  if(numPropsCalls>200){
    numPropsCalls = 0;
    $.get("refresh","",function(data){
      console.log(data.success);
    });
  }
  else
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
      trackDuration = data.duration;
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
      ////////////////
      // HUD UPDATE //
      ////////////////
      $('#hudProps').text("acousticness: " +acoustic+", danceability: "+dance+ ", energy: "+energy+", instrumentalness: "+instrument+ ", speech: "+speech+", valence: "+valence+", tempo: "+tempo+", key: "+key+", liveness: "+liveness+", time signature: "+timeSig+", mode: "+mode+", loudness: ");
      //////////////////////
      // ANIMATION UPDATE //
      //////////////////////
      xVal.length=0;
      yVal.length=0;
      xDir.length=0;
      yDir.length=0;
      if(key!==0){
        colLowerLim = (12*mode)-40;
        if((12*key)-40<=0){
          colLowerLim = random(255);
        }
        if((12*key)-40>=235){
          colLowerLim=random(255);
        }
      }
      else{
        colLowerLim = (valence*255*2)-40;
        if((valence*255*2)-40<=0){
          colLowerLim = random(255);
        }
        if((valence*255*2)-40>=235){
          colLowerLim=random(255);
        }
      }

      colUpperLim = colLowerLim + 60;
      if((colLowerLim + 60)>255){colUpperLim=255;}
      addBlob();
    }
  })
}
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
/////////////////////////
// ANIMATION VARIABLES //
/////////////////////////
var radius;
var xVal = [];
var yVal = [];
var xDir = [];
var yDir = [];
var colors = 0;
var colDir = 1;
var colLowerLim = 0;
var colUpperLim = 20;
var bar = 1;
var rot = 0;
var rotatingRect;
////////////////////
// SETUP FUNCTION //
////////////////////
function setup(){
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('z-index', '1');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('position', 'absolute');
  colorMode(HSB, 255,255,255,255)
  rectMode(CENTER);
  background(colors,50,255,100);
  frameRate(60);
  $("#loading").hide();
  addBlob();
}
///////////////////
//   ANIMATION   //
///////////////////
function draw() {
  background(0,0,0,0);
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
    if(xVal.length>15){
      xVal.shift();
      yVal.shift();
      xDir.shift();
      yDir.shift();
    }
    //////////////////////////
    // BEAT SYNCED MOVEMENT //
    //////////////////////////
    if(bar===1||bar===3){
      if(progress>0.15&&progress<0.85){
        colors = colUpperLim;
      }
    }
    if(bar===2||bar===4){
      if(progress>0.15&&progress<0.85){
        colors = colLowerLim;
      }
      addBlob();
    }
    if(progress>0.15&&progress<0.85){
      for (var k = 0; k < xDir.length; k++) {
        yDir[k] = yDir[k] *-1;
      }
    }
    for (var k = 0; k < xDir.length; k++) {
      xDir[k] = xDir[k] *-1;
    }
    if(bar===4){
        for (var k = 0; k < xDir.length; k++) {
          xDir[k] = xDir[k] *-1;
        }
        bar = 0;
    }
    bar +=1;
  }
  //////////////////////
  // ASYNCED MOVEMENT //
  //////////////////////
  colors += (colDir * 0.2);
  if(colors>=colUpperLim){
    colDir = -1;
  }
  if(colors<=colLowerLim){
    colDir = 1;
  }
  for (var j = 0; j < xVal.length; j++) {
    if(j<xVal.length/2){
      xVal[j] += random(30*energy*energy) * xDir[j];
      yVal[j] += random(20*energy*energy) * yDir[j];
    }
    else{
      xVal[j] += random(10*energy) * xDir[j];
      yVal[j] += random(10*energy) * yDir[j];
    }
    if(energy>0.7&&(progress>1-dance&&progress<dance)&&(bar===2||bar===4)){
      fill(random(255),50,255,100);
      noStroke();
      ellipse(windowWidth/2,windowHeight/2,windowWidth/4,windowWidth/4);
    }
    // set blob boundaries
    if (xVal[j]> (  windowWidth/2 + ((windowWidth/2)*(1-energy) + 50) + (progress * 100) ) ){
      xDir[j] = -1;
    }
    if (xVal[j]< ( (windowWidth/2) - ((windowWidth/2)*(1-energy)) - 50 - (progress * 100)) ){
      xDir[j] = 1;
    }
    if (yVal[j]> (  windowHeight/2 + ((windowHeight/2)*(1-energy)) + 50 + (progress * 100)) ){
      yDir[j] = -1;
    }
    if (yVal[j]< ( (windowHeight/2) - ((windowHeight/2)*(1-energy)) - 50 - (progress * 100)) ){
      yDir[j] = 1;
    }
    // draw in blobs
    drawBlob(xVal[j],yVal[j],xVal.length/2,j);
  }
  progress = trackPosition/trackDuration;
  // change the radius of blobs in relation to danceability and progress in song
  if(progress<0.7){
    radius = progress*((1-dance)*800);
  }
  else{
    radius = (1-progress)*((1-dance)*800);
  }
  // update width of progress bar in HUD
  $("#progressBar").width(progress*windowWidth);
}
//draw set of blobs on the screen
function drawBlob(x,y,length,j){
    fill(colors,255,255,100);
    if(acoustic>0.6){
      noStroke();
    }
    else{
      stroke('black');
    }
    if(length>j){
      rect(x,y,random(radius),random(radius));
    }
    else{
      ellipse(x,y,random(radius),random(radius));
    }

}
// add blob to set of blobs
function addBlob(){
  xVal.push(random(windowWidth));
  yVal.push(random(windowHeight));
  xDir.push(1);
  yDir.push(1);
}
