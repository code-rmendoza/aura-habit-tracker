/**
 * Helpers for Aura Habit Tracker
 */

// Format Date as YYYY-MM-DD in local time
export const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get the 7 days of the current week surrounding the target date
export const getWeekDays = (targetDate) => {
  const current = new Date(targetDate);
  // Get Monday of the target week
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(current.setDate(diff));
  
  const days = [];
  const todayStr = formatDateString(new Date());
  
  const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    const dateStr = formatDateString(nextDay);
    days.push({
      date: nextDay,
      dayName: dayNames[nextDay.getDay()],
      dayNumber: nextDay.getDate(),
      dateString: dateStr,
      isToday: dateStr === todayStr
    });
  }
  
  return days;
};

// Check if a habit is active on a given day of the week (0 = Sun, 1 = Mon, etc.)
export const isHabitActiveOnDay = (habit, date) => {
  if (!habit.frequency || habit.frequency.type === 'daily') {
    return true;
  }
  const day = date.getDay();
  return habit.frequency.days.includes(day);
};

// Calculate streak for a specific habit
export const calculateStreak = (habit, logs) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Sort logs dates in ascending order
  const logDates = Object.keys(logs)
    .filter(dateStr => logs[dateStr]?.[habit.id])
    .map(dateStr => new Date(dateStr + 'T00:00:00'))
    .sort((a, b) => a - b);

  if (logDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak
  let prevDate = null;
  for (const logDate of logDates) {
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(logDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = logDate;
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // Calculate current streak (ending today or yesterday)
  const todayStr = formatDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateString(yesterday);

  const completedToday = logs[todayStr]?.[habit.id];
  const completedYesterday = logs[yesterdayStr]?.[habit.id];

  if (!completedToday && !completedYesterday) {
    currentStreak = 0;
  } else {
    // Start counting backwards from today or yesterday
    let checkDate = completedToday ? new Date(today) : new Date(yesterday);
    let checkStr = formatDateString(checkDate);
    
    while (logs[checkStr]?.[habit.id]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = formatDateString(checkDate);
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak)
  };
};

// Generate dummy data if the tracker is empty (to showcase beautiful UI to user)
export const getDummyData = () => {
  const habits = [
    {
      id: 'h1',
      name: 'Meditar 10 min',
      category: 'Mindfulness',
      color: '#A78BFA', // Purple
      icon: 'Brain',
      frequency: { type: 'daily', days: [] },
      createdAt: formatDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'h2',
      name: 'Beber 2L de agua',
      category: 'Salud',
      color: '#3B82F6', // Blue
      icon: 'Droplet',
      frequency: { type: 'daily', days: [] },
      createdAt: formatDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'h3',
      name: 'Leer un libro',
      category: 'Crecimiento',
      color: '#F59E0B', // Amber
      icon: 'BookOpen',
      frequency: { type: 'weekly', days: [1, 3, 5] }, // Lun, Mie, Vie
      createdAt: formatDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'h4',
      name: 'Hacer Ejercicio',
      category: 'Fitness',
      color: '#10B981', // Emerald
      icon: 'Dumbbell',
      frequency: { type: 'weekly', days: [2, 4, 6] }, // Mar, Jue, Sab
      createdAt: formatDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
    }
  ];

  const logs = {};
  const today = new Date();

  // Populate last 14 days with random completions
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateString(d);
    
    logs[dateStr] = {};
    
    // h1 completed 80% of times
    if (Math.random() < 0.8 || i === 0) {
      logs[dateStr]['h1'] = true;
    }
    // h2 completed 90% of times
    if (Math.random() < 0.9 || i === 0) {
      logs[dateStr]['h2'] = true;
    }
    // h3 (Mon, Wed, Fri)
    const day = d.getDay();
    if ([1, 3, 5].includes(day)) {
      if (Math.random() < 0.7 || i === 0) {
        logs[dateStr]['h3'] = true;
      }
    }
    // h4 (Tue, Thu, Sat)
    if ([2, 4, 6].includes(day)) {
      if (Math.random() < 0.75 || i === 0) {
        logs[dateStr]['h4'] = true;
      }
    }
  }

  return { habits, logs };
};
