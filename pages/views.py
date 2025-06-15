# pages/views.py

from django.shortcuts import render
# Импортируем модель Property из приложения properties
from properties.models import Property

def home_view(request):
    # Получаем опубликованные новостройки, самые новые первыми
    new_developments = Property.objects.filter(property_type='new_development', is_published=True).order_by('-date_added')[:6]
    # Получаем опубликованное вторичное жилье, самое новое первыми
    resale_properties = Property.objects.filter(property_type='resale', is_published=True).order_by('-date_added')[:6]
    
    context = {
        'new_developments': new_developments,
        'resale_properties': resale_properties,
    }
    return render(request, 'pages/home.html', context)