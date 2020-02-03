from django.shortcuts import render, redirect
from django.http import JsonResponse, QueryDict, HttpResponse
import spotipy
import spotipy.util as util
import requests
from django.shortcuts import redirect
import json

CLIENT_ID = 'a4b853b600994ffc93fa8494751523fe'
CLIENT_SECRET = 'c2854b4fc1a34972a8e2a46368ffbe41'
REDIRECT_URI = 'https://thawing-reef-65294.herokuapp.com/callback'
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

def info(request):
    spotify = spotipy.Spotify(auth=request.session['token'])
    current_track = spotify.currently_playing()
    art = current_track['item']['album']['images'][0]['url']
    artist = current_track['item']['artists']
    track = current_track['item']['name']
    print("\ninfo fetched, sending to front end\n")

    return JsonResponse({
        'art' : art,
        'artist' : artist,
        'track' : track
    })

def props(request):
    spotify = spotipy.Spotify(auth=request.session['token'])
    current_track = spotify.currently_playing()

    props = spotify.audio_features(current_track['item']['id']);
    print("\nprops fetched, sending them to front end\n")

    return JsonResponse({
        'props' : props
    })
