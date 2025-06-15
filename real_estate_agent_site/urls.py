# real_estate_agent_site/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Импортируем DefaultRouter для автоматической генерации URL-ов для ViewSet
from rest_framework.routers import DefaultRouter

# Импортируем home_view из pages.views
from pages.views import home_view
# Импортируем PropertyViewSet из properties.views
from properties.views import PropertyViewSet

# Создаем роутер для DRF ViewSet
router = DefaultRouter()
# Регистрируем ViewSet для модели Property по URL-префиксу 'api/property'
router.register(r'api/property', PropertyViewSet, basename='property') # basename важен для reverse URL


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'), # Ваш основной URL для главной страницы

    # Включаем URL-ы, сгенерированные DRF роутером.
    # Они будут доступны по /api/property/ (список) и /api/property/<id>/ (детали)
    path('', include(router.urls)), 
    
    # Можно добавить для просмотра API в браузере (необязательно для продакшена)
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

# Обслуживание медиафайлов (фотографии) и статических файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)