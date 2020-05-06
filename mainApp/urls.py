from django.urls import path

from mainApp import views

urlpatterns = [
    path('', views.index, name='index'),
    path('authSend', views.authSend, name='authSend'),
    path('callback', views.callback, name='callback'),
    path('props', views.props, name='props'),
    path('360Cube', views.cube, name='360Cube'),
    path('4head', views.fourhead, name='4head'),
    path('movingColours', views.movingColours, name='movingColours'),
]
