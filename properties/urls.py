from django.urls import path
from . import views

urlpatterns = [
    path('api/property/<int:property_id>/', views.get_property_details, name='property_detail_api'),
]