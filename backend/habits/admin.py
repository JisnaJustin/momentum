from django.contrib import admin
from .models import Habit, HabitLog


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'category', 'frequency', 'target', 'unit', 'is_active', 'start_date', 'created_at')
    list_filter = ('category', 'frequency', 'is_active', 'start_date')
    search_fields = ('name', 'description', 'owner__username')
    ordering = ('-created_at',)


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ('habit', 'get_owner', 'date', 'is_done', 'value', 'created_at')
    list_filter = ('is_done', 'date', 'habit__category')
    search_fields = ('habit__name', 'habit__owner__username')
    ordering = ('-date',)

    def get_owner(self, obj):
        return obj.habit.owner.username
    get_owner.short_description = 'Owner'
