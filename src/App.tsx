import React, { useEffect, useMemo, useState } from 'react';
import { PublicBookingPortal } from './components/PublicBookingPortal';
import { DEFAULT_VEHICLE_PRICING } from './data/mockData';
import { HorarioDia, Solicitud, Turno, VehiclePricing } from './types';
import { push, ref, remove, runTransaction, set, onValue, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import {
  getAvailableSlots,
  getEffectiveSchedule,
  intervalsOverlap,
  isSlotOccupied,
  timeToMinutes
} from './utils/scheduling';

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
        if (!value || Number(value.deletedAt || 0) > 0) return;
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
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 90; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const fecha = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const schedule = getEffectiveSchedule(fecha, schedules);

      if (getAvailableSlots(fecha, schedule, turnos, solicitudes).length > 0) {
        dates.push(fecha);
      }
    }

    return dates;
  }, [schedules, turnos, solicitudes]);

  const getSlots = (fecha: string) =>
    getAvailableSlots(fecha, getEffectiveSchedule(fecha, schedules), turnos, solicitudes);

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

      const requestedStart = timeToMinutes(solicitud.hora);
      const reservationDateRef = ref(db, `reservas/${solicitud.fecha}`);
      const reservationSlotRef = ref(db, `reservas/${solicitud.fecha}/${solicitud.hora}`);
      const transaction = await runTransaction(reservationDateRef, (current) => {
        const reservations = current && typeof current === 'object'
          ? current as Record<string, { ownerId?: string; hora?: string }>
          : {};

        const hasConflict = Object.entries(reservations).some(([key, value]) => {
          if (!value) return false;
          const existingTime = key || value.hora || '';
          return intervalsOverlap(requestedStart, timeToMinutes(existingTime));
        });

        if (hasConflict) return;

        return {
          ...reservations,
          [solicitud.hora]: {
            ownerId: solicitudId,
            ownerType: 'solicitud',
            fecha: solicitud.fecha,
            hora: solicitud.hora,
            createdAt: serverTimestamp()
          }
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        await remove(reservationSlotRef);
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
