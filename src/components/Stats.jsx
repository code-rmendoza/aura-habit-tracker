import React from 'react';
import * as Icons from 'lucide-react';
import { formatDateString, calculateStreak, isHabitActiveOnDay } from '../utils/helpers';

export default function Stats({ habits, logs }) {
  
  // 1. Calculate overall metrics
  const getOverallMetrics = () => {
    if (habits.length === 0) {
      return { completionRate: 0, currentStreakMax: 0, longestStreakMax: 0, totalCompletions: 0 };
    }

    let totalPossible = 0;
    let totalCompleted = 0;
    let totalCompletions = 0;

    // Check last 30 days
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateString(d);

      // Check which habits were active on day d
      habits.forEach(h => {
        const active = isHabitActiveOnDay(h, d);
        if (active) {
          totalPossible++;
          if (logs[dateStr]?.[h.id]) {
            totalCompleted++;
          }
        }
      });
    }

    // Count all completions historically
    Object.keys(logs).forEach(dateStr => {
      Object.keys(logs[dateStr]).forEach(hId => {
        if (logs[dateStr][hId]) {
          totalCompletions++;
        }
      });
    });

    // Calculate streaks for all habits
    let currentStreakMax = 0;
    let longestStreakMax = 0;

    habits.forEach(h => {
      const streakInfo = calculateStreak(h, logs);
      if (streakInfo.currentStreak > currentStreakMax) {
        currentStreakMax = streakInfo.currentStreak;
      }
      if (streakInfo.longestStreak > longestStreakMax) {
        longestStreakMax = streakInfo.longestStreak;
      }
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      completionRate,
      currentStreakMax,
      longestStreakMax,
      totalCompletions
    };
  };

  const metrics = getOverallMetrics();

  // 2. Generate Heatmap Grid for the last 28 days (4 weeks)
  const getHeatmapCells = () => {
    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Let's find the previous Monday 27 days ago to align nicely
    // Or just last 28 days including today
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateString(d);

      const activeHabitsOnDay = habits.filter(h => isHabitActiveOnDay(h, d));
      const completedOnDay = activeHabitsOnDay.filter(h => logs[dateStr]?.[h.id]);

      let ratio = 0;
      if (activeHabitsOnDay.length > 0) {
        ratio = completedOnDay.length / activeHabitsOnDay.length;
      }

      cells.push({
        date: d,
        dateStr,
        ratio,
        dayNumber: d.getDate(),
        activeCount: activeHabitsOnDay.length,
        completedCount: completedOnDay.length
      });
    }

    return cells;
  };

  const heatmapCells = getHeatmapCells();

  // Helper for cell coloring class
  const getCellClass = (cell) => {
    if (cell.activeCount === 0) return '';
    if (cell.completedCount === 0) return '';
    if (cell.ratio === 1) return 'completed-all';
    if (cell.ratio >= 0.5) return 'completed-many';
    return 'completed-some';
  };

  // 3. Individual Habit Stats
  const getHabitStats = (habit) => {
    const streakInfo = calculateStreak(habit, logs);
    
    // Calculate individual completion rate for last 30 days
    let activeDays = 0;
    let completedDays = 0;

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateString(d);

      if (isHabitActiveOnDay(habit, d)) {
        activeDays++;
        if (logs[dateStr]?.[habit.id]) {
          completedDays++;
        }
      }
    }

    const rate = activeDays > 0 ? Math.round((completedDays / activeDays) * 100) : 0;

    return {
      rate,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak
    };
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Estadísticas</span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>Tu Consistencia</h1>
      </div>

      {/* Grid of basic stats */}
      <div className="stats-summary">
        <div className="stat-box animate-scale">
          <div className="stat-box-icon" style={{ color: 'var(--accent-purple)' }}>
            <Icons.TrendingUp size={20} />
          </div>
          <div className="stat-box-data">
            <span className="val">{metrics.completionRate}%</span>
            <span className="lbl">Éxito (30d)</span>
          </div>
        </div>

        <div className="stat-box animate-scale">
          <div className="stat-box-icon" style={{ color: '#F59E0B' }}>
            <Icons.Flame size={20} />
          </div>
          <div className="stat-box-data">
            <span className="val">{metrics.currentStreakMax} d</span>
            <span className="lbl">Racha Actual</span>
          </div>
        </div>

        <div className="stat-box animate-scale">
          <div className="stat-box-icon" style={{ color: '#EF4444' }}>
            <Icons.Award size={20} />
          </div>
          <div className="stat-box-data">
            <span className="val">{metrics.longestStreakMax} d</span>
            <span className="lbl">Racha Máxima</span>
          </div>
        </div>

        <div className="stat-box animate-scale">
          <div className="stat-box-icon" style={{ color: '#10B981' }}>
            <Icons.CheckCircle size={20} />
          </div>
          <div className="stat-box-data">
            <span className="val">{metrics.totalCompletions}</span>
            <span className="lbl">Completados</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid (Last 28 Days) */}
      <div className="heatmap-container animate-scale">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Actividad (Últimos 28 días)</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Lun — Dom
          </span>
        </div>

        <div className="heatmap-grid">
          {heatmapCells.map((cell, idx) => {
            const cellClass = getCellClass(cell);
            return (
              <div 
                key={idx} 
                className={`heatmap-cell ${cellClass}`}
                title={`${cell.dateStr}: ${cell.completedCount}/${cell.activeCount} completados`}
              >
                <span className="num">{cell.dayNumber}</span>
              </div>
            );
          })}
        </div>

        <div className="heatmap-legend">
          <span>Menos activo</span>
          <div className="legend-colors">
            <div className="legend-box" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            <div className="legend-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.25)' }} />
            <div className="legend-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.55)' }} />
            <div className="legend-box" style={{ backgroundColor: 'var(--accent-purple)' }} />
          </div>
          <span>Más activo</span>
        </div>
      </div>

      {/* Individual Habits Performance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Rendimiento por Hábito
        </h3>

        {habits.length === 0 ? (
          <div className="empty-state">
            <p>Crea hábitos para visualizar su rendimiento individual.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habits.map(habit => {
              const stats = getHabitStats(habit);
              
              return (
                <div 
                  key={habit.id} 
                  className="animate-scale"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '4px', 
                          backgroundColor: habit.color 
                        }} 
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{habit.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: habit.color }}>
                      {stats.rate}%
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div 
                    style={{ 
                      height: '6px', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: '3px',
                      overflow: 'hidden' 
                    }}
                  >
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${stats.rate}%`, 
                        backgroundColor: habit.color,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease' 
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Frecuencia: {habit.frequency.type === 'daily' ? 'Diario' : `${habit.frequency.days.length} d/sem`}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span>Racha: <strong>{stats.currentStreak}d</strong></span>
                      <span>Máx: <strong>{stats.longestStreak}d</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
