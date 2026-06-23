import React from 'react';
import * as Icons from 'lucide-react';
import confetti from 'canvas-confetti';
import { getWeekDays, formatDateString, isHabitActiveOnDay } from '../utils/helpers';

export default function Dashboard({ 
  habits, 
  logs, 
  profile, 
  selectedDate, 
  onSelectDate, 
  onToggleHabit, 
  onOpenAddModal, 
  onOpenEditModal,
  onNavigateToSettings,
  theme,
  onToggleTheme
}) {
  const todayStr = formatDateString(new Date());
  const selectedDateStr = formatDateString(selectedDate);
  const weekDays = getWeekDays(selectedDate);

  // Filter habits that are active on selected date
  const activeHabits = habits.filter(h => isHabitActiveOnDay(h, selectedDate));
  
  // Calculate completed count for the active habits on selected date
  const completedHabits = activeHabits.filter(h => logs[selectedDateStr]?.[h.id]);
  const completionPercentage = activeHabits.length > 0 
    ? Math.round((completedHabits.length / activeHabits.length) * 100) 
    : 0;

  const handleToggle = (e, habit) => {
    e.stopPropagation(); // Avoid triggering card click edit modal
    
    const wasCompleted = logs[selectedDateStr]?.[habit.id];
    
    // Confetti effect if turning from false to true on today
    if (!wasCompleted && selectedDateStr === todayStr) {
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 },
        colors: [habit.color, '#8B5CF6', '#10B981'],
        disableForReducedMotion: true
      });
    }
    
    onToggleHabit(habit.id, selectedDateStr);
  };

  const getLucideIcon = (name, color = '#fff') => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent size={20} color={color} />;
  };

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Buenos días';
    if (hrs < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Slogan depending on completion
  const getProgressSlogan = () => {
    if (activeHabits.length === 0) return 'Crea tu primer hábito para empezar.';
    if (completionPercentage === 0) return 'Comienza tu día con un paso simple.';
    if (completionPercentage < 50) return 'Poco a poco. ¡Vas en camino!';
    if (completionPercentage < 100) return '¡Excelente progreso para hoy!';
    return '¡Día perfecto! Has completado todo.';
  };

  // Streak helper for quick display
  const getHabitStreak = (habitId) => {
    // We compute simple streak from logs
    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    let checkStr = formatDateString(checkDate);
    const completedToday = logs[checkStr]?.[habitId];
    
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateString(yesterday);
    const completedYesterday = logs[yesterdayStr]?.[habitId];

    if (!completedToday && !completedYesterday) {
      return 0;
    }

    let current = completedToday ? new Date(checkDate) : new Date(yesterday);
    let currentStr = formatDateString(current);

    while (logs[currentStr]?.[habitId]) {
      streak++;
      current.setDate(current.getDate() - 1);
      currentStr = formatDateString(current);
    }
    return streak;
  };

  // Circular progress SVG values
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="app-header">
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {getGreeting()}
          </span>
          <h1 style={{ marginTop: '2px' }}>{profile.name || 'Cultivador'}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button"
            onClick={onToggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              transition: 'background-color 0.2s ease'
            }}
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Icons.Moon size={18} /> : <Icons.Sun size={18} />}
          </button>
          
          <div className="user-avatar" onClick={onNavigateToSettings}>
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              (profile.name || 'C').charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="progress-card animate-scale">
        <div className="progress-info">
          <h3>Progreso Diario</h3>
          <p style={{ marginTop: '2px' }}>{getProgressSlogan()}</p>
          {activeHabits.length > 0 && (
            <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--accent-purple)', fontWeight: 600 }}>
              {completedHabits.length} de {activeHabits.length} completados
            </p>
          )}
        </div>
        <div className="progress-ring-container">
          <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke="var(--bg-tertiary)"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke="var(--accent-purple)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.35s ease' }}
            />
          </svg>
          <span className="progress-ring-text">{completionPercentage}%</span>
        </div>
      </div>

      {/* Weekly strip */}
      <div className="week-strip">
        {weekDays.map((day) => {
          const isActive = day.dateString === selectedDateStr;
          // Calculate if this day has logs
          const dayHabits = habits.filter(h => isHabitActiveOnDay(h, day.date));
          const dayCompleted = dayHabits.filter(h => logs[day.dateString]?.[h.id]);
          const isDone = dayHabits.length > 0 && dayCompleted.length === dayHabits.length;

          return (
            <button
              key={day.dateString}
              className={`week-day ${isActive ? 'active' : ''} ${day.isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDate(day.date)}
              style={isDone && !isActive ? { borderBottom: '2px solid var(--accent-emerald)' } : {}}
            >
              <span className="day-name">{day.dayName}</span>
              <span className="day-num">{day.dayNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Habits list */}
      <div className="habits-list">
        <div className="habits-header">
          <h2>Hábitos del Día ({activeHabits.length})</h2>
          <button className="add-habit-btn" onClick={onOpenAddModal}>
            <Icons.Plus size={14} />
            Añadir
          </button>
        </div>

        {activeHabits.length === 0 ? (
          <div className="empty-state animate-scale">
            <Icons.Calendar size={48} />
            <h3>No hay hábitos hoy</h3>
            <p>No tienes hábitos programados para este día. ¡Crea uno nuevo o relájate!</p>
            <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px' }} onClick={onOpenAddModal}>
              Añadir Hábito
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeHabits.map((habit) => {
              const isCompleted = !!logs[selectedDateStr]?.[habit.id];
              const streak = getHabitStreak(habit.id);
              
              return (
                <div 
                  key={habit.id} 
                  className={`habit-card animate-scale ${isCompleted ? 'completed' : ''}`}
                  onClick={() => onOpenEditModal(habit)}
                >
                  <div className="habit-card-left">
                    <div 
                      className="habit-icon-wrapper" 
                      style={{ 
                        backgroundColor: habit.color,
                        boxShadow: `0 4px 12px ${habit.color}33`
                      }}
                    >
                      {getLucideIcon(habit.icon)}
                    </div>
                    <div className="habit-details">
                      <span className="habit-name">{habit.name}</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="habit-category">{habit.category}</span>
                        {streak > 0 && (
                          <div className="habit-streak-badge">
                            <Icons.Flame />
                            <span>{streak} d</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className={`habit-checkbox ${isCompleted ? 'completed' : ''}`}
                    style={{ 
                      '--accent-color': habit.color,
                      '--glow-color': `${habit.color}4D`
                    }}
                    onClick={(e) => handleToggle(e, habit)}
                  >
                    <Icons.Check size={18} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
