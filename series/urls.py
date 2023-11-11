from django.urls import path
from . import views

urlpatterns = [
    path('genres', views.genres, name='genres'),
    path('popular', views.popular, name='popular'),
]

