from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from habits.models import Habit, HabitLog


class UserDataIsolationTests(TestCase):
    def setUp(self):
        # Create User A (Alice)
        self.user_a = User.objects.create_user(username='alice', password='Password123!')
        self.client_a = APIClient()
        self.client_a.force_authenticate(user=self.user_a)

        # Create User B (Bob)
        self.user_b = User.objects.create_user(username='bob', password='Password123!')
        self.client_b = APIClient()
        self.client_b.force_authenticate(user=self.user_b)

        # Alice creates a habit
        self.habit_a = Habit.objects.create(
            owner=self.user_a,
            name='Alice Secret Habit',
            category='personal',
            frequency='daily'
        )
        self.log_a = HabitLog.objects.create(
            habit=self.habit_a,
            date='2026-08-18',
            is_done=True
        )

    def test_bob_cannot_list_alices_habits(self):
        response = self.client_b.get('/api/habits/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Bob has 0 habits
        self.assertEqual(len(response.data), 0)

    def test_bob_cannot_get_alices_habit_detail(self):
        response = self.client_b.get(f'/api/habits/{self.habit_a.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bob_cannot_modify_or_delete_alices_habit(self):
        # Update attempt
        patch_response = self.client_b.patch(
            f'/api/habits/{self.habit_a.id}/',
            {'name': 'Hacked Habit'},
            format='json'
        )
        self.assertEqual(patch_response.status_code, status.HTTP_404_NOT_FOUND)
        self.habit_a.refresh_from_db()
        self.assertEqual(self.habit_a.name, 'Alice Secret Habit')

        # Delete attempt
        delete_response = self.client_b.delete(f'/api/habits/{self.habit_a.id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Habit.objects.filter(id=self.habit_a.id).exists())

    def test_bob_cannot_view_or_create_logs_for_alices_habit(self):
        # List logs attempt
        list_response = self.client_b.get('/api/habit-logs/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 0)

        # Create log attempt for Alice's habit
        create_response = self.client_b.post('/api/habit-logs/', {
            'habit': self.habit_a.id,
            'date': '2026-08-19',
            'is_done': True
        }, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_404_NOT_FOUND)
