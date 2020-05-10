from django.shortcuts import render, redirect
from django.http import JsonResponse, QueryDict, HttpResponse
import spotipy
import spotipy.util as util
import requests
from django.shortcuts import redirect
import json
import base64

# admin global variables
CLIENT_ID = 'a4b853b600994ffc93fa8494751523fe' # beta (remote) testing
# CLIENT_ID = '39b910c2cd1b410d8dd7cf2623297970' # alpha (local) testing
CLIENT_SECRET = 'c2854b4fc1a34972a8e2a46368ffbe41' # beta (remote) testing
# CLIENT_SECRET = '452b27dec33a40c3bf16c72c29908ece' # alpha (local) testing
REDIRECT_URI = 'https://spotvis.herokuapp.com/callback' # beta (remote) testing
# REDIRECT_URI = 'http://localhost:8000/callback' # alpha (local) testing

encodedData = base64.urlsafe_b64encode(bytes(f"{CLIENT_ID}:{CLIENT_SECRET}", "ISO-8859-1")).decode()

SCOPE = 'user-read-currently-playing'

def authSend(request):
    response = redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + CLIENT_ID +
      '&scope=' + SCOPE +
      '&redirect_uri=' + REDIRECT_URI
    )
    return response

def callback(request):
    code = request.GET['code']
    post_url = 'https://accounts.spotify.com/api/token'
    body = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': REDIRECT_URI, 'client_id':CLIENT_ID, 'client_secret':CLIENT_SECRET}
    response = requests.post(post_url,body)
    request.session['token'] = response.json()['access_token']
    request.session['refresh'] = response.json()['refresh_token']
    return redirect('/select')

def refresh(request):
    # refresh access token
    print('current access token:')
    print(request.session['token'])
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic %s" % encodedData
    }
    data = {
        'grant_type':'refresh_token',
        'refresh_token':request.session['refresh'],
    }
    response = requests.post(url = url, data = data, headers = headers)
    request.session['token'] = response.json()['access_token']
    print('new access token:')
    print(request.session['token'])
    return JsonResponse({
        'success' : 'access token refreshed'
    })

def index(request):
    template_name = 'mainApp/index.html'
    return render(request, template_name)

def select(request):
    template_name = 'mainApp/select.html'
    return render(request, template_name)

def head(request):
    template_name = 'mainApp/head.html'
    return render(request, template_name)

def cube(request):
    template_name = 'mainApp/360Cube.html'
    return render(request, template_name)

def fourhead(request):
    template_name = 'mainApp/4head.html'
    return render(request, template_name)

def movingColours(request):
    template_name = 'mainApp/movingColours.html'
    return render(request, template_name)

def props(request):
    # create spotipy object
    spotify = spotipy.Spotify(auth=request.session['token'])
    # get current track
    current_track = spotify.currently_playing()
    position = current_track['progress_ms']# get position in track
    art = current_track['item']['album']['images'][0]['url']# album art
    artistName = current_track['item']['artists'][0]['name']# artist name
    artist = spotify.artist(current_track['item']['artists'][0]['id'])# artist object
    track = current_track['item']['name']# track name
    trackId = current_track['item']['id']# track id
    duration = current_track['item']['duration_ms']# duration of track
    analysis = spotify.audio_analysis(trackId)# audio analysis object
    features = spotify.audio_features(trackId)# audio features object
    beats = analysis['beats']# array of beat time locations
    acoustic = features[0]['acousticness']
    dance = features[0]['danceability']
    energy = features[0]['energy']
    instrument = features[0]['instrumentalness']
    speech = features[0]['speechiness']
    valence = features[0]['valence']
    tempo = features[0]['tempo']
    key = features[0]['key']
    liveness = features[0]['liveness']
    timeSig = features[0]['time_signature']
    mode = features[0]['mode']

    return JsonResponse({
        'duration' : duration,
        'position' : position,
        'artist' : artistName,
        'track' : track,
        'art' : art,
        'beats' : beats,
        # 'segments' : segments,
        # 'pitches' : pitches,
        # 'timbres' : timbres,
        'acoustic': acoustic,
        'dance': dance,
        'energy': energy,
        'instrument': instrument,
        'speech': speech,
        'valence': valence,
        'tempo': tempo,
        'key': key,
        'liveness': liveness,
        'timeSig': timeSig,
        'mode': mode
    })
