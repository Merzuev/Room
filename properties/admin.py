# properties/admin.py

from django.contrib import admin
from django.contrib.auth.models import User, Group # <-- НОВАЯ СТРОКА: Импортируем User и Group
from .models import Property, PropertyImage # Импорт из models.py того же приложения

# --- Изменения заголовков админ-панели ---
# Эти строки меняют текст, который отображается в шапке браузера,
# в шапке самой админки и в заголовке главной страницы админки.
admin.site.site_header = "Панель Управления Недвижимостью" # Отображается в шапке браузера и на вкладке
admin.site.site_title = "Управление Объектами" # Заголовок для поисковых систем
admin.site.index_title = "Добро пожаловать, Управляющий!" # Заголовок на главной странице админки

# --- Скрытие стандартных моделей Django: Пользователи и Группы ---
# Это скрывает пункты "Пользователи" и "Группы" из меню админки.
# САМИ МОДЕЛИ И ФУНКЦИОНАЛ АУТЕНТИФИКАЦИИ ОСТАЮТСЯ РАБОЧИМИ!
# Это безопасно для текущего пользователя, который далек от технологий.
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass # Пропустить, если User не был зарегистрирован (например, если вы уже удалили его)
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass # Пропустить, если Group не был зарегистрирован


# Инлайн-класс для изображений, чтобы добавлять их прямо при редактировании Property
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1 # Количество пустых форм для добавления новых изображений по умолчанию
    fields = ['image', 'description'] # Поля, которые будут отображаться для каждого изображения
    # show_change_link = True # Если хотите, чтобы можно было редактировать изображение отдельно

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'property_type',
        'rooms',
        'area',
        'price',
        'floor',
        'is_published',
        'date_added'
    )
    list_display_links = ('id', 'title') # Делает эти поля кликабельными для перехода к деталям объекта
    list_filter = (
        'property_type',
        'is_published',
        'rooms',
        'floor',
        'balcony',
        'parking',
        'furnished',
        'mortgage_possible',
    )
    list_editable = ('is_published',) # Позволяет менять статус публикации прямо из списка
    search_fields = ('title', 'address', 'description') # Поля для поиска
    date_hierarchy = 'date_added' # Позволяет фильтровать по дате добавления
    ordering = ('-date_added',) # Сортировка по умолчанию: новые сверху

    inlines = [PropertyImageInline] # Добавляем инлайн-форму для изображений

    # Fieldsets для лучшей организации полей в админке
    # Изменены заголовки для большей понятности "не-технарю"
    fieldsets = (
        ('Основные данные объявления', { # Измененный заголовок
            'fields': (('title', 'property_type'), 'description', 'address', 'main_photo', 'is_published')
        }),
        ('Детализация по площади и стоимости', { # Измененный заголовок
            'fields': (('rooms', 'area'), ('price', 'price_per_sqm'), ('floor', 'total_floors'))
        }),
        ('Для новостроек (заполнять, если это первичное жилье)', { # Измененный заголовок
            'fields': ('developer', 'completion_date'),
            'classes': ('collapse',), # Скрывает блок по умолчанию
        }),
        ('Дополнительные удобства и инфраструктура', { # Измененный заголовок
            'fields': (
                'year_built', 'balcony', 'parking', 'elevator', 'security', 'playground',
                'school_nearby', 'kindergarten_nearby', 'metro_nearby', 'bus_stop_nearby',
                'swimming_pool', 'gym', 'furnished', 'renovation'
            ),
            'classes': ('collapse',),
        }),
        ('Коммуникации', { # Измененный заголовок
            'fields': ('heating_type', 'sewage_type', 'water_supply_type', 'gas_supply'),
            'classes': ('collapse',),
        }),
        ('Условия покупки', { # Измененный заголовок
            'fields': ('mortgage_possible', 'maternity_capital', 'military_mortgage'),
            'classes': ('collapse',),
        }),
    )

    # Метод, который делает поле 'price_per_sqm' read-only в админке,
    # так как оно рассчитывается автоматически
    readonly_fields = ('price_per_sqm',)

# --- Опционально: Если вы хотите, чтобы PropertyImage отображалась отдельно в админке ---
# (Обычно, если это инлайн, то отдельно не регистрируют, но оставляю для примера)
# @admin.register(PropertyImage)
# class PropertyImageAdmin(admin.ModelAdmin):
#     list_display = ('id', 'property', 'image', 'description')
#     list_filter = ('property',)
#     search_fields = ('description',)