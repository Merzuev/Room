from django.urls import path
from . import views

app_name = 'pages' # For namespacing
urlpatterns = [
    path('', views.home_view, name='home'),
]