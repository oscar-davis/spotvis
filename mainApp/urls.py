from django.urls import path

from mainApp import views

urlpatterns = [
    path('', views.index, name='index'),
    path('authSend', views.authSend, name='authSend'),
    path('callback', views.callback, name='callback'),
    path('visuals', views.visuals, name='visuals'),
    path('props', views.props, name='props')
]
#entry point in URL dispatcher then:
#view which presents the results to the template
