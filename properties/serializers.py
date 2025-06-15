# properties/serializers.py

from rest_framework import serializers
from .models import Property, PropertyImage # Импорт из models.py того же приложения

class PropertyImageSerializer(serializers.ModelSerializer):
    # SerializerMethodField используется, чтобы получить полный URL изображения,
    # который может отличаться в зависимости от домена сервера.
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['image_url', 'description']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            # build_absolute_uri создает полный URL (например, http://localhost:8000/media/...)
            return request.build_absolute_uri(obj.image.url)
        return None

class PropertySerializer(serializers.ModelSerializer):
    # Добавляем наш PropertyImageSerializer, чтобы получить все изображения,
    # связанные с объектом недвижимости. `many=True` для списка изображений.
    images = PropertyImageSerializer(many=True, read_only=True)

    # Для `property_type` хотим получить читаемое значение, а не ключ
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)

    class Meta:
        model = Property
        fields = '__all__' # Включаем все поля из модели Property
        # Или можно явно перечислить нужные поля:
        # fields = [
        #     'id', 'title', 'description', 'property_type', 'property_type_display',
        #     'address', 'rooms', 'area', 'price', 'price_per_sqm',
        #     'floor', 'total_floors', 'developer', 'completion_date',
        #     'year_built', 'balcony', 'parking', 'elevator', 'security', 'playground',
        #     'school_nearby', 'kindergarten_nearby', 'metro_nearby', 'bus_stop_nearby',
        #     'swimming_pool', 'gym', 'furnished', 'renovation',
        #     'heating_type', 'sewage_type', 'water_supply_type', 'gas_supply',
        #     'mortgage_possible', 'maternity_capital', 'military_mortgage',
        #     'main_photo', 'is_published', 'date_added', 'images' # images - это related_name из PropertyImage
        # ]