import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, Clock, Calendar, Car, Phone, User, ShieldAlert, DollarSign, ChevronDown } from 'lucide-react';
import { Solicitud, TipoVehiculo, VehiclePricing } from '../types';

interface PublicBookingPortalProps {
  vehiclePricing: VehiclePricing;
  onSubmitSolicitud: (solicitud: Omit<Solicitud, 'id' | 'estado' | 'createdAt'>) => Promise<{ success: boolean; collisionWarning?: boolean }>;
}

export const PublicBookingPortal: React.FC<PublicBookingPortalProps> = ({ vehiclePricing, onSubmitSolicitud }) => {
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('Auto');
  const [fecha, setFecha] = useState('2026-09-30');
  const [hora, setHora] = useState('11:00');
  const [observaciones, setObservaciones] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = vehiclePricing[tipoVehiculo];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !telefono.trim() || !vehiculo.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    const res = await onSubmitSolicitud({
      cliente: cliente.trim(),
      telefono: telefono.trim(),
      vehiculo: vehiculo.trim(),
      tipoVehiculo,
      precio: currentPrice,
      servicio: `Lavado ${tipoVehiculo}`,
      fecha,
      hora,
      observaciones: observaciones.trim()
    });

    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(true);
      return;
    }

    setCollisionWarning(Boolean(res.collisionWarning));
    setSubmitted(true);
  };

  const handleReset = () => {
    setCliente('');
    setTelefono('');
    setVehiculo('');
    setTipoVehiculo('Auto');
    setObservaciones('');
    setSubmitted(false);
    setCollisionWarning(false);
    setSubmitError(false);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl text-white">
      {/* Brand Header */}
      <div className="text-center pb-6 border-b border-[#262626]">
        <div className="inline-flex items-center gap-2 bg-[#F4B400]/10 border border-[#F4B400]/30 px-3 py-1 rounded-full text-xs text-[#F4B400] font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Portal de Reservas Online para Clientes
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-brand tracking-wider text-white">
          THE <span className="text-[#F4B400]">BOSS</span>
        </h2>
        <p className="text-xs uppercase tracking-widest text-[#7B1FA2] font-bold">LAVADO PREMIUM · DETAILING</p>
        <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
          Solicita tu turno en minutos. Tu solicitud llegará en tiempo real a la app de Lucas y Franco para confirmación inmediata.
        </p>
      </div>

      {submitted ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-[#00C853]/20 border border-[#00C853] rounded-full flex items-center justify-center mx-auto text-[#00C853]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-bold text-white">¡Solicitud Enviada con Éxito!</h3>
          
          <div className="bg-[#1F1F1F] border border-[#333] p-4 rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-[#2a2a2a] pb-1.5">
              <span className="text-neutral-400">Cliente:</span>
              <span className="font-semibold text-white">{cliente}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a2a] pb-1.5">
              <span className="text-neutral-400">Vehículo:</span>
              <span className="font-semibold text-white">{vehiculo}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a2a] pb-1.5">
              <span className="text-neutral-400">Tipo de Vehículo:</span>
              <span className="font-semibold text-white bg-[#7B1FA2]/30 px-2 py-0.5 rounded border border-[#7B1FA2]/50">{tipoVehiculo}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a2a] pb-1.5">
              <span className="text-neutral-400">Precio estimado del lavado:</span>
              <span className="font-black text-[#F4B400] text-sm font-mono">${currentPrice.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Día y Hora deseado:</span>
              <span className="font-bold text-white">{fecha} a las {hora} hs</span>
            </div>
          </div>

          {collisionWarning && (
            <div className="p-3 bg-[#F4B400]/15 border border-[#F4B400] rounded-lg max-w-md mx-auto flex items-start gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />
              <p className="text-xs text-[#F4B400]">
                <strong>Nota:</strong> Ese horario ya cuenta con una reserva activa. Lucas y Franco recibirán tu pedido y podrán sugerirte un horario alternativo con la opción <em>Reprogramar</em>.
              </p>
            </div>
          )}

          <p className="text-xs text-neutral-400">
            Revisa la pestaña <strong>"📱 App Móvil"</strong> para ver cómo llega en tiempo real a la bandeja de <strong>Solicitudes</strong> de THE BOSS.
          </p>

          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-[#F4B400] text-black font-bold text-xs rounded-xl hover:bg-[#ffc820] transition-colors"
          >
            Enviar Otra Solicitud
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-950/70 border border-red-500 rounded-xl text-xs text-red-200">
              No pudimos enviar la solicitud. Verifica tu conexión e inténtalo nuevamente.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#F4B400]" /> Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F4B400]" /> Teléfono (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
              />
            </div>
          </div>

          {/* Vehículo y Desplegable Tipo de Vehículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#F4B400]" /> Modelo del Vehículo *
              </label>
              <input
                type="text"
                required
                value={vehiculo}
                onChange={e => setVehiculo(e.target.value)}
                placeholder="Ej. VW Golf / Toyota Hilux / Ford Kuga"
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#7B1FA2]" /> Tipo de Vehículo *
              </label>
              <div className="relative">
                <select
                  value={tipoVehiculo}
                  onChange={e => setTipoVehiculo(e.target.value as TipoVehiculo)}
                  className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400] appearance-none cursor-pointer pr-9 font-medium"
                >
                  <option value="Auto">Auto - ${vehiclePricing.Auto.toLocaleString('es-AR')}</option>
                  <option value="Suv">Suv - ${vehiclePricing.Suv.toLocaleString('es-AR')}</option>
                  <option value="Camioneta">Camioneta - ${vehiclePricing.Camioneta.toLocaleString('es-AR')}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Pricing Banner for selected vehicle */}
          <div className="p-3.5 bg-gradient-to-r from-[#1C1C1C] to-[#241b2e] border border-[#7B1FA2]/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/30 border border-[#7B1FA2]/50 flex items-center justify-center text-[#BA68C8]">
                <DollarSign className="w-4 h-4 text-[#F4B400]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Precio de Lavado para {tipoVehiculo}</div>
                <div className="text-[11px] text-neutral-400">Tarifa fija estándar por categoría de vehículo</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-[#F4B400]">
                ${currentPrice.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F4B400]" /> Fecha Deseada
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F4B400]" /> Horario de Preferencia
              </label>
              <select
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
              >
                <option value="09:00">09:00 hs</option>
                <option value="10:00">10:00 hs</option>
                <option value="11:00">11:00 hs</option>
                <option value="11:30">11:30 hs</option>
                <option value="14:00">14:00 hs</option>
                <option value="15:30">15:30 hs</option>
                <option value="17:00">17:00 hs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Observaciones o detalles adicionales
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Ej. Manchas en tapizados, suciedad extrema de barro, etc."
              className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4B400]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#F4B400] hover:bg-[#ffc820] text-black font-black text-sm rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4" /> {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Turno en THE BOSS'}
          </button>
        </form>
      )}
    </div>
  );
};

