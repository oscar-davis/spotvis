# spotvis
A visualizer for Spotify. Uses EchoNest data about the song you are playing to procedurally generate animations that match the mood of the track.

Hosted on Heroku at https://thawing-reef-65294.herokuapp.com/
Back end: Django w/ Spotipy
Front end: JS w/ three.js, jQuery

# TO DO:
- create interface for switching between animations ("change visual" button in the overlay footer)
- Have the visuals be extensions to a "getdata" template
- decide on a few different animations to implement - make them for higher energy music so ready for Saturday
  - do this by writing down all the techniques that I have available, along with all of the props from Spotify

# Ideas:
- Webcam taking photo every beat, 4 beat grid, full screen
- Scene with sun moving across sky:
  - trees wave to the beat
  - shadows follow movement of the sun (work out how to do shadows in p5 (if it is possible, if nto then do it in three.js))
- 
