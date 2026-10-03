import React, { useEffect, useMemo, useState } from 'react';
import { PublicBookingPortal } from './components/PublicBookingPortal';
import { DEFAULT_VEHICLE_PRICING } from './data/mockData';
import { HorarioDia, Solicitud, VehiclePricing } from './types';
import { signInAnonymously } from 'firebase/auth';
import { push, ref, remove, runTransaction, set, onValue, serverTimestamp } from 'firebase/database';
import { auth, db } from './firebase';
import {
  getAvailableSlots,
  getEffectiveSchedule,
  isSlotOccupied,
  ReservationSlot,
  SLOT_DURATION_MINUTES,
  timeToMinutes
} from './utils/scheduling';

export default function App() {
  const [vehiclePricing] = useState<VehiclePricing>(DEFAULT_VEHICLE_PRICING);
  const [schedules, setSchedules] = useState<Record<string, HorarioDia>>({});
  const [reservations, setReservations] = useState<ReservationSlot[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeSchedules: () => void = () => undefined;
    let unsubscribeReservations: () => void = () => undefined;

    const startRealtimeData = async () => {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      if (cancelled) return;

      unsubscribeSchedules = onValue(ref(db, 'configuracion/horarios'), (snapshot) => {
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

      // The public portal only needs occupancy. Customer data never needs to be
      // downloaded into the public browser session.
      unsubscribeReservations = onValue(ref(db, 'reservas'), (snapshot) => {
        const next: ReservationSlot[] = [];
        snapshot.forEach((dateChild) => {
          const fecha = dateChild.key || '';
          dateChild.forEach((slotChild) => {
            const value = slotChild.val();
            if (!value) return;
            const hora = value.hora || slotChild.key || '';
            if (fecha && hora) next.push({ fecha, hora });
          });
        });
        setReservations(next);
      });
    };

    startRealtimeData().catch((error) => {
      console.error('No se pudo iniciar Firebase para el portal público:', error);
      setSchedules({});
      setReservations([]);
    });

    return () => {
      cancelled = true;
      unsubscribeSchedules();
      unsubscribeReservations();
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

      if (getAvailableSlots(fecha, schedule, reservations).length > 0) {
        dates.push(fecha);
      }
    }

    return dates;
  }, [schedules, reservations]);

  const getSlots = (fecha: string) =>
    getAvailableSlots(fecha, getEffectiveSchedule(fecha, schedules), reservations);

  const handlePublicSubmitSolicitud = async (
    solicitud: Omit<Solicitud, 'id' | 'estado' | 'createdAt'>
  ) => {
    try {
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      const slots = getSlots(solicitud.fecha);
      if (!slots.includes(solicitud.hora) || isSlotOccupied(solicitud.fecha, solicitud.hora, reservations)) {
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
      const transaction = await runTransaction(reservationDateRef, (current) => {
        const currentReservations: Record<string, any> =
          current && typeof current === 'object' ? current as Record<string, any> : {};

        for (const [existingTime, existing] of Object.entries(currentReservations)) {
          if (!existing) continue;
          const existingStart = timeToMinutes(existingTime);
          if (existingStart < 0) continue;

          const requestedEnd = requestedStart + SLOT_DURATION_MINUTES;
          const existingEnd = existingStart + SLOT_DURATION_MINUTES;
          const overlaps = requestedStart < existingEnd && existingStart < requestedEnd;
          if (overlaps) return;
        }

        return {
          ...currentReservations,
          [solicitud.hora]: {
            ownerId: solicitudId,
            ownerType: 'solicitud',
            ownerUid: user.uid,
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

      const reservationRef = ref(db, `reservas/${solicitud.fecha}/${solicitud.hora}`);
      try {
        await set(solicitudRef, {
          id: solicitudId,
          ...solicitud,
          estado: 'Pendiente',
          createdByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
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
