from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from habits.models import Habit, HabitLog


class HabitLogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='loguser', password='Password123!')
        self.client.force_authenticate(user=self.user)
        self.habit = Habit.objects.create(
            owner=self.user,
            name='Daily Walk',
            category='health',
            frequency='daily',
            target=5000,
            unit='steps'
        )
        self.logs_url = '/api/habit-logs/'

    def test_create_and_update_log_upsert(self):
        payload = {
            'habit': self.habit.id,
            'date': '2026-08-18',
            'is_done': False,
            'value': 3000
        }
        # First creation
        response = self.client.post(self.logs_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['value'], 3000)
        self.assertFalse(response.data['is_completed'])
        self.assertEqual(HabitLog.objects.count(), 1)

        # Upsert update for same date
        payload_update = {
            'habit': self.habit.id,
            'date': '2026-08-18',
            'is_done': True,
            'value': 6000
        }
        response_update = self.client.post(self.logs_url, payload_update, format='json')
        self.assertEqual(response_update.status_code, status.HTTP_200_OK)
        self.assertEqual(response_update.data['value'], 6000)
        self.assertTrue(response_update.data['is_completed'])
        # Database constraint ensures only 1 record exists for (habit, date)
        self.assertEqual(HabitLog.objects.filter(habit=self.habit, date='2026-08-18').count(), 1)
