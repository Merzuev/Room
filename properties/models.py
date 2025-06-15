# properties/models.py

from django.db import models
from django.utils import timezone

class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('new_development', 'Новостройка'),
        ('resale', 'Вторичное жилье'),
    ]

    title = models.CharField(max_length=200, verbose_name="Название объекта")
    description = models.TextField(verbose_name="Описание объекта", blank=True, null=True)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, verbose_name="Тип недвижимости")

    # Основные данные
    address = models.CharField(max_length=255, verbose_name="Адрес")
    rooms = models.PositiveIntegerField(verbose_name="Количество комнат")
    area = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Общая площадь (м²)")
    price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Общая цена")
    price_per_sqm = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Цена за м²", blank=True, null=True)

    # Детали этажности
    floor = models.PositiveIntegerField(verbose_name="Этаж", blank=True, null=True)
    total_floors = models.PositiveIntegerField(verbose_name="Этажность дома", blank=True, null=True)

    # Для новостроек (может быть null/blank для вторички)
    developer = models.CharField(max_length=200, verbose_name="Застройщик", blank=True, null=True)
    completion_date = models.DateField(verbose_name="Срок сдачи", blank=True, null=True)

    # Дополнительные характеристики (boolean поля для удобства админки)
    year_built = models.PositiveIntegerField(verbose_name="Год постройки", blank=True, null=True)
    balcony = models.BooleanField(default=False, verbose_name="Балкон / Лоджия")
    parking = models.BooleanField(default=False, verbose_name="Парковка")
    elevator = models.BooleanField(default=False, verbose_name="Лифт")
    security = models.BooleanField(default=False, verbose_name="Охрана")
    playground = models.BooleanField(default=False, verbose_name="Детская площадка")
    school_nearby = models.BooleanField(default=False, verbose_name="Школа рядом")
    kindergarten_nearby = models.BooleanField(default=False, verbose_name="Детский сад рядом")
    metro_nearby = models.BooleanField(default=False, verbose_name="Метро рядом")
    bus_stop_nearby = models.BooleanField(default=False, verbose_name="Остановка транспорта рядом")

    # Удобства и особенности
    swimming_pool = models.BooleanField(default=False, verbose_name="Бассейн")
    gym = models.BooleanField(default=False, verbose_name="Тренажерный зал")
    furnished = models.BooleanField(default=False, verbose_name="Меблирована")
    renovation = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ремонт (например: дизайнерский, косметический)")
    
    # Инженерные системы
    heating_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="Тип отопления")
    sewage_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="Тип канализации")
    water_supply_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="Тип водоснабжения")
    gas_supply = models.BooleanField(default=False, verbose_name="Газоснабжение")

    # Условия сделки
    mortgage_possible = models.BooleanField(default=False, verbose_name="Возможна ипотека")
    maternity_capital = models.BooleanField(default=False, verbose_name="Материнский капитал")
    military_mortgage = models.BooleanField(default=False, verbose_name="Военная ипотека")

    main_photo = models.ImageField(upload_to='property_photos/', verbose_name="Главное фото")
    is_published = models.BooleanField(default=True, verbose_name="Опубликовано")
    date_added = models.DateTimeField(default=timezone.now, verbose_name="Дата добавления")
    
    def __str__(self):
        return f"{self.rooms}к. {self.title} ({self.address})"

    def save(self, *args, **kwargs):
        # Автоматический расчет цены за м², если есть цена и площадь
        if self.price and self.area:
            self.price_per_sqm = self.price / self.area
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Объект недвижимости"
        verbose_name_plural = "Объекты недвижимости"
        ordering = ['-date_added'] # Сортировка по умолчанию: новые сверху


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE, verbose_name="Объект недвижимости")
    image = models.ImageField(upload_to='property_photos/gallery/', verbose_name="Фотография")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Описание фото")

    def __str__(self):
        return f"Изображение для {self.property.title}"

    class Meta:
        verbose_name = "Фотография объекта"
        verbose_name_plural = "Фотографии объектов"