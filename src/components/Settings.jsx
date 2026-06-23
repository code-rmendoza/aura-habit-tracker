import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { getDummyData } from '../utils/helpers';

const AVATARS = [
  'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', // Purple
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Amber
  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', // Red
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'  // Pink
];

export default function Settings({ profile, onUpdateProfile, onResetData, onImportData, habits, logs }) {
  const [name, setName] = useState(profile.name || 'Cultivador');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(profile.avatarIndex || 0);
  const [successMsg, setSuccessMsg] = useState('');
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && window.Notification ? window.Notification.permission : 'default';
  });

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) {
      alert('Las notificaciones no son compatibles con este navegador.');
      return;
    }
    try {
      const permission = await window.Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        triggerSuccess('¡Notificaciones activadas!');
        sendTestNotification();
      } else if (permission === 'denied') {
        alert('Permiso denegado. Para habilitarlas, por favor cambia los permisos en la barra de direcciones de tu navegador.');
      }
    } catch (err) {
      console.error('Error solicitando permisos', err);
    }
  };

  const sendTestNotification = () => {
    if (window.Notification && window.Notification.permission === 'granted') {
      try {
        new window.Notification('Aura — Recordatorio', {
          body: '¡Hola! Es hora de revisar tus hábitos de hoy y mantener tu racha activa. 🔥',
          icon: '/favicon.svg',
          tag: 'aura-reminder'
        });
      } catch (err) {
        // En algunos móviles el constructor clásico falla y requiere registrarla vía sw
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Aura — Recordatorio', {
              body: '¡Hola! Es hora de revisar tus hábitos de hoy y mantener tu racha activa. 🔥',
              icon: '/favicon.svg',
              tag: 'aura-reminder'
            });
          });
        }
      }
    } else {
      alert('Primero debes conceder permisos de notificación.');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Cultivador',
      avatarIndex: selectedAvatarIdx
    });
    triggerSuccess('Perfil guardado');
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Export state to JSON file
  const handleExportData = () => {
    const dataStr = JSON.stringify({ habits, logs, profile });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `aura_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    triggerSuccess('Datos exportados');
  };

  // Import state from JSON file
  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.habits && parsed.logs) {
          onImportData(parsed);
          triggerSuccess('Datos importados con éxito');
        } else {
          alert('El archivo no tiene el formato correcto');
        }
      } catch (err) {
        alert('Error al leer el archivo');
      }
    };
    fileReader.readAsText(file);
  };

  // Load sample dummy data
  const handleLoadDemo = () => {
    if (window.confirm('¿Quieres cargar datos de prueba? Esto reemplazará tus datos actuales.')) {
      const demo = getDummyData();
      onImportData({
        habits: demo.habits,
        logs: demo.logs,
        profile: { name: 'Cultivador Demo', avatarIndex: 0 }
      });
      triggerSuccess('Datos de demostración cargados');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar TODOS los datos? Esta acción es irreversible.')) {
      onResetData();
      triggerSuccess('Todos los datos han sido borrados');
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Ajustes</span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>Personalización</h1>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div 
          style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.15)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#10B981',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'scaleIn 0.2s ease'
          }}
        >
          <Icons.CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Profile Card Form */}
      <div 
        className="animate-scale"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '20px'
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Tu Perfil</h3>
        
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: AVATARS[selectedAvatarIdx],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#fff',
                fontWeight: 700,
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="user-name">Nombre de Usuario</label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color de Avatar</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {AVATARS.map((avatarGradient, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: avatarGradient,
                    border: selectedAvatarIdx === idx ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    transform: selectedAvatarIdx === idx ? 'scale(1.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedAvatarIdx(idx)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px', borderRadius: '10px', fontSize: '13px', marginTop: '6px' }}>
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* Backup and Data actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Datos e Integridad
        </h3>

        <div className="settings-list">
          
          <div className="settings-card" onClick={handleExportData}>
            <div className="settings-card-left">
              <div style={{ color: 'var(--accent-purple)' }}>
                <Icons.Download size={20} />
              </div>
              <div className="settings-card-text">
                <span className="title">Exportar Datos</span>
                <span className="desc">Descarga una copia de seguridad en JSON</span>
              </div>
            </div>
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <label className="settings-card" style={{ margin: 0, cursor: 'pointer' }}>
            <div className="settings-card-left">
              <div style={{ color: '#10B981' }}>
                <Icons.Upload size={20} />
              </div>
              <div className="settings-card-text">
                <span className="title">Importar Datos</span>
                <span className="desc">Restaura datos desde un archivo JSON</span>
              </div>
            </div>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportData} 
              style={{ display: 'none' }} 
            />
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </label>

          <div className="settings-card" onClick={handleLoadDemo}>
            <div className="settings-card-left">
              <div style={{ color: '#F59E0B' }}>
                <Icons.Sparkles size={20} />
              </div>
              <div className="settings-card-text">
                <span className="title">Cargar Demostración</span>
                <span className="desc">Llena el historial con datos aleatorios de prueba</span>
              </div>
            </div>
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div className="settings-card" onClick={handleClearAll} style={{ border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <div className="settings-card-left">
              <div style={{ color: '#EF4444' }}>
                <Icons.Trash2 size={20} />
              </div>
              <div className="settings-card-text">
                <span className="title" style={{ color: '#EF4444' }}>Borrar todos los datos</span>
                <span className="desc">Restablece la app por completo</span>
              </div>
            </div>
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </div>

        </div>
      </div>

      {/* Reminders / Notifications Card */}
      <div 
        className="animate-scale"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Bell size={18} color="var(--accent-purple)" />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Notificaciones de Recordatorio</h4>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Mantente al día con recordatorios para revisar tus hábitos y registrar tu consistencia.
        </p>
        <div style={{ marginTop: '4px' }}>
          {notifPermission !== 'granted' ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px' }}
              onClick={requestNotifPermission}
            >
              Habilitar Notificaciones
            </button>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icons.Check size={14} strokeWidth={3} /> Alertas Activadas
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', width: 'auto' }}
                onClick={sendTestNotification}
              >
                Probar Alerta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PWA / Android Installation Card */}
      <div 
        className="animate-scale"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Smartphone size={18} color="var(--accent-purple)" />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Instalación en Android (PWA)</h4>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Aura está configurada como una Aplicación Web Progresiva. Para llevarla en tu celular como una aplicación nativa:
        </p>
        <ol style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
          <li>Abre esta página en Chrome o Firefox en tu celular.</li>
          <li>Toca el menú de opciones (los tres puntos en la esquina superior derecha).</li>
          <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</li>
          <li>¡Listo! Aura se abrirá en pantalla completa sin barra de navegación.</li>
        </ol>
      </div>

      {/* App Version Info */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '10px' }}>
        <span>Aura v1.0.0 — Diseñado con amor y minimalismo</span>
      </div>

    </div>
  );
}
