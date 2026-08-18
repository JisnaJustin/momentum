from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Habit(models.Model):
    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('fitness', 'Fitness'),
        ('study', 'Study'),
        ('personal', 'Personal'),
        ('productivity', 'Productivity'),
        ('other', 'Other'),
    ]

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('selected_days', 'Selected Weekdays'),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='habits'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default='personal'
    )
    icon = models.CharField(max_length=50, default='sparkles')
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='daily'
    )
    # Stored as list of weekday indices: 0 = Mon, 1 = Tue, ..., 6 = Sun
    selected_days = models.JSONField(default=list, blank=True)
    target = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, default='')
    start_date = models.DateField(default=timezone.localdate)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

    @property
    def is_measurable(self):
        return bool(self.target and self.target > 0)

    def is_scheduled_for_date(self, target_date):
        """
        Returns True if this habit is scheduled on target_date.
        Respects start_date and frequency configuration.
        """
        if target_date < self.start_date:
            return False
        if self.frequency == 'daily':
            return True
        if self.frequency == 'selected_days':
            if not self.selected_days:
                return False
            # target_date.weekday() gives 0 for Monday, 6 for Sunday
            day_idx = target_date.weekday()
            # Handle both integer list and string representations if parsed
            return day_idx in self.selected_days or str(day_idx) in self.selected_days
        return True


class HabitLog(models.Model):
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    date = models.DateField()
    is_done = models.BooleanField(default=False)
    value = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['habit', 'date'],
                name='unique_habit_date_log'
            )
        ]
        ordering = ['-date']

    def __str__(self):
        return f"{self.habit.name} - {self.date}: done={self.is_done} val={self.value}"

    @property
    def is_completed(self):
        """
        For measurable habits: completed if value reaches target or is_done is True.
        For simple habits: completed if is_done is True.
        """
        if self.habit.is_measurable:
            if self.value is not None and self.value >= self.habit.target:
                return True
            return self.is_done
        return self.is_done
