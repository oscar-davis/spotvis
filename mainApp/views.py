from django.shortcuts import render, redirect
from django.http import JsonResponse, QueryDict, HttpResponse
import spotipy
import spotipy.util as util
import requests
from django.shortcuts import redirect
import json

CLIENT_ID = '39b910c2cd1b410d8dd7cf2623297970'
CLIENT_SECRET = '452b27dec33a40c3bf16c72c29908ece'
REDIRECT_URI = 'http://localhost:8000/callback'
# REDIRECT_URI = 'https://thawing-reef-65294.herokuapp.com/callback'
SCOPE = 'user-read-currently-playing'

def authSend(request):
    response = redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + CLIENT_ID +
      '&scope=' + SCOPE +
      '&redirect_uri=' + REDIRECT_URI
    )
    print(response)
    return response

def callback(request):
    code = request.GET['code']

    post_url = 'https://accounts.spotify.com/api/token'
    body = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': REDIRECT_URI, 'client_id':CLIENT_ID, 'client_secret':CLIENT_SECRET}

    response = requests.post(post_url,body)

    request.session['token'] = response.json()['access_token']

    return redirect('/visuals')

def index(request):
    template_name = 'mainApp/index.html'
    return render(request, template_name)

def visuals(request):
    template_name = 'mainApp/visuals.html'
    return render(request, template_name)

def props(request):
    # get data
    spotify = spotipy.Spotify(auth=request.session['token'])
    current_track = spotify.currently_playing()
    art = current_track['item']['album']['images'][0]['url']
    artist = current_track['item']['artists'][0]['name']
    track = current_track['item']['name']
    trackId = current_track['item']['id']
    duration = current_track['item']['duration_ms']
    analysis = spotify.audio_analysis(trackId)
    features = spotify.audio_features(trackId)
    beats = analysis['beats']
    position = current_track['progress_ms']
    # props
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
    loudness = features[0]['loudness']

    return JsonResponse({
        'duration' : duration,
        'position' : position,
        'beats' : beats,
        'art' : art,
        'artist' : artist,
        'track' : track,
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
        'mode': mode,
        'loudness': loudness
    })
