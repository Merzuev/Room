# properties/views.py

from rest_framework import viewsets
from .models import Property # Импорт из models.py того же приложения
from .serializers import PropertySerializer # Импорт из serializers.py того же приложения
from rest_framework.response import Response

class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    # queryset определяет, какие объекты будут доступны через API.
    # Мы хотим только опубликованные объекты.
    queryset = Property.objects.filter(is_published=True)
    # serializer_class указывает, какой сериализатор использовать для преобразования данных модели в JSON.
    serializer_class = PropertySerializer
    # lookup_field указывает, по какому полю будут искаться отдельные объекты.
    # По умолчанию это 'pk' (первичный ключ), но явное указание 'id' тоже хорошо.
    lookup_field = 'id'

    # Переопределяем метод retrieve, чтобы добавить context={'request': request}
    # Это нужно для SerializerMethodField, чтобы get_image_url мог построить полный URL.
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    # Переопределяем метод list, чтобы добавить context={'request': request}
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)