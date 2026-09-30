import { HorarioDia, HorarioRango, Solicitud, Turno } from '../types';

export const SLOT_DURATION_MINUTES = 120;

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function generateSlotsForRange(range: HorarioRango): string[] {
  const start = timeToMinutes(range.inicio);
  const end = timeToMinutes(range.fin);
  const slots: string[] = [];

  for (let minute = start; minute + SLOT_DURATION_MINUTES <= end; minute += SLOT_DURATION_MINUTES) {
    slots.push(minutesToTime(minute));
  }

  return slots;
}

export function getSlotsForDay(schedule?: HorarioDia | null): string[] {
  if (!schedule?.habilitado) return [];

  return Array.from(
    new Set(schedule.rangos.flatMap(generateSlotsForRange))
  ).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

export function isActiveTurno(turno: Turno): boolean {
  return turno.estado !== 'Cancelado';
}

export function isActiveSolicitud(solicitud: Solicitud): boolean {
  return solicitud.estado === 'Pendiente' || solicitud.estado === 'Aprobada';
}

export function isSlotOccupied(
  fecha: string,
  hora: string,
  turnos: Turno[],
  solicitudes: Solicitud[]
): boolean {
  const requested = timeToMinutes(hora);
  const hasTurno = turnos.some((turno) => {
    if (turno.fecha !== fecha || !isActiveTurno(turno)) return false;
    const start = timeToMinutes(turno.hora);
    return Math.abs(start - requested) < SLOT_DURATION_MINUTES;
  });

  if (hasTurno) return true;

  return solicitudes.some((solicitud) => {
    if (solicitud.fecha !== fecha || !isActiveSolicitud(solicitud)) return false;
    const start = timeToMinutes(solicitud.hora);
    return Math.abs(start - requested) < SLOT_DURATION_MINUTES;
  });
}

export function getAvailableSlots(
  fecha: string,
  schedule: HorarioDia | undefined,
  turnos: Turno[],
  solicitudes: Solicitud[]
): string[] {
  return getSlotsForDay(schedule).filter(
    (hora) => !isSlotOccupied(fecha, hora, turnos, solicitudes)
  );
}

export function getNextAvailableDate(
  schedules: Record<string, HorarioDia>,
  turnos: Turno[],
  solicitudes: Solicitud[]
): string | undefined {
  return Object.keys(schedules)
    .filter((date) => date >= new Date().toISOString().slice(0, 10))
    .sort()
    .find((date) => getAvailableSlots(date, schedules[date], turnos, solicitudes).length > 0);
}
