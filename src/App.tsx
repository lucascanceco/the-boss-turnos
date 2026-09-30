import React, { useEffect, useMemo, useState } from 'react';
import { PublicBookingPortal } from './components/PublicBookingPortal';
import { DEFAULT_VEHICLE_PRICING } from './data/mockData';
import { HorarioDia, Solicitud, Turno, VehiclePricing } from './types';
import { push, ref, remove, runTransaction, set, onValue, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { getAvailableSlots, getSlotsForDay, isSlotOccupied } from './utils/scheduling';

export default function App() {
  const [vehiclePricing] = useState<VehiclePricing>(DEFAULT_VEHICLE_PRICING);
  const [schedules, setSchedules] = useState<Record<string, HorarioDia>>({});
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    const unsubscribeSchedules = onValue(ref(db, 'configuracion/horarios'), (snapshot) => {
      const next: Record<string, HorarioDia> = {};
      snapshot.forEach((child) => {
        const value = child.val();
        if (value) {
          next[child.key || value.fecha] = {
            fecha: value.fecha || child.key || '',
            habilitado: value.habilitado === true,
            rangos: Array.isArray(value.rangos)
              ? value.rangos.filter(Boolean)
              : Object.values(value.rangos || {}),
            updatedAt: Number(value.updatedAt || 0),
            updatedBy: value.updatedBy
          };
        }
      });
      setSchedules(next);
    });

    const unsubscribeTurnos = onValue(ref(db, 'turnos'), (snapshot) => {
      const next: Turno[] = [];
      snapshot.forEach((child) => {
        const value = child.val();
        if (!value) return;
        next.push({
          id: child.key || value.id || '',
          cliente: value.cliente || '',
          telefono: value.telefono || '',
          vehiculo: value.vehiculo || '',
          patente: value.patente || '',
          servicio: value.servicio || '',
          fecha: value.fecha || '',
          hora: value.hora || '',
          observaciones: value.observaciones || '',
          estado: value.estado || 'Pendiente',
          tipoVehiculo: value.tipoVehiculo,
          precio: Number(value.precio || 0),
          createdAt: Number(value.createdAt || 0),
          updatedBy: value.updatedBy
        });
      });
      setTurnos(next);
    });

    const unsubscribeSolicitudes = onValue(ref(db, 'solicitudes'), (snapshot) => {
      const next: Solicitud[] = [];
      snapshot.forEach((child) => {
        const value = child.val();
        if (!value) return;
        next.push({
          id: child.key || value.id || '',
          cliente: value.cliente || '',
          telefono: value.telefono || '',
          vehiculo: value.vehiculo || '',
          patente: value.patente || '',
          servicio: value.servicio || '',
          fecha: value.fecha || '',
          hora: value.hora || '',
          observaciones: value.observaciones || '',
          estado: value.estado || 'Pendiente',
          sugerenciaHorario: value.sugerenciaHorario || '',
          createdAt: Number(value.createdAt || 0),
          tipoVehiculo: value.tipoVehiculo,
          precio: Number(value.precio || 0)
        });
      });
      setSolicitudes(next);
    });

    return () => {
      unsubscribeSchedules();
      unsubscribeTurnos();
      unsubscribeSolicitudes();
    };
  }, []);

  const availableDates = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return Object.keys(schedules)
      .filter((date) => date >= today && getSlotsForDay(schedules[date]).length > 0)
      .sort()
      .filter((date) => getAvailableSlots(date, schedules[date], turnos, solicitudes).length > 0);
  }, [schedules, turnos, solicitudes]);

  const getSlots = (fecha: string) =>
    getAvailableSlots(fecha, schedules[fecha], turnos, solicitudes);

  const handlePublicSubmitSolicitud = async (
    solicitud: Omit<Solicitud, 'id' | 'estado' | 'createdAt'>
  ) => {
    try {
      const slots = getSlots(solicitud.fecha);
      if (!slots.includes(solicitud.hora) || isSlotOccupied(solicitud.fecha, solicitud.hora, turnos, solicitudes)) {
        return {
          success: false,
          collisionWarning: true,
          error: 'Ese horario ya no está disponible. Seleccioná otro horario.'
        };
      }

      const solicitudRef = push(ref(db, 'solicitudes'));
      const solicitudId = solicitudRef.key;
      if (!solicitudId) throw new Error('No se pudo generar el identificador de la solicitud.');

      const reservationRef = ref(db, `reservas/${solicitud.fecha}/${solicitud.hora}`);
      const transaction = await runTransaction(reservationRef, (current) => {
        if (current !== null) return;
        return {
          ownerId: solicitudId,
          ownerType: 'solicitud',
          fecha: solicitud.fecha,
          hora: solicitud.hora,
          createdAt: serverTimestamp()
        };
      });

      if (!transaction.committed) {
        return {
          success: false,
          collisionWarning: true,
          error: 'Ese horario acaba de ser ocupado por otra reserva. Seleccioná otro horario.'
        };
      }

      try {
        await set(solicitudRef, {
          id: solicitudId,
          ...solicitud,
          estado: 'Pendiente',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        await remove(reservationRef);
        throw error;
      }

      return { success: true, collisionWarning: false };
    } catch (error) {
      console.error('Error al guardar la solicitud en Firebase:', error);
      return {
        success: false,
        collisionWarning: false,
        error: 'No pudimos enviar la solicitud. Verificá tu conexión e intentá nuevamente.'
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="min-h-screen w-full flex items-start justify-center py-6 sm:py-10 px-3 sm:px-6">
        <div className="w-full max-w-3xl">
          <PublicBookingPortal
            vehiclePricing={vehiclePricing}
            availableDates={availableDates}
            getAvailableSlots={getSlots}
            onSubmitSolicitud={handlePublicSubmitSolicitud}
          />
        </div>
      </main>
    </div>
  );
}
