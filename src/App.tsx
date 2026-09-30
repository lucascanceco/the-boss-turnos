import React, { useState } from 'react';
import bossLogo from './assets/images/the_boss_logo_1790681628960.png';
import heroImage from './assets/images/detailing_hero_1790681641667.jpg';
import { 
  Smartphone, 
  Code2, 
  Globe, 
  Wifi, 
  WifiOff, 
  Bell, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Car
} from 'lucide-react';
import { Turno, Solicitud, Cliente, Servicio, Actividad, FCMNotification, EstadoTurno, VehiclePricing } from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_CLIENTS, 
  INITIAL_TURNOS, 
  INITIAL_SOLICITUDES, 
  INITIAL_ACTIVITIES,
  DEFAULT_VEHICLE_PRICING
} from './data/mockData';
import { ANDROID_PROJECT_FILES } from './data/androidFilesData';
import { AndroidSimulator } from './components/AndroidSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { PublicBookingPortal } from './components/PublicBookingPortal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

// Official Detailing Assets generated
const BOSS_LOGO_URL = bossLogo;
const DETAILING_HERO_URL = heroImage;

export default function App() {
  const [currentUser, setCurrentUser] = useState<'Lucas' | 'Franco'>('Lucas');
  const [viewMode, setViewMode] = useState<'simulator' | 'code' | 'public_web'>('simulator');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  // Core Reactive Data Store (mirrors Room Database & Firebase RTDB)
  const [turnos, setTurnos] = useState<Turno[]>(INITIAL_TURNOS);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(INITIAL_SOLICITUDES);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTS);
  const [services, setServices] = useState<Servicio[]>(INITIAL_SERVICES);
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricing>(DEFAULT_VEHICLE_PRICING);
  const [actividades, setActividades] = useState<Actividad[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<FCMNotification[]>([
    {
      id: 'notif-init-1',
      sender: 'Franco',
      recipient: 'Lucas',
      title: 'Turno Confirmado',
      body: 'Franco confirmó el turno de Gonzalo Benítez (Toyota Hilux) para las 11:30 hs.',
      timestamp: Date.now() - 1000 * 60 * 15,
      read: false
    }
  ]);

  // Helper to trigger cross-user notification (Lucas -> Franco, Franco -> Lucas)
  const dispatchCrossUserNotification = (title: string, body: string) => {
    const recipient = currentUser === 'Lucas' ? 'Franco' : 'Lucas';
    const newNotif: FCMNotification = {
      id: `fcm-${Date.now()}`,
      sender: currentUser,
      recipient,
      title,
      body,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Helper to append audit activity log
  const logAudit = (accion: string) => {
    const act: Actividad = {
      id: `act-${Date.now()}`,
      usuario: currentUser,
      accion,
      timestamp: Date.now()
    };
    setActividades(prev => [act, ...prev]);
  };

  // Turno Collision Check: verify if another active turno exists at the same date and time
  const isTimeSlotColliding = (fecha: string, hora: string, excludeId?: string): boolean => {
    return turnos.some(
      t => t.id !== excludeId &&
           t.fecha === fecha.trim() &&
           t.hora === hora.trim() &&
           t.estado !== 'Cancelado'
    );
  };

  // Save/Create/Update Turno with validation
  const handleSaveTurno = (turno: Turno): { success: boolean; error?: string } => {
    if (isTimeSlotColliding(turno.fecha, turno.hora, turno.id)) {
      return {
        success: false,
        error: `⚠️ Horario bloqueado: ya existe una reserva activa para el ${turno.fecha} a las ${turno.hora} hs. Por favor selecciona otro horario para no superponer trabajos.`
      };
    }

    const isEditing = turnos.some(t => t.id === turno.id);
    if (isEditing) {
      setTurnos(prev => prev.map(t => (t.id === turno.id ? turno : t)));
      logAudit(`Actualizó el turno de ${turno.cliente} (${turno.vehiculo}) a estado '${turno.estado}'`);
      dispatchCrossUserNotification(
        `Turno Modificado: ${turno.cliente}`,
        `${currentUser} actualizó el turno de ${turno.cliente} (${turno.vehiculo}) para el ${turno.fecha} ${turno.hora}.`
      );
    } else {
      setTurnos(prev => [turno, ...prev]);
      logAudit(`Creó un nuevo turno para ${turno.cliente} (${turno.vehiculo})`);
      dispatchCrossUserNotification(
        `Nuevo Turno Agendado`,
        `${currentUser} agendó a ${turno.cliente} para ${turno.servicio} el ${turno.fecha} a las ${turno.hora} hs.`
      );
    }

    return { success: true };
  };

  // Update Turno status directly (e.g. En proceso, Finalizado)
  const handleUpdateTurnoEstado = (turnoId: string, nuevoEstado: EstadoTurno) => {
    const target = turnos.find(t => t.id === turnoId);
    if (!target) return;

    setTurnos(prev => prev.map(t => (t.id === turnoId ? { ...t, estado: nuevoEstado, updatedBy: currentUser } : t)));
    logAudit(`Cambió el estado a '${nuevoEstado}' para ${target.cliente} (${target.vehiculo})`);
    dispatchCrossUserNotification(
      `Estado: ${nuevoEstado}`,
      `${currentUser} marcó el auto de ${target.cliente} como '${nuevoEstado}'.`
    );
  };

  // Approve Solicitud: Promotes to Turno with collision check
  const handleAprobarSolicitud = (solicitud: Solicitud): { success: boolean; error?: string } => {
    if (isTimeSlotColliding(solicitud.fecha, solicitud.hora)) {
      return {
        success: false,
        error: `No se puede aprobar directamente: el horario ${solicitud.fecha} a las ${solicitud.hora} hs ya está ocupado por otro turno. Por favor utiliza la opción 'Reprogramar' para sugerir un horario libre al cliente.`
      };
    }

    // 1. Mark solicitud as approved
    setSolicitudes(prev => prev.map(s => (s.id === solicitud.id ? { ...s, estado: 'Aprobada' } : s)));

    // 2. Insert into Turnos
    const nuevoTurno: Turno = {
      id: `tur-appr-${Date.now()}`,
      cliente: solicitud.cliente,
      telefono: solicitud.telefono,
      vehiculo: solicitud.vehiculo,
      tipoVehiculo: solicitud.tipoVehiculo,
      precio: solicitud.precio,
      patente: solicitud.patente || 'S/P',
      servicio: solicitud.servicio,
      fecha: solicitud.fecha,
      hora: solicitud.hora,
      observaciones: solicitud.observaciones || 'Aprobado desde solicitud web.',
      estado: 'Confirmado',
      updatedBy: currentUser
    };
    setTurnos(prev => [nuevoTurno, ...prev]);

    logAudit(`Aprobó solicitud de ${solicitud.cliente} e incorporó el turno a la agenda`);
    dispatchCrossUserNotification(
      `Solicitud Aprobada`,
      `${currentUser} aprobó la solicitud de ${solicitud.cliente} para ${solicitud.servicio} (${solicitud.fecha} ${solicitud.hora}).`
    );

    return { success: true };
  };

  // Reject Solicitud
  const handleRechazarSolicitud = (solicitudId: string) => {
    const sol = solicitudes.find(s => s.id === solicitudId);
    if (!sol) return;

    setSolicitudes(prev => prev.map(s => (s.id === solicitudId ? { ...s, estado: 'Rechazada' } : s)));
    logAudit(`Rechazó la solicitud de ${sol.cliente}`);
    dispatchCrossUserNotification(
      `Solicitud Rechazada`,
      `${currentUser} rechazó la solicitud de ${sol.cliente}.`
    );
  };

  // Reschedule Solicitud
  const handleReprogramarSolicitud = (solicitudId: string, horarioSugerido: string) => {
    const sol = solicitudes.find(s => s.id === solicitudId);
    if (!sol) return;

    setSolicitudes(prev => prev.map(s => (s.id === solicitudId ? {
      ...s,
      estado: 'Reprogramada',
      sugerenciaHorario: horarioSugerido
    } : s)));

    logAudit(`Sugirió reprogramar turno a "${horarioSugerido}" para ${sol.cliente}`);
    dispatchCrossUserNotification(
      `Turno Reprogramado`,
      `${currentUser} sugirió nuevo horario ("${horarioSugerido}") para ${sol.cliente}.`
    );
  };

  // Submit from public booking portal
  const handlePublicSubmitSolicitud = (newSol: Omit<Solicitud, 'id' | 'estado' | 'createdAt'>) => {
    const collision = isTimeSlotColliding(newSol.fecha, newSol.hora);
    const created: Solicitud = {
      ...newSol,
      id: `sol-web-${Date.now()}`,
      estado: 'Pendiente',
      createdAt: Date.now()
    };
    setSolicitudes(prev => [created, ...prev]);

    // Dispatch FCM notification to whoever is NOT currently on screen
    const recipient = currentUser === 'Lucas' ? 'Franco' : 'Lucas';
    setNotifications(prev => [
      {
        id: `fcm-inbound-${Date.now()}`,
        sender: currentUser,
        recipient: currentUser, // Notify active operator immediately
        title: 'Nueva Solicitud Web Recibida',
        body: `${created.cliente} solicitó ${created.servicio} para el ${created.fecha} ${created.hora} hs.`,
        timestamp: Date.now(),
        read: false
      },
      ...prev
    ]);

    return { success: true, collisionWarning: collision };
  };

  // Admin Handler: Update Vehicle Washing Prices
  const handleUpdateVehiclePricing = (newPricing: VehiclePricing) => {
    setVehiclePricing(newPricing);
    logAudit(`Actualizó precios oficiales de lavado: Auto ($${newPricing.Auto.toLocaleString('es-AR')}), Suv ($${newPricing.Suv.toLocaleString('es-AR')}), Camioneta ($${newPricing.Camioneta.toLocaleString('es-AR')})`);
    dispatchCrossUserNotification(
      'Precios de Lavado Actualizados',
      `${currentUser} actualizó las tarifas oficiales: Auto $${newPricing.Auto.toLocaleString('es-AR')}, Suv $${newPricing.Suv.toLocaleString('es-AR')}, Camioneta $${newPricing.Camioneta.toLocaleString('es-AR')}`
    );
  };

  // Admin Handler: Update Individual Service Price
  const handleUpdateServicePrice = (serviceId: string, newPrice: number) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, precio: newPrice } : s));
    logAudit(`Modificó el precio de '${srv.nombre}' a $${newPrice.toLocaleString('es-AR')}`);
    dispatchCrossUserNotification(
      `Precio de ${srv.nombre} Modificado`,
      `${currentUser} fijó el precio de ${srv.nombre} en $${newPrice.toLocaleString('es-AR')}`
    );
  };

  const unreadCount = notifications.filter(n => n.recipient === currentUser && !n.read).length;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col selection:bg-[#F4B400] selection:text-black">
      {/* Top Application Bar (Universal Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-[#161616]/95 backdrop-blur-md border-b border-[#262626] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <img 
              src={bossLogo} 
              alt="THE BOSS Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-[#F4B400]/40 shadow-md"
            />
            <div>
              <div className="font-brand font-black text-lg sm:text-xl tracking-tight text-white leading-none">
                THE <span className="text-[#F4B400]">BOSS</span>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[#7B1FA2] uppercase mt-0.5">
                Lavado Premium & Detailing
              </div>
            </div>
          </div>

          {/* Nav / View Modes */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[#1E1E1E] p-1 rounded-xl border border-[#2e2e2e]">
            <button
              onClick={() => setViewMode('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'simulator'
                  ? 'bg-[#F4B400] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">App Móvil</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'code'
                  ? 'bg-[#7B1FA2] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Código Android (Kotlin)</span>
            </button>

            <button
              onClick={() => setViewMode('public_web')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'public_web'
                  ? 'bg-[#2A2A2A] text-white border border-[#444]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Solicitud Web</span>
            </button>
          </nav>

          {/* Action Zone: Operator Switcher, Sync status, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Operator Switcher (Lucas / Franco) */}
            <div className="flex items-center gap-1 bg-[#1C1C1C] border border-[#2a2a2a] p-1 rounded-xl">
              <span className="text-[11px] text-neutral-400 px-1.5 hidden md:inline">Operador:</span>
              <button
                onClick={() => setCurrentUser('Lucas')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentUser === 'Lucas'
                    ? 'bg-[#F4B400] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Lucas
              </button>
              <button
                onClick={() => setCurrentUser('Franco')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentUser === 'Franco'
                    ? 'bg-[#7B1FA2] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Franco
              </button>
            </div>

            {/* Offline/Online Room Database Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isOnline 
                  ? 'bg-[#00C853]/10 border-[#00C853]/40 text-[#00C853]' 
                  : 'bg-[#F4B400]/10 border-[#F4B400]/40 text-[#F4B400]'
              }`}
              title={isOnline ? 'Sincronizado con Firebase RTDB' : 'Modo Offline: Operando en Room Database'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Firebase RTDB</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Room (Offline)</span>
                </>
              )}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2a2a2a] rounded-xl text-neutral-300 transition-colors"
              title="Centro de Notificaciones Push FCM"
            >
              <Bell className="w-4 h-4 text-[#F4B400]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F4B400] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* VIEW 1: JETPACK COMPOSE LIVE SIMULATOR */}
        {viewMode === 'simulator' && (
          <div className="space-y-6">
            {/* Quick Helper Banner */}
            <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4B400]/20 flex items-center justify-center text-[#F4B400] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Simulador Nativo Jetpack Compose (Material 3)</h3>
                  <p className="text-xs text-neutral-400">
                    Estás operando como <strong>{currentUser}</strong>. Cualquier turno o aprobación enviará una notificación FCM a <strong>{currentUser === 'Lucas' ? 'Franco' : 'Lucas'}</strong> en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-[#222] border border-[#333] rounded-lg text-neutral-300">
                  Bloqueo de colisiones: <strong className="text-[#00C853]">Activo</strong>
                </span>
                <span className="px-2.5 py-1 bg-[#222] border border-[#333] rounded-lg text-neutral-300">
                  WhatsApp Directo: <strong className="text-[#00C853]">wa.me template</strong>
                </span>
              </div>
            </div>

            {/* Android Device Simulator Container */}
            <AndroidSimulator
              currentUser={currentUser}
              onSelectUser={setCurrentUser}
              turnos={turnos}
              solicitudes={solicitudes}
              clientes={clientes}
              services={services}
              vehiclePricing={vehiclePricing}
              onUpdateVehiclePricing={handleUpdateVehiclePricing}
              onUpdateServicePrice={handleUpdateServicePrice}
              actividades={actividades}
              notifications={notifications}
              isOnline={isOnline}
              onToggleOnline={() => setIsOnline(!isOnline)}
              onSaveTurno={handleSaveTurno}
              onUpdateTurnoEstado={handleUpdateTurnoEstado}
              onAprobarSolicitud={handleAprobarSolicitud}
              onRechazarSolicitud={handleRechazarSolicitud}
              onReprogramarSolicitud={handleReprogramarSolicitud}
              logoUrl={BOSS_LOGO_URL}
              heroBannerUrl={DETAILING_HERO_URL}
            />
          </div>
        )}

        {/* VIEW 2: KOTLIN NATIVE CODE EXPLORER */}
        {viewMode === 'code' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1A1A] p-4 rounded-xl border border-[#262626]">
              <div>
                <h2 className="text-base font-bold text-white font-brand">Estructura Completa para Android Studio</h2>
                <p className="text-xs text-neutral-400">
                  Archivos generados en <code className="text-[#F4B400] font-mono">/android/</code> con Room, Firebase Realtime Database, FCM, MVVM Clean Architecture y Jetpack Compose Material 3.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></span>
                <span>Listo para compilar en Android Studio</span>
              </div>
            </div>

            <CodeExplorer files={ANDROID_PROJECT_FILES} />
          </div>
        )}

        {/* VIEW 3: PUBLIC WEB BOOKING PORTAL */}
        {viewMode === 'public_web' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] border border-[#2a2a2a] p-4 rounded-xl flex items-center gap-3 text-xs text-neutral-300">
              <Info className="w-4 h-4 text-[#F4B400] shrink-0" />
              <div>
                Esta pantalla simula el enlace web / Instagram que los clientes usan para pedir turnos. Al enviar una solicitud aquí, ingresa automáticamente a la app nativa en la pestaña <strong>"Solicitudes"</strong> con tarifa automática según el tipo de vehículo y alerta FCM para Lucas y Franco.
              </div>
            </div>

            <PublicBookingPortal
              vehiclePricing={vehiclePricing}
              onSubmitSolicitud={handlePublicSubmitSolicitud}
            />
          </div>
        )}

      </main>

      {/* FCM Notifications Modal */}
      {showNotificationsModal && (
        <NotificationCenterModal
          notifications={notifications}
          currentUser={currentUser}
          onClose={() => setShowNotificationsModal(false)}
          onClear={() => setNotifications([])}
        />
      )}
    </div>
  );
}
