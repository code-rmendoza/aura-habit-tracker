import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const CATEGORIES = ['Crecimiento', 'Salud', 'Mindfulness', 'Fitness', 'Finanzas', 'Trabajo'];

const COLORS = [
  '#8B5CF6', // Violeta
  '#3B82F6', // Azul
  '#10B981', // Esmeralda
  '#F59E0B', // Ámbar
  '#EF4444', // Rojo
  '#EC4899'  // Rosa
];

const ICON_NAMES = [
  'Brain', 'Droplet', 'BookOpen', 'Dumbbell', 
  'Sparkles', 'Heart', 'Coffee', 'TrendingUp', 
  'Target', 'Moon', 'Sun', 'Flame'
];

export default function HabitModal({ habit, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Salud');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_NAMES[0]);
  const [freqType, setFreqType] = useState('daily'); // daily or weekly
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Lun-Vie by default

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setCategory(habit.category || 'Salud');
      setSelectedColor(habit.color || COLORS[0]);
      setSelectedIcon(habit.icon || ICON_NAMES[0]);
      setFreqType(habit.frequency?.type || 'daily');
      setSelectedDays(habit.frequency?.days || [1, 2, 3, 4, 5]);
    }
  }, [habit]);

  const toggleDay = (dayNum) => {
    if (selectedDays.includes(dayNum)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayNum));
      }
    } else {
      setSelectedDays([...selectedDays, dayNum].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      id: habit ? habit.id : 'habit_' + Date.now(),
      name: name.trim(),
      category,
      color: selectedColor,
      icon: selectedIcon,
      frequency: {
        type: freqType,
        days: freqType === 'daily' ? [] : selectedDays
      },
      createdAt: habit ? habit.createdAt : new Date().toISOString().split('T')[0]
    };

    onSave(habitData);
  };

  const getLucideIcon = (name, color = '#fff') => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent size={20} color={color} />;
  };

  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // Sun (0), Mon (1)...

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{habit ? 'Editar Hábito' : 'Nuevo Hábito'}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icons.X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="habit-name">Nombre del Hábito</label>
            <input
              id="habit-name"
              type="text"
              className="form-input"
              placeholder="Ej. Meditar, Correr, Leer..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              maxLength={40}
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría</label>
            <div className="category-input">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-tag ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-group">
            <label>Color de Énfasis</label>
            <div className="palette-grid">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Icono */}
          <div className="form-group">
            <label>Icono</label>
            <div className="icons-grid">
              {ICON_NAMES.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  className={`icon-option ${selectedIcon === iconName ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(iconName)}
                >
                  {getLucideIcon(iconName, selectedIcon === iconName ? '#fff' : 'var(--text-secondary)')}
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div className="form-group">
            <label>Frecuencia</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${freqType === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                onClick={() => setFreqType('daily')}
              >
                Todos los días
              </button>
              <button
                type="button"
                className={`btn ${freqType === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                onClick={() => setFreqType('weekly')}
              >
                Días específicos
              </button>
            </div>

            {freqType === 'weekly' && (
              <div className="days-grid" style={{ marginTop: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                  const isSelected = selectedDays.includes(dayNum);
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      className={`day-select-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleDay(dayNum)}
                    >
                      {dayNames[dayNum]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="modal-actions">
            {habit && (
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: '0 0 auto', padding: '14px 16px' }}
                onClick={() => onDelete(habit.id)}
              >
                <Icons.Trash2 size={20} />
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim()}
            >
              {habit ? 'Guardar Cambios' : 'Crear Hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
