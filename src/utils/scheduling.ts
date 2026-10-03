import { HorarioDia, HorarioRango, Solicitud, Turno } from '../types';

export const SLOT_DURATION_MINUTES = 120;
export const SLOT_STEP_MINUTES = 15;
export const DEFAULT_CLOSE_BUFFER_MINUTES = 60;

/**
 * Horario semanal predeterminado.
 * Las fechas guardadas en Firebase funcionan como excepciones y reemplazan
 * este horario para ese día concreto.
 */
export function getDefaultScheduleForDate(fecha: string): HorarioDia {
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    return { fecha, habilitado: false, rangos: [] };
  }

  if (dayOfWeek === 6) {
    return {
      fecha,
      habilitado: true,
      rangos: [{ inicio: '07:30', fin: '19:00' }]
    };
  }

  return {
    fecha,
    habilitado: true,
    rangos: [{ inicio: '14:30', fin: '19:00' }]
  };
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return (hours * 60) + minutes;
}

export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function intervalsOverlap(firstStart: number, secondStart: number): boolean {
  if (firstStart < 0 || secondStart < 0) return false;
  const firstEnd = firstStart + SLOT_DURATION_MINUTES;
  const secondEnd = secondStart + SLOT_DURATION_MINUTES;
  return firstStart < secondEnd && secondStart < firstEnd;
}

/**
 * Genera horarios de inicio cada 15 minutos.
 * El horario configurado representa el horario habitual del local y el último
 * inicio permitido queda una hora antes del fin configurado.
 */
export function generateSlotsForRange(range: HorarioRango): string[] {
  const start = timeToMinutes(range.inicio);
  const end = timeToMinutes(range.fin);
  if (start < 0 || end <= start) return [];

  const latestStart = end - DEFAULT_CLOSE_BUFFER_MINUTES;
  const slots: string[] = [];

  for (let minute = start; minute <= latestStart; minute += SLOT_STEP_MINUTES) {
    slots.push(minutesToTime(minute));
  }

  return slots;
}

export function getEffectiveSchedule(
  fecha: string,
  schedules: Record<string, HorarioDia>
): HorarioDia {
  return schedules[fecha] ?? getDefaultScheduleForDate(fecha);
}

export function getSlotsForDay(schedule?: HorarioDia | null): string[] {
  if (!schedule?.habilitado) return [];

  return Array.from(
    new Set(schedule.rangos.flatMap(generateSlotsForRange))
  ).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

export function isActiveTurno(turno: Turno): boolean {
  return turno.estado !== 'Cancelado' && turno.estado !== 'Finalizado';
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
    return intervalsOverlap(requested, timeToMinutes(turno.hora));
  });

  if (hasTurno) return true;

  return solicitudes.some((solicitud) => {
    if (solicitud.fecha !== fecha || !isActiveSolicitud(solicitud)) return false;
    return intervalsOverlap(requested, timeToMinutes(solicitud.hora));
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
  const today = new Date();
  for (let i = 0; i < 90; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const fecha = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const schedule = getEffectiveSchedule(fecha, schedules);

    if (getAvailableSlots(fecha, schedule, turnos, solicitudes).length > 0) {
      return fecha;
    }
  }

  return undefined;
}
