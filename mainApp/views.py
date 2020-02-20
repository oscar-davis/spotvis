from django.shortcuts import render, redirect
from django.http import JsonResponse, QueryDict, HttpResponse
import spotipy
import spotipy.util as util
import requests
from django.shortcuts import redirect
import json
import base64

CLIENT_ID = '39b910c2cd1b410d8dd7cf2623297970'
CLIENT_SECRET = '452b27dec33a40c3bf16c72c29908ece'
REDIRECT_URI = 'http://localhost:8000/callback'
# base64.urlsafe_b64encode(auth_str.encode()).decode()
encodedData = base64.urlsafe_b64encode(bytes(f"{CLIENT_ID}:{CLIENT_SECRET}", "ISO-8859-1")).decode()
# REDIRECT_URI = 'https://thawing-reef-65294.herokuapp.com/callback'
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

    return redirect('/visuals')

def refresh(request):
    #  need to add in when/how to trigger refresh tokens, but this is correct
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic %s" % encodedData
    }
    data = {
        'grant_type':'refresh_token',
        'refresh_token':request.session['refresh'],
    }
    print(encodedData)
    response = requests.post(url = url, data = data, headers = headers)
    print("\n\n\n\n\n\n refresh response:")
    print(response.json())
    print("\n\n\n\n\n\n")
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
    # tuen this into a try statement, if returns no code then get new code and try again
    # spotipy.client.SpotifyException: http status: 401, code:-1 - https://api.spotify.com/v1/me/player/currently-playing: The access token expired
    # try:
    spotify = spotipy.Spotify(auth=request.session['token'])
    current_track = spotify.currently_playing()
    art = current_track['item']['album']['images'][0]['url']
    artistName = current_track['item']['artists'][0]['name']
    artist = spotify.artist(current_track['item']['artists'][0]['id'])
    artistArtwork = artist['images'][0]['url']
    track = current_track['item']['name']
    trackId = current_track['item']['id']
    duration = current_track['item']['duration_ms']
    analysis = spotify.audio_analysis(trackId)
    # print(analysis)
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
    segments = analysis['segments']
    # except:
    #         return redirect('/refresh')
# analysis:
# 'pitches': [0.777, 1.0, 0.231, 0.197, 0.218, 0.297, 0.315, 0.198, 0.207, 0.217, 0.156, 0.286], 'timbre': [49.812, 44.107, 11.131, 72.896, 30.448, -45.654, -15.645, 7.921, -2.901, 9.46, 0.925, -8.524]}
    return JsonResponse({
        'duration' : duration,
        'position' : position,
        'beats' : beats,
        'art' : art,
        'artist' : artistName,
        'artistArtwork' : artistArtwork,
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
        'segments': segments
    })
