import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import Settings from './components/Settings';
import HabitModal from './components/HabitModal';
import { formatDateString } from './utils/helpers';

// Default onboarding habits
const DEFAULT_HABITS = [
  {
    id: 'h_def_1',
    name: 'Meditar 10 min',
    category: 'Mindfulness',
    color: '#8B5CF6',
    icon: 'Brain',
    frequency: { type: 'daily', days: [] },
    createdAt: formatDateString(new Date())
  },
  {
    id: 'h_def_2',
    name: 'Beber 2L de agua',
    category: 'Salud',
    color: '#3B82F6',
    icon: 'Droplet',
    frequency: { type: 'daily', days: [] },
    createdAt: formatDateString(new Date())
  }
];

const DEFAULT_PROFILE = {
  name: 'Cultivador',
  avatarIndex: 0
};

export default function App() {
  const [activeTab, setActiveTab] = useState('habits'); // 'habits' | 'stats' | 'settings'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Core App State (Loaded from LocalStorage or defaults)
  const [habits, setHabits] = useState(() => {
    const local = localStorage.getItem('aura_habits');
    return local ? JSON.parse(local) : DEFAULT_HABITS;
  });

  const [logs, setLogs] = useState(() => {
    const local = localStorage.getItem('aura_logs');
    return local ? JSON.parse(local) : {};
  });

  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('aura_profile');
    return local ? JSON.parse(local) : DEFAULT_PROFILE;
  });

  const [theme, setTheme] = useState(() => {
    const local = localStorage.getItem('aura_theme');
    return local || 'dark';
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('aura_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('aura_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('aura_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  // Actions
  const handleToggleHabit = (habitId, dateStr) => {
    setLogs(prevLogs => {
      const dayLogs = prevLogs[dateStr] ? { ...prevLogs[dateStr] } : {};
      
      if (dayLogs[habitId]) {
        delete dayLogs[habitId];
      } else {
        dayLogs[habitId] = true;
      }

      return {
        ...prevLogs,
        [dateStr]: dayLogs
      };
    });
  };

  const handleSaveHabit = (habitData) => {
    if (editingHabit) {
      // Update
      setHabits(prev => prev.map(h => h.id === habitData.id ? habitData : h));
      setEditingHabit(null);
    } else {
      // Create
      setHabits(prev => [...prev, habitData]);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteHabit = (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    
    // Optional: clean up logs for this habit
    setLogs(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(dateStr => {
        if (copy[dateStr][habitId]) {
          const dayCopy = { ...copy[dateStr] };
          delete dayCopy[habitId];
          copy[dateStr] = dayCopy;
        }
      });
      return copy;
    });

    setEditingHabit(null);
  };

  const handleUpdateProfile = (profileData) => {
    setProfile(prev => ({
      ...prev,
      ...profileData
    }));
  };

  const handleResetData = () => {
    setHabits([]);
    setLogs({});
    setProfile(DEFAULT_PROFILE);
    setActiveTab('habits');
  };

  const handleImportData = (parsedData) => {
    if (parsedData.habits) setHabits(parsedData.habits);
    if (parsedData.logs) setLogs(parsedData.logs);
    if (parsedData.profile) setProfile(parsedData.profile);
    setActiveTab('habits');
  };

  // Render navigation icon helper
  const getNavIcon = (tabName, iconComponent) => {
    const isActive = activeTab === tabName;
    return React.createElement(iconComponent, {
      size: 20,
      color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)'
    });
  };

  return (
    <div className={`app-shell ${theme === 'light' ? 'light-theme' : ''}`}>
      
      {/* Scrollable Main Area */}
      <div className="app-content">
        {activeTab === 'habits' && (
          <Dashboard
            habits={habits}
            logs={logs}
            profile={profile}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleHabit={handleToggleHabit}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenEditModal={(habit) => setEditingHabit(habit)}
            onNavigateToSettings={() => setActiveTab('settings')}
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
        )}
        
        {activeTab === 'stats' && (
          <Stats
            habits={habits}
            logs={logs}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onImportData={handleImportData}
            habits={habits}
            logs={logs}
          />
        )}
      </div>

      {/* Nav bar */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <Icons.CheckSquare size={20} />
          <span>Hábitos</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <Icons.BarChart2 size={20} />
          <span>Estadísticas</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Icons.Settings size={20} />
          <span>Ajustes</span>
        </button>
      </div>

      {/* Habit Add/Edit Modal */}
      {(isAddModalOpen || editingHabit) && (
        <HabitModal
          habit={editingHabit}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHabit(null);
          }}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
        />
      )}

    </div>
  );
}
