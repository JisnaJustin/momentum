from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from habits.models import Habit


class HabitTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='habituser', password='Password123!')
        self.client.force_authenticate(user=self.user)
        self.habits_url = '/api/habits/'

    def test_create_daily_simple_habit(self):
        payload = {
            'name': 'Morning Meditation',
            'description': '10 minutes of mindfulness',
            'category': 'personal',
            'icon': 'sparkles',
            'frequency': 'daily',
            'start_date': '2026-08-01'
        }
        response = self.client.post(self.habits_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Morning Meditation')
        self.assertEqual(response.data['frequency'], 'daily')
        self.assertFalse(response.data['is_measurable'])
        self.assertEqual(Habit.objects.filter(owner=self.user).count(), 1)

    def test_create_measurable_habit(self):
        payload = {
            'name': 'Drink Water',
            'category': 'health',
            'icon': 'droplets',
            'frequency': 'daily',
            'target': 8,
            'unit': 'glasses',
            'start_date': '2026-08-01'
        }
        response = self.client.post(self.habits_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_measurable'])
        self.assertEqual(response.data['target'], 8)
        self.assertEqual(response.data['unit'], 'glasses')

    def test_create_selected_weekdays_habit(self):
        payload = {
            'name': 'Gym Workout',
            'category': 'fitness',
            'icon': 'dumbbell',
            'frequency': 'selected_days',
            'selected_days': [0, 2, 4], # Mon, Wed, Fri
            'start_date': '2026-08-01'
        }
        response = self.client.post(self.habits_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['selected_days'], [0, 2, 4])

    def test_selected_weekdays_validation_requires_days(self):
        payload = {
            'name': 'Invalid Habit',
            'category': 'fitness',
            'frequency': 'selected_days',
            'selected_days': []
        }
        response = self.client.post(self.habits_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('selected_days', response.data)

    def test_toggle_active(self):
        habit = Habit.objects.create(
            owner=self.user,
            name='Reading',
            category='study',
            is_active=True
        )
        toggle_url = f'/api/habits/{habit.id}/toggle-active/'
        response = self.client.post(toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])
        habit.refresh_from_db()
        self.assertFalse(habit.is_active)
