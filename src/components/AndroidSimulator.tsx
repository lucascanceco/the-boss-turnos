import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Send, 
  Check, 
  X, 
  RotateCcw, 
  Car, 
  Phone, 
  User, 
  ShieldAlert, 
  Bell, 
  Wifi, 
  WifiOff, 
  BatteryMedium, 
  Sparkles, 
  ChevronRight, 
  BarChart2, 
  History, 
  Inbox, 
  Edit3, 
  Home, 
  Tag, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Turno, Solicitud, Cliente, Servicio, Actividad, FCMNotification, EstadoTurno, VehiclePricing, TipoVehiculo } from '../types';
import { CanvasBarChart } from './CanvasBarChart';

interface AndroidSimulatorProps {
  currentUser: 'Lucas' | 'Franco';
  onSelectUser: (user: 'Lucas' | 'Franco') => void;
  turnos: Turno[];
  solicitudes: Solicitud[];
  clientes: Cliente[];
  services: Servicio[];
  vehiclePricing: VehiclePricing;
  onUpdateVehiclePricing: (pricing: VehiclePricing) => void;
  onUpdateServicePrice?: (serviceId: string, newPrice: number) => void;
  actividades: Actividad[];
  notifications: FCMNotification[];
  isOnline: boolean;
  onToggleOnline: () => void;
  onSaveTurno: (turno: Turno) => { success: boolean; error?: string };
  onUpdateTurnoEstado: (turnoId: string, nuevoEstado: EstadoTurno) => void;
  onAprobarSolicitud: (solicitud: Solicitud) => { success: boolean; error?: string };
  onRechazarSolicitud: (solicitudId: string) => void;
  onReprogramarSolicitud: (solicitudId: string, horarioSugerido: string) => void;
  logoUrl?: string;
  heroBannerUrl?: string;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  currentUser,
  onSelectUser,
  turnos,
  solicitudes,
  clientes,
  services,
  vehiclePricing,
  onUpdateVehiclePricing,
  actividades,
  notifications,
  isOnline,
  onToggleOnline,
  onSaveTurno,
  onUpdateTurnoEstado,
  onAprobarSolicitud,
  onRechazarSolicitud,
  onReprogramarSolicitud,
  logoUrl,
  heroBannerUrl
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'turnos' | 'solicitudes' | 'catalogo' | 'metricas'>('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [turnoToEdit, setTurnoToEdit] = useState<Turno | null>(null);
  const [solicitudToReschedule, setSolicitudToReschedule] = useState<Solicitud | null>(null);
  const [selectedTurnoFilter, setSelectedTurnoFilter] = useState<string>('Todos');
  const [catalogoSubTab, setCatalogoSubTab] = useState<'servicios' | 'clientes'>('servicios');
  const [latestPushToast, setLatestPushToast] = useState<FCMNotification | null>(null);

  // Form State for Turno Modal
  const [formCliente, setFormCliente] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formVehiculo, setFormVehiculo] = useState('');
  const [formTipoVehiculo, setFormTipoVehiculo] = useState<TipoVehiculo>('Auto');
  const [formFecha, setFormFecha] = useState('2026-09-29');
  const [formHora, setFormHora] = useState('10:00');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [formEstado, setFormEstado] = useState<EstadoTurno>('Confirmado');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for Reprogramar Modal
  const [sugerenciaText, setSugerenciaText] = useState('Mismo día a las 17:30 hs');

  // Admin Price Editing Modal States
  const [showVehiclePricingModal, setShowVehiclePricingModal] = useState(false);
  const [tempAutoPrice, setTempAutoPrice] = useState(vehiclePricing.Auto);
  const [tempSuvPrice, setTempSuvPrice] = useState(vehiclePricing.Suv);
  const [tempCamionetaPrice, setTempCamionetaPrice] = useState(vehiclePricing.Camioneta);

  // Synchronize temp prices when vehiclePricing changes
  React.useEffect(() => {
    setTempAutoPrice(vehiclePricing.Auto);
    setTempSuvPrice(vehiclePricing.Suv);
    setTempCamionetaPrice(vehiclePricing.Camioneta);
  }, [vehiclePricing]);

  // Trigger push toast on new notifications
  React.useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only show if addressed to current user and recent
      if (latest.recipient === currentUser && Date.now() - latest.timestamp < 15000) {
        setLatestPushToast(latest);
        const timer = setTimeout(() => setLatestPushToast(null), 7000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, currentUser]);

  const openNewTurnoModal = () => {
    setTurnoToEdit(null);
    setFormCliente('');
    setFormTelefono('');
    setFormVehiculo('');
    setFormTipoVehiculo('Auto');
    setFormFecha('2026-09-29');
    setFormHora('15:00');
    setFormObservaciones('');
    setFormEstado('Confirmado');
    setFormError(null);
    setShowTurnoModal(true);
  };

  const openEditTurnoModal = (turno: Turno) => {
    setTurnoToEdit(turno);
    setFormCliente(turno.cliente);
    setFormTelefono(turno.telefono);
    setFormVehiculo(turno.vehiculo);
    setFormTipoVehiculo(turno.tipoVehiculo || 'Auto');
    setFormFecha(turno.fecha);
    setFormHora(turno.hora);
    setFormObservaciones(turno.observaciones);
    setFormEstado(turno.estado);
    setFormError(null);
    setShowTurnoModal(true);
  };

  const handleSaveTurnoForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.trim() || !formTelefono.trim() || !formVehiculo.trim()) {
      setFormError('Por favor completa nombre, teléfono y vehículo.');
      return;
    }

    const price = vehiclePricing[formTipoVehiculo];

    const payload: Turno = {
      id: turnoToEdit?.id || `tur-${Date.now()}`,
      cliente: formCliente.trim(),
      telefono: formTelefono.trim(),
      vehiculo: formVehiculo.trim(),
      tipoVehiculo: formTipoVehiculo,
      precio: price,
      servicio: `Lavado ${formTipoVehiculo}`,
      fecha: formFecha.trim(),
      hora: formHora.trim(),
      observaciones: formObservaciones.trim(),
      estado: formEstado,
      updatedBy: currentUser
    };

    const res = onSaveTurno(payload);
    if (!res.success) {
      setFormError(res.error || 'Error al guardar el turno');
    } else {
      setShowTurnoModal(false);
      setFormError(null);
    }
  };

  // WhatsApp intent dispatcher
  const handleOpenWhatsApp = (turno: Turno) => {
    const rawMessage = `Hola ${turno.cliente}. Tu turno en THE BOSS Lavado Premium fue confirmado para el día ${turno.fecha} a las ${turno.hora}. Servicio: ${turno.servicio}. Muchas gracias.`;
    const cleanPhone = turno.telefono.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
    window.open(url, '_blank');
  };

  // Calculate metrics
  const todayStr = '2026-09-29';
  const turnosHoy = turnos.filter(t => t.fecha === todayStr && t.estado !== 'Cancelado');
  const pendingRequests = solicitudes.filter(s => s.estado === 'Pendiente');
  const enProceso = turnos.filter(t => t.estado === 'En proceso');
  const finalizadosHoy = turnos.filter(t => t.estado === 'Finalizado' && t.fecha === todayStr);

  const filteredTurnos = selectedTurnoFilter === 'Todos'
    ? turnos
    : turnos.filter(t => t.estado === selectedTurnoFilter);

  return (
    <div className="flex justify-center items-center py-4 w-full">
      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[420px] h-[850px] bg-[#121212] rounded-[44px] border-[10px] border-[#222222] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(123,31,162,0.15)] flex flex-col overflow-hidden text-white font-sans ring-1 ring-white/10">
        
        {/* Android Status Bar & Punch hole */}
        <div className="relative z-30 pt-3 px-6 pb-2 flex justify-between items-center text-[12px] font-medium text-neutral-400 bg-[#121212] select-none">
          <span className="font-mono font-semibold text-white">09:41</span>
          
          {/* Camera Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-4 h-4 bg-black rounded-full border border-neutral-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#151520] rounded-full"></div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400">5G</span>
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-[#00C853]" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <BatteryMedium className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Top App Bar with Branding & Operator Badge */}
        <div className="px-4 py-2.5 bg-[#161616] border-b border-[#242424] flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="THE BOSS" 
                className="w-9 h-9 rounded-xl object-cover border border-[#F4B400]/40 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#F4B400] flex items-center justify-center font-brand font-black text-black text-xs">
                BOSS
              </div>
            )}
            <div>
              <div className="font-brand font-black text-sm tracking-wide text-white leading-none">
                THE <span className="text-[#F4B400]">BOSS</span>
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#7B1FA2] uppercase mt-0.5">
                Lavado Premium
              </div>
            </div>
          </div>

          {/* Operator Switcher Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1E1E1E] hover:bg-[#282828] border border-[#7B1FA2]/60 rounded-full text-xs transition-colors"
              title="Cambiar operador activo"
            >
              <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
              <span className="font-bold text-white text-[11px]">{currentUser}</span>
            </button>
          </div>
        </div>

        {/* Offline Room vs Online Firebase Indicator Bar */}
        {!isOnline && (
          <div className="bg-[#2A1800] border-b border-[#F4B400]/30 px-3 py-1 text-[11px] text-[#F4B400] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Modo Offline (Room Database Local)
            </span>
            <button 
              onClick={onToggleOnline}
              className="underline text-[10px] text-white hover:text-[#F4B400]"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* Real-time Heads-Up Android Push Notification Banner */}
        {latestPushToast && (
          <div 
            onClick={() => setLatestPushToast(null)}
            className="absolute top-12 left-3 right-3 z-50 bg-[#1E1E1E] border-2 border-[#7B1FA2] rounded-2xl p-3 shadow-2xl animate-in slide-in-from-top-4 duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#7B1FA2] flex items-center justify-center shrink-0 text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#F4B400] font-brand tracking-wide">
                    FCM PUSH · PARA {latestPushToast.recipient.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-neutral-500">ahora</span>
                </div>
                <div className="text-xs font-bold text-white truncate">{latestPushToast.title}</div>
                <div className="text-[11px] text-neutral-300 line-clamp-2 leading-tight mt-0.5">
                  {latestPushToast.body}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 pb-24">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Date & Subtitle */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-black font-brand text-white">Panel de Control</h1>
                  <p className="text-xs text-neutral-400 capitalize">Martes, 29 de Septiembre</p>
                </div>
                <span className="text-[11px] text-[#F4B400] font-bold">
                  {turnosHoy.length} turnos programados hoy
                </span>
              </div>

              {/* Detailing Hero Banner */}
              {heroBannerUrl && (
                <div className="relative h-28 rounded-2xl overflow-hidden border border-[#2a2a2a] group">
                  <img 
                    src={heroBannerUrl} 
                    alt="Detailing Studio" 
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] text-[#F4B400] font-bold uppercase tracking-wider">Taller Detailing & Acabados</span>
                    <span className="text-xs font-bold text-white">THE BOSS · Turnos & Sincronización en Vivo</span>
                  </div>
                </div>
              )}

              {/* 2x2 Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Metric 1: Turnos de hoy */}
                <div 
                  onClick={() => { setActiveTab('turnos'); setSelectedTurnoFilter('Todos'); }}
                  className="bg-[#1E1E1E] border border-[#2C2C2C] p-3 rounded-2xl hover:border-[#F4B400] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="text-[11px] font-medium">Turnos de hoy</span>
                    <Calendar className="w-3.5 h-3.5 text-[#F4B400]" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">{turnosHoy.length}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">En agenda diaria</div>
                </div>

                {/* Metric 2: Solicitudes pendientes */}
                <div 
                  onClick={() => setActiveTab('solicitudes')}
                  className="bg-[#1E1E1E] border border-[#2C2C2C] p-3 rounded-2xl hover:border-[#7B1FA2] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="text-[11px] font-medium">Solicitudes</span>
                    <Inbox className="w-3.5 h-3.5 text-[#BA68C8]" />
                  </div>
                  <div className="text-2xl font-black font-mono text-[#F4B400]">{pendingRequests.length}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Pendientes de web</div>
                </div>

                {/* Metric 3: En proceso */}
                <div 
                  onClick={() => { setActiveTab('turnos'); setSelectedTurnoFilter('En proceso'); }}
                  className="bg-[#1E1E1E] border border-[#2C2C2C] p-3 rounded-2xl hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="text-[11px] font-medium">En proceso</span>
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-blue-400">{enProceso.length}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">En boxes ahora</div>
                </div>

                {/* Metric 4: Finalizados */}
                <div 
                  onClick={() => { setActiveTab('turnos'); setSelectedTurnoFilter('Finalizado'); }}
                  className="bg-[#1E1E1E] border border-[#2C2C2C] p-3 rounded-2xl hover:border-green-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="text-[11px] font-medium">Finalizados</span>
                    <CheckCircle className="w-3.5 h-3.5 text-[#00C853]" />
                  </div>
                  <div className="text-2xl font-black font-mono text-[#00C853]">{finalizadosHoy.length}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Entregados hoy</div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Accesos Rápidos</div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={openNewTurnoModal}
                    className="p-2.5 bg-[#1E1E1E] border border-[#2c2c2c] hover:border-[#F4B400] rounded-xl flex flex-col items-center text-center gap-1 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F4B400]/20 flex items-center justify-center text-[#F4B400]">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Nuevo</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('solicitudes')}
                    className="p-2.5 bg-[#1E1E1E] border border-[#2c2c2c] hover:border-[#7B1FA2] rounded-xl flex flex-col items-center text-center gap-1 transition-colors relative"
                  >
                    {pendingRequests.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F4B400]"></span>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-[#7B1FA2]/20 flex items-center justify-center text-[#BA68C8]">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Solicitudes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('catalogo')}
                    className="p-2.5 bg-[#1E1E1E] border border-[#2c2c2c] hover:border-[#F4B400] rounded-xl flex flex-col items-center text-center gap-1 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F4B400]/20 flex items-center justify-center text-[#F4B400]">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Servicios</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('metricas')}
                    className="p-2.5 bg-[#1E1E1E] border border-[#2c2c2c] hover:border-[#7B1FA2] rounded-xl flex flex-col items-center text-center gap-1 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#7B1FA2]/20 flex items-center justify-center text-[#BA68C8]">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Métricas</span>
                  </button>
                </div>
              </div>

              {/* Today's Agenda Preview */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">Turnos de Hoy ({turnosHoy.length})</span>
                  <button 
                    onClick={() => { setActiveTab('turnos'); setSelectedTurnoFilter('Todos'); }}
                    className="text-[11px] text-[#F4B400] font-semibold hover:underline"
                  >
                    Ver agenda completa →
                  </button>
                </div>

                <div className="space-y-2">
                  {turnosHoy.length === 0 ? (
                    <div className="p-4 bg-[#1E1E1E] rounded-xl text-center text-xs text-neutral-400">
                      No hay turnos para hoy.
                    </div>
                  ) : (
                    turnosHoy.map(turno => (
                      <div 
                        key={turno.id}
                        className="p-3 bg-[#1E1E1E] border border-[#292929] rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-11 bg-[#F4B400]/15 border border-[#F4B400]/40 rounded-xl flex flex-col items-center justify-center text-[#F4B400] font-mono">
                            <span className="text-xs font-black">{turno.hora}</span>
                            <span className="text-[8px] uppercase">hs</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{turno.cliente}</div>
                            <div className="text-[11px] text-neutral-400">{turno.vehiculo} · {turno.patente}</div>
                            <div className="text-[11px] text-[#F4B400] font-medium">{turno.servicio}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          turno.estado === 'Confirmado' ? 'bg-[#7B1FA2]/30 text-[#BA68C8] border border-[#7B1FA2]/50' :
                          turno.estado === 'En proceso' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                          turno.estado === 'Finalizado' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {turno.estado}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTIÓN DE TURNOS */}
          {activeTab === 'turnos' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black font-brand text-white">Turnos</h1>
                  <p className="text-[11px] text-neutral-400">{filteredTurnos.length} reservas registradas</p>
                </div>
                <button
                  onClick={openNewTurnoModal}
                  className="px-3 py-1.5 bg-[#F4B400] text-black font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-[#ffc820] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Turno
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['Todos', 'Pendiente', 'Confirmado', 'En proceso', 'Finalizado', 'Cancelado'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedTurnoFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedTurnoFilter === st
                        ? 'bg-[#F4B400] text-black font-bold'
                        : 'bg-[#1E1E1E] text-neutral-400 hover:text-white border border-[#2a2a2a]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Turnos List */}
              <div className="space-y-2.5">
                {filteredTurnos.length === 0 ? (
                  <div className="p-8 bg-[#1E1E1E] rounded-2xl text-center text-xs text-neutral-400 border border-[#262626]">
                    No se encontraron turnos con el filtro "{selectedTurnoFilter}".
                  </div>
                ) : (
                  filteredTurnos.map(turno => (
                    <div 
                      key={turno.id}
                      className="p-3.5 bg-[#1E1E1E] border border-[#2a2a2a] rounded-2xl space-y-2 hover:border-[#383838] transition-colors"
                    >
                      {/* Header: Date, Time & Status */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#F4B400] bg-[#F4B400]/10 border border-[#F4B400]/30 px-2 py-0.5 rounded-lg">
                            {turno.fecha} · {turno.hora} hs
                          </span>
                        </div>

                        {/* State selector dropdown */}
                        <select
                          value={turno.estado}
                          onChange={(e) => onUpdateTurnoEstado(turno.id, e.target.value as EstadoTurno)}
                          className="bg-[#141414] text-xs font-semibold px-2 py-1 rounded-lg border border-[#333] focus:outline-none focus:border-[#F4B400]"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="En proceso">En proceso</option>
                          <option value="Finalizado">Finalizado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center justify-between">
                          <span>{turno.cliente}</span>
                          {turno.precio ? (
                            <span className="text-xs font-mono font-bold text-[#F4B400] bg-[#F4B400]/10 px-2 py-0.5 rounded-lg border border-[#F4B400]/20">
                              ${turno.precio.toLocaleString('es-AR')}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <Car className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{turno.vehiculo}</span>
                          {turno.tipoVehiculo && (
                            <span className="text-[10px] bg-[#7B1FA2]/30 text-[#BA68C8] px-1.5 py-0.2 rounded font-semibold border border-[#7B1FA2]/40">
                              {turno.tipoVehiculo}
                            </span>
                          )}
                          {turno.patente && (
                            <>
                              <span className="text-neutral-500">·</span>
                              <span className="font-mono text-neutral-300 font-semibold">{turno.patente}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs font-medium text-[#F4B400] mt-1">
                          Servicio: {turno.servicio}
                        </div>
                        {turno.observaciones && (
                          <div className="text-[11px] text-neutral-400 mt-1 italic">
                            "{turno.observaciones}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons: WhatsApp & Edit */}
                      <div className="pt-2 border-t border-[#262626] flex items-center gap-2">
                        <button
                          onClick={() => handleOpenWhatsApp(turno)}
                          className="flex-1 py-1.5 bg-[#00C853] hover:bg-[#00b34a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          title="Enviar mensaje estructurado de WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar por WhatsApp
                        </button>

                        <button
                          onClick={() => openEditTurnoModal(turno)}
                          className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-neutral-200 text-xs rounded-xl border border-[#333] flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GESTIÓN DE SOLICITUDES */}
          {activeTab === 'solicitudes' && (
            <div className="space-y-3">
              <div>
                <h1 className="text-xl font-black font-brand text-white">Solicitudes Web</h1>
                <p className="text-[11px] text-neutral-400">
                  {pendingRequests.length} solicitudes pendientes recibidas desde la web
                </p>
              </div>

              <div className="space-y-3">
                {solicitudes.length === 0 ? (
                  <div className="p-8 bg-[#1E1E1E] rounded-2xl text-center text-xs text-neutral-400 border border-[#262626]">
                    No hay solicitudes registradas. Puedes enviar una desde la pestaña "🌐 Solicitud Web".
                  </div>
                ) : (
                  solicitudes.map(sol => {
                    const isPending = sol.estado === 'Pendiente';
                    return (
                      <div 
                        key={sol.id}
                        className={`p-3.5 bg-[#1E1E1E] border rounded-2xl space-y-2.5 ${
                          isPending ? 'border-[#7B1FA2]' : 'border-[#262626]'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-[#F4B400] bg-[#F4B400]/10 px-2 py-0.5 rounded-lg border border-[#F4B400]/30">
                            {sol.fecha} · {sol.hora} hs
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sol.estado === 'Pendiente' ? 'bg-[#7B1FA2]/30 text-[#BA68C8] border border-[#7B1FA2]' :
                            sol.estado === 'Aprobada' ? 'bg-[#00C853]/20 text-[#00C853]' :
                            sol.estado === 'Reprogramada' ? 'bg-[#F4B400]/20 text-[#F4B400]' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {sol.estado}
                          </span>
                        </div>

                        {/* Info */}
                        <div>
                          <div className="text-sm font-bold text-white flex items-center justify-between">
                            <span>{sol.cliente}</span>
                            {sol.precio ? (
                              <span className="text-xs font-mono font-bold text-[#F4B400] bg-[#F4B400]/10 px-2 py-0.5 rounded-lg border border-[#F4B400]/20">
                                ${sol.precio.toLocaleString('es-AR')}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <Car className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{sol.vehiculo}</span>
                            {sol.tipoVehiculo && (
                              <span className="text-[10px] bg-[#7B1FA2]/30 text-[#BA68C8] px-1.5 py-0.2 rounded font-semibold border border-[#7B1FA2]/40">
                                {sol.tipoVehiculo}
                              </span>
                            )}
                            {sol.patente && (
                              <>
                                <span className="text-neutral-500">·</span>
                                <span className="font-mono text-neutral-300 font-semibold">{sol.patente}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-neutral-500" /> {sol.telefono}
                          </div>
                          <div className="text-xs text-[#F4B400] font-semibold mt-1">
                            {sol.servicio}
                          </div>
                          {sol.observaciones && (
                            <div className="text-[11px] text-neutral-400 mt-1 italic">
                              "{sol.observaciones}"
                            </div>
                          )}
                          {sol.estado === 'Reprogramada' && sol.sugerenciaHorario && (
                            <div className="mt-1.5 p-2 bg-[#7B1FA2]/20 border border-[#7B1FA2]/40 rounded-lg text-[11px] text-[#BA68C8]">
                              <strong>Sugerencia enviada:</strong> {sol.sugerenciaHorario}
                            </div>
                          )}
                        </div>

                        {/* Actions for Pending Requests */}
                        {isPending && (
                          <div className="pt-2 border-t border-[#262626] flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const res = onAprobarSolicitud(sol);
                                if (!res.success && res.error) {
                                  alert(res.error);
                                }
                              }}
                              className="flex-1 py-1.5 bg-[#F4B400] hover:bg-[#ffc820] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Aprobar
                            </button>

                            <button
                              onClick={() => setSolicitudToReschedule(sol)}
                              className="px-2.5 py-1.5 bg-[#1E1E1E] hover:bg-[#252525] border border-[#7B1FA2] text-[#BA68C8] text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                            >
                              <Clock className="w-3 h-3" /> Reprogramar
                            </button>

                            <button
                              onClick={() => onRechazarSolicitud(sol.id)}
                              className="px-2.5 py-1.5 bg-[#1E1E1E] hover:bg-[#252525] border border-red-900/60 text-red-400 text-xs font-semibold rounded-xl transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CATÁLOGO Y CLIENTES */}
          {activeTab === 'catalogo' && (
            <div className="space-y-3">
              <h1 className="text-xl font-black font-brand text-white">Catálogo & Clientes</h1>

              {/* Subtabs */}
              <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-[#2a2a2a]">
                <button
                  onClick={() => setCatalogoSubTab('servicios')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    catalogoSubTab === 'servicios'
                      ? 'bg-[#F4B400] text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tarifas de Lavado (3)
                </button>
                <button
                  onClick={() => setCatalogoSubTab('clientes')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    catalogoSubTab === 'clientes'
                      ? 'bg-[#7B1FA2] text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Clientes ({clientes.length})
                </button>
              </div>

              {catalogoSubTab === 'servicios' ? (
                <div className="space-y-3">
                  {/* Tarifa Oficial por Categoría de Vehículo (Auto, Suv, Camioneta) */}
                  <div className="p-3.5 bg-gradient-to-br from-[#1C1C1C] via-[#1E1E1E] to-[#251b2e] border-2 border-[#F4B400]/50 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#F4B400]/20 flex items-center justify-center text-[#F4B400]">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">Precios Oficiales de Lavados</div>
                          <div className="text-[10px] text-neutral-400">Tarifas base aplicadas en Solicitudes Web</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowVehiclePricingModal(true)}
                        className="px-2.5 py-1 bg-[#F4B400] hover:bg-[#ffc820] text-black font-black text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        title="Modificar tarifas como Administrador"
                      >
                        <Edit3 className="w-3 h-3" /> Modificar
                      </button>
                    </div>

                    {/* Precios Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 bg-[#121212] border border-[#2a2a2a] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-neutral-400 block">Auto</span>
                        <span className="text-xs font-black font-mono text-[#F4B400] block mt-0.5">
                          ${vehiclePricing.Auto.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="p-2 bg-[#121212] border border-[#2a2a2a] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-neutral-400 block">Suv</span>
                        <span className="text-xs font-black font-mono text-[#F4B400] block mt-0.5">
                          ${vehiclePricing.Suv.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="p-2 bg-[#121212] border border-[#2a2a2a] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-neutral-400 block">Camioneta</span>
                        <span className="text-xs font-black font-mono text-[#F4B400] block mt-0.5">
                          ${vehiclePricing.Camioneta.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informative banner on washing rates */}
                  <div className="p-3 bg-[#1A1A1A] border border-[#262626] rounded-2xl text-[11px] text-neutral-400 space-y-1">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4B400]" /> Tarificación Única Estandarizada
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      El sistema opera exclusivamente con precios fijados por categoría de vehículo. Toda reserva nueva (creada desde la app o ingresada vía portal web) aplica automáticamente la tarifa correspondiente al tipo de vehículo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientes.map(cli => (
                    <div 
                      key={cli.id}
                      className="p-3.5 bg-[#1E1E1E] border border-[#2a2a2a] rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7B1FA2]/20 border border-[#7B1FA2]/40 flex items-center justify-center text-[#BA68C8] font-black text-sm">
                          {cli.nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{cli.nombre}</div>
                          <div className="text-[11px] text-neutral-400">{cli.vehiculo} · {cli.patente}</div>
                          <div className="text-[10px] text-neutral-500">Última visita: {cli.ultimaVisita}</div>
                        </div>
                      </div>

                      <div className="text-center bg-[#161616] border border-[#F4B400]/40 px-2.5 py-1 rounded-xl">
                        <div className="text-xs font-black text-[#F4B400] font-mono">{cli.visitasCount}</div>
                        <div className="text-[9px] text-neutral-400 uppercase">visitas</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ESTADÍSTICAS Y CENTRO DE ACTIVIDAD */}
          {activeTab === 'metricas' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-black font-brand text-white">Estadísticas & Auditoría</h1>
                <p className="text-[11px] text-neutral-400">Rendimiento mensual y logs de operadores</p>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#1E1E1E] border border-[#F4B400]/30 rounded-2xl">
                  <div className="text-[10px] text-neutral-400">Facturación Estimada</div>
                  <div className="text-lg font-black font-mono text-[#F4B400] mt-0.5">$ 2.450.000</div>
                  <div className="text-[9px] text-[#00C853] font-semibold">+18% este mes</div>
                </div>

                <div className="p-3 bg-[#1E1E1E] border border-[#7B1FA2]/30 rounded-2xl">
                  <div className="text-[10px] text-neutral-400">Vehículos en Septiembre</div>
                  <div className="text-lg font-black font-mono text-white mt-0.5">95 autos</div>
                  <div className="text-[9px] text-[#BA68C8] font-semibold">Promedio: 3.2 / día</div>
                </div>
              </div>

              {/* Native Compose Canvas Chart in Web */}
              <div className="p-3.5 bg-[#1E1E1E] border border-[#2a2a2a] rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">Vehículos por Mes (Canvas Nativo)</span>
                  <span className="text-[10px] font-mono text-[#F4B400]">THE BOSS 2026</span>
                </div>
                <div className="text-[10px] text-neutral-500 mb-2">Renderizado con Jetpack Compose Canvas</div>

                <CanvasBarChart 
                  data={[
                    { label: 'May', value: 42 },
                    { label: 'Jun', value: 56 },
                    { label: 'Jul', value: 68 },
                    { label: 'Ago', value: 84 },
                    { label: 'Sep', value: 95 },
                  ]}
                  height={150}
                />
              </div>

              {/* Real-time Activity Center Log */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
                  <History className="w-3.5 h-3.5 text-[#F4B400]" />
                  <span>Centro de Actividad en Tiempo Real</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {actividades.map(act => (
                    <div 
                      key={act.id}
                      className="p-2.5 bg-[#161616] border border-[#262626] rounded-xl flex items-start gap-2.5 text-xs"
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        act.usuario === 'Lucas' 
                          ? 'bg-[#F4B400]/20 text-[#F4B400]' 
                          : 'bg-[#7B1FA2]/20 text-[#BA68C8]'
                      }`}>
                        {act.usuario.charAt(0)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[11px] leading-tight">{act.accion}</div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">
                          Por <strong>{act.usuario}</strong> · {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Floating Action Button (FAB) for Turnos/Dashboard */}
        {(activeTab === 'dashboard' || activeTab === 'turnos') && (
          <button
            onClick={openNewTurnoModal}
            className="absolute right-5 bottom-20 z-30 w-13 h-13 rounded-2xl bg-[#F4B400] text-black shadow-lg shadow-[#F4B400]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Crear Nuevo Turno"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Android Material 3 Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#161616] border-t border-[#262626] px-2 flex justify-around items-center z-30">
          {[
            { id: 'dashboard', label: 'Inicio', icon: Home },
            { id: 'turnos', label: 'Turnos', icon: Calendar },
            { id: 'solicitudes', label: 'Solicitudes', icon: Inbox, badge: pendingRequests.length },
            { id: 'catalogo', label: 'Catálogo', icon: Tag },
            { id: 'metricas', label: 'Métricas', icon: BarChart2 },
          ].map(tab => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative flex flex-col items-center justify-center w-14 py-1 group"
              >
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-[#F4B400] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
                <div className={`p-1 rounded-full transition-colors ${
                  isSelected ? 'text-[#F4B400]' : 'text-neutral-400 group-hover:text-neutral-200'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium leading-none mt-0.5 ${
                  isSelected ? 'text-[#F4B400] font-bold' : 'text-neutral-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* MODAL: INITIAL USER SELECTION DIALOG (Lucas / Franco) */}
        {showUserModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full bg-[#1E1E1E] border-2 border-[#F4B400] rounded-3xl p-6 text-center shadow-2xl space-y-4">
              <div className="w-14 h-14 bg-[#F4B400]/20 border border-[#F4B400] rounded-2xl flex items-center justify-center mx-auto text-[#F4B400]">
                <User className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black font-brand text-white">¿Quién está utilizando este dispositivo?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Configuración inicial de operador para Room Database y notificaciones cruzadas FCM.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => { onSelectUser('Lucas'); setShowUserModal(false); }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    currentUser === 'Lucas' 
                      ? 'bg-[#F4B400] text-black border-[#F4B400] font-black' 
                      : 'bg-[#161616] text-white border-[#333] hover:border-[#F4B400]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">Lucas</div>
                    <div className="text-[11px] opacity-80">Administrador & Detailing</div>
                  </div>
                  <span className="text-xs font-bold">Seleccionar →</span>
                </button>

                <button
                  onClick={() => { onSelectUser('Franco'); setShowUserModal(false); }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    currentUser === 'Franco' 
                      ? 'bg-[#7B1FA2] text-white border-[#7B1FA2] font-black' 
                      : 'bg-[#161616] text-white border-[#333] hover:border-[#7B1FA2]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">Franco</div>
                    <div className="text-[11px] opacity-80">Administrador & Detailing</div>
                  </div>
                  <span className="text-xs font-bold">Seleccionar →</span>
                </button>
              </div>

              <button
                onClick={() => setShowUserModal(false)}
                className="text-xs text-neutral-400 hover:text-white pt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* MODAL: FORMULARIO CREAR / EDITAR TURNO (CON DETECCIÓN DE COLISIÓN) */}
        {showTurnoModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3">
            <div className="w-full max-h-[90%] overflow-y-auto bg-[#1A1A1A] border-2 border-[#F4B400] rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-[#282828] pb-2">
                <h3 className="text-base font-bold text-white">
                  {turnoToEdit ? 'Editar Turno' : 'Nuevo Turno de Detailing'}
                </h3>
                <button onClick={() => setShowTurnoModal(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Collision Alert Banner */}
              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl flex items-start gap-2 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleSaveTurnoForm} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    value={formCliente}
                    onChange={e => setFormCliente(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Teléfono (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formTelefono}
                    onChange={e => setFormTelefono(e.target.value)}
                    placeholder="+54 9 11 ..."
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                  />
                </div>

                {/* Modelo y Desplegable Tipo de Vehículo */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Modelo de Vehículo *</label>
                    <input
                      type="text"
                      required
                      value={formVehiculo}
                      onChange={e => setFormVehiculo(e.target.value)}
                      placeholder="Ej. Toyota Hilux / Golf"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#F4B400]" /> Tipo de Vehículo *
                    </label>
                    <select
                      value={formTipoVehiculo}
                      onChange={e => setFormTipoVehiculo(e.target.value as TipoVehiculo)}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#F4B400] cursor-pointer"
                    >
                      <option value="Auto">Auto - ${vehiclePricing.Auto.toLocaleString('es-AR')}</option>
                      <option value="Suv">Suv - ${vehiclePricing.Suv.toLocaleString('es-AR')}</option>
                      <option value="Camioneta">Camioneta - ${vehiclePricing.Camioneta.toLocaleString('es-AR')}</option>
                    </select>
                  </div>
                </div>

                {/* Price preview banner for the Turno */}
                <div className="p-2.5 bg-gradient-to-r from-[#141414] to-[#201826] border border-[#F4B400]/40 rounded-xl flex items-center justify-between">
                  <div className="text-[11px] text-neutral-300">
                    Tarifa de lavado para <strong className="text-white">{formTipoVehiculo}</strong>:
                  </div>
                  <div className="text-sm font-black font-mono text-[#F4B400]">
                    ${vehiclePricing[formTipoVehiculo].toLocaleString('es-AR')}
                  </div>
                </div>

                {/* Date & Time with Collision notice */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={formFecha}
                      onChange={e => setFormFecha(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Hora</label>
                    <select
                      value={formHora}
                      onChange={e => setFormHora(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                    >
                      {['09:00', '10:00', '11:30', '14:00', '15:30', '16:30', '18:00'].map(h => (
                        <option key={h} value={h}>{h} hs</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Estado</label>
                  <select
                    value={formEstado}
                    onChange={e => setFormEstado(e.target.value as EstadoTurno)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Observaciones</label>
                  <textarea
                    rows={2}
                    value={formObservaciones}
                    onChange={e => setFormObservaciones(e.target.value)}
                    placeholder="Detalles específicos..."
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F4B400]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTurnoModal(false)}
                    className="px-4 py-2 bg-[#252525] text-neutral-300 font-medium rounded-xl hover:bg-[#303030]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F4B400] text-black font-bold rounded-xl hover:bg-[#ffc820]"
                  >
                    Guardar Turno
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REPROGRAMAR SOLICITUD */}
        {solicitudToReschedule && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full bg-[#1E1E1E] border-2 border-[#7B1FA2] rounded-3xl p-5 shadow-2xl space-y-3">
              <h3 className="text-base font-bold text-white">Sugerir Horario Alternativo</h3>
              <p className="text-xs text-neutral-400">
                Cliente: <strong>{solicitudToReschedule.cliente}</strong> solicitó {solicitudToReschedule.fecha} a las {solicitudToReschedule.hora} hs.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nuevo Horario o Sugerencia
                </label>
                <input
                  type="text"
                  value={sugerenciaText}
                  onChange={e => setSugerenciaText(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7B1FA2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSolicitudToReschedule(null)}
                  className="px-3 py-1.5 bg-[#252525] text-neutral-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onReprogramarSolicitud(solicitudToReschedule.id, sugerenciaText);
                    setSolicitudToReschedule(null);
                  }}
                  className="px-4 py-1.5 bg-[#7B1FA2] hover:bg-[#9c27b0] text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Enviar Sugerencia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADMINISTRADOR - EDITAR PRECIOS POR TIPO DE VEHICULO */}
        {showVehiclePricingModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full bg-[#1A1A1A] border-2 border-[#F4B400] rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#282828] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F4B400]/20 flex items-center justify-center text-[#F4B400]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Editar Precios de Lavados</h3>
                    <p className="text-[10px] text-neutral-400">Panel de Administrador ({currentUser})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVehiclePricingModal(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Precio Lavado Auto ($)</span>
                    <span className="text-[10px] text-[#F4B400]">Hatchback / Sedán</span>
                  </label>
                  <input
                    type="number"
                    value={tempAutoPrice}
                    onChange={e => setTempAutoPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#F4B400]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Precio Lavado Suv ($)</span>
                    <span className="text-[10px] text-[#BA68C8]">Crossover / SUV mediano</span>
                  </label>
                  <input
                    type="number"
                    value={tempSuvPrice}
                    onChange={e => setTempSuvPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#F4B400]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Precio Lavado Camioneta ($)</span>
                    <span className="text-[10px] text-[#00C853]">Pick-up / Gran porte</span>
                  </label>
                  <input
                    type="number"
                    value={tempCamionetaPrice}
                    onChange={e => setTempCamionetaPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#F4B400]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#282828]">
                <button
                  type="button"
                  onClick={() => setShowVehiclePricingModal(false)}
                  className="px-3.5 py-1.5 bg-[#252525] text-neutral-300 text-xs rounded-xl hover:bg-[#303030]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateVehiclePricing({
                      Auto: tempAutoPrice,
                      Suv: tempSuvPrice,
                      Camioneta: tempCamionetaPrice
                    });
                    setShowVehiclePricingModal(false);
                  }}
                  className="px-4 py-1.5 bg-[#F4B400] hover:bg-[#ffc820] text-black font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Guardar Nuevos Precios
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
