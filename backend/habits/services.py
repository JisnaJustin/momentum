from datetime import date, timedelta
from django.utils import timezone
from .models import Habit, HabitLog


def calculate_habit_streaks(habit: Habit, as_of_date: date = None):
    """
    Calculates current streak and longest streak for a habit.
    
    Rules:
    - Only scheduled days count towards streaks.
    - Non-scheduled days do NOT break streaks.
    - Simple habits: completed if is_done is True.
    - Measurable habits: completed if (value >= target) or is_done is True.
    - If today is scheduled but not yet completed, the streak from yesterday is preserved.
    """
    if as_of_date is None:
        as_of_date = timezone.localdate()

    # Fetch all completed logs for this habit up to as_of_date
    logs = {
        log.date: log
        for log in habit.logs.filter(date__lte=as_of_date)
    }

    def is_day_completed(d: date) -> bool:
        log = logs.get(d)
        if not log:
            return False
        return log.is_completed

    start_date = habit.start_date
    if start_date > as_of_date:
        return {
            'current_streak': 0,
            'longest_streak': 0,
            'total_completed_days': 0,
            'completion_rate_30d': 0.0
        }

    # 1. Calculate Longest Streak & Total Completed Days from start_date to as_of_date
    total_completed_days = 0
    longest_streak = 0
    running_streak = 0
    
    curr = start_date
    while curr <= as_of_date:
        if habit.is_scheduled_for_date(curr):
            if is_day_completed(curr):
                running_streak += 1
                total_completed_days += 1
                if running_streak > longest_streak:
                    longest_streak = running_streak
            else:
                running_streak = 0
        curr += timedelta(days=1)

    # 2. Calculate Current Streak (looking backward from as_of_date)
    current_streak = 0
    check_date = as_of_date
    
    # Check today's status
    today_scheduled = habit.is_scheduled_for_date(as_of_date)
    today_completed = is_day_completed(as_of_date) if today_scheduled else False

    if today_scheduled and today_completed:
        current_streak += 1
        check_date = as_of_date - timedelta(days=1)
    elif today_scheduled and not today_completed:
        # Today is not completed yet, so check if streak was active as of yesterday
        check_date = as_of_date - timedelta(days=1)
    else:
        # Today is non-scheduled, check from yesterday
        check_date = as_of_date - timedelta(days=1)

    while check_date >= start_date:
        if habit.is_scheduled_for_date(check_date):
            if is_day_completed(check_date):
                current_streak += 1
            else:
                break
        check_date -= timedelta(days=1)

    # 3. Calculate 30-day completion rate
    thirty_days_ago = max(start_date, as_of_date - timedelta(days=29))
    scheduled_count_30d = 0
    completed_count_30d = 0
    curr = thirty_days_ago
    while curr <= as_of_date:
        if habit.is_scheduled_for_date(curr):
            scheduled_count_30d += 1
            if is_day_completed(curr):
                completed_count_30d += 1
        curr += timedelta(days=1)

    completion_rate_30d = round(
        (completed_count_30d / scheduled_count_30d * 100) if scheduled_count_30d > 0 else 0.0,
        1
    )

    return {
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'total_completed_days': total_completed_days,
        'completion_rate_30d': completion_rate_30d,
        'scheduled_count_30d': scheduled_count_30d,
        'completed_count_30d': completed_count_30d
    }


def get_dashboard_summary(user, as_of_date: date = None):
    """
    Returns aggregated summary for today's habits for the given user.
    """
    if as_of_date is None:
        as_of_date = timezone.localdate()

    habits = Habit.objects.filter(owner=user, is_active=True).prefetch_related('logs')
    
    total_active = habits.count()
    scheduled_today = []
    completed_today_count = 0
    
    for habit in habits:
        is_scheduled = habit.is_scheduled_for_date(as_of_date)
        # Find log for today
        log = habit.logs.filter(date=as_of_date).first()
        is_done = log.is_done if log else False
        val = log.value if log else None
        completed = log.is_completed if log else False
        
        streaks = calculate_habit_streaks(habit, as_of_date)

        habit_data = {
            'id': habit.id,
            'name': habit.name,
            'description': habit.description,
            'category': habit.category,
            'icon': habit.icon,
            'frequency': habit.frequency,
            'selected_days': habit.selected_days,
            'is_measurable': habit.is_measurable,
            'target': habit.target,
            'unit': habit.unit,
            'start_date': habit.start_date,
            'is_active': habit.is_active,
            'is_scheduled_today': is_scheduled,
            'today_log': {
                'id': log.id if log else None,
                'is_done': is_done,
                'value': val,
                'is_completed': completed
            } if log else {
                'id': None,
                'is_done': False,
                'value': None,
                'is_completed': False
            },
            'current_streak': streaks['current_streak'],
            'longest_streak': streaks['longest_streak']
        }

        if is_scheduled:
            scheduled_today.append(habit_data)
            if completed:
                completed_today_count += 1

    scheduled_count = len(scheduled_today)
    completion_percentage = round(
        (completed_today_count / scheduled_count * 100) if scheduled_count > 0 else 0,
        1
    )

    return {
        'date': as_of_date.isoformat(),
        'total_active_habits': total_active,
        'scheduled_count': scheduled_count,
        'completed_count': completed_today_count,
        'remaining_count': max(0, scheduled_count - completed_today_count),
        'completion_percentage': completion_percentage,
        'today_habits': scheduled_today
    }


def get_weekly_tracker_matrix(user, start_of_week: date = None):
    """
    Returns weekly tracking matrix (Monday to Sunday) for all active habits of a user.
    """
    if start_of_week is None:
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday()) # Monday

    week_dates = [start_of_week + timedelta(days=i) for i in range(7)]
    end_of_week = week_dates[-1]

    habits = Habit.objects.filter(owner=user, is_active=True).prefetch_related('logs')

    days_header = [
        {
            'date': d.isoformat(),
            'day_name': d.strftime('%a'),     # Mon, Tue, ...
            'day_number': d.day,
            'weekday_index': d.weekday(),      # 0 to 6
            'is_today': (d == timezone.localdate())
        }
        for d in week_dates
    ]

    habit_rows = []
    for habit in habits:
        # Get logs for this week
        week_logs = {
            log.date: log
            for log in habit.logs.filter(date__gte=start_of_week, date__lte=end_of_week)
        }

        cells = []
        for d in week_dates:
            is_scheduled = habit.is_scheduled_for_date(d)
            log = week_logs.get(d)
            
            cells.append({
                'date': d.isoformat(),
                'is_scheduled': is_scheduled,
                'log_id': log.id if log else None,
                'is_done': log.is_done if log else False,
                'value': log.value if log else None,
                'is_completed': log.is_completed if log else False
            })

        streaks = calculate_habit_streaks(habit)

        habit_rows.append({
            'id': habit.id,
            'name': habit.name,
            'category': habit.category,
            'icon': habit.icon,
            'frequency': habit.frequency,
            'selected_days': habit.selected_days,
            'is_measurable': habit.is_measurable,
            'target': habit.target,
            'unit': habit.unit,
            'current_streak': streaks['current_streak'],
            'days': cells
        })

    return {
        'start_date': start_of_week.isoformat(),
        'end_date': end_of_week.isoformat(),
        'days_header': days_header,
        'habits': habit_rows
    }
