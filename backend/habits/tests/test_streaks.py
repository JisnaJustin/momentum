from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from habits.models import Habit, HabitLog
from habits.services import calculate_habit_streaks, get_dashboard_summary, get_weekly_tracker_matrix


class StreakCalculationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='streakuser', password='Password123!')
        self.today = date(2026, 8, 18) # Tuesday (weekday index 1)

    def test_daily_habit_streak(self):
        habit = Habit.objects.create(
            owner=self.user,
            name='Daily Reading',
            frequency='daily',
            start_date=date(2026, 8, 1)
        )
        # Log completed for yesterday (Aug 17) and day before yesterday (Aug 16)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 16), is_done=True)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 17), is_done=True)
        # Aug 18 not yet completed: streak should be 2 (preserved from yesterday)
        stats = calculate_habit_streaks(habit, as_of_date=self.today)
        self.assertEqual(stats['current_streak'], 2)
        self.assertEqual(stats['longest_streak'], 2)

        # Complete today (Aug 18): streak becomes 3
        HabitLog.objects.create(habit=habit, date=self.today, is_done=True)
        stats = calculate_habit_streaks(habit, as_of_date=self.today)
        self.assertEqual(stats['current_streak'], 3)
        self.assertEqual(stats['longest_streak'], 3)

    def test_selected_weekdays_habit_streak_ignores_nonscheduled_days(self):
        # Habit scheduled only on Mon (0), Wed (2), Fri (4)
        habit = Habit.objects.create(
            owner=self.user,
            name='Workout MWF',
            frequency='selected_days',
            selected_days=[0, 2, 4],
            start_date=date(2026, 8, 1)
        )
        # Aug 10 (Mon), Aug 12 (Wed), Aug 14 (Fri), Aug 17 (Mon)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 10), is_done=True)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 12), is_done=True)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 14), is_done=True)
        HabitLog.objects.create(habit=habit, date=date(2026, 8, 17), is_done=True)

        # Aug 18 (Tue) is a non-scheduled day! It should NOT break streak.
        stats = calculate_habit_streaks(habit, as_of_date=self.today)
        self.assertEqual(stats['current_streak'], 4)
        self.assertEqual(stats['longest_streak'], 4)

    def test_dashboard_and_weekly_tracker_services(self):
        habit = Habit.objects.create(
            owner=self.user,
            name='Water',
            frequency='daily',
            target=8,
            unit='glasses',
            start_date=date(2026, 8, 1)
        )
        HabitLog.objects.create(habit=habit, date=self.today, value=8)

        dashboard = get_dashboard_summary(self.user, as_of_date=self.today)
        self.assertEqual(dashboard['scheduled_count'], 1)
        self.assertEqual(dashboard['completed_count'], 1)
        self.assertEqual(dashboard['completion_percentage'], 100.0)

        # Weekly tracker matrix
        start_of_week = date(2026, 8, 17) # Monday
        matrix = get_weekly_tracker_matrix(self.user, start_of_week=start_of_week)
        self.assertEqual(len(matrix['habits']), 1)
        self.assertEqual(len(matrix['habits'][0]['days']), 7)
