export type EstadoTurno = 'Pendiente' | 'Confirmado' | 'En proceso' | 'Finalizado' | 'Cancelado';

export type TipoVehiculo = 'Auto' | 'Suv' | 'Camioneta';

export interface VehiclePricing {
  Auto: number;
  Suv: number;
  Camioneta: number;
}

export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Reprogramada';

export interface Solicitud {
  id: string;
  cliente: string;
  telefono: string;
  vehiculo: string;
  tipoVehiculo?: TipoVehiculo;
  precio?: number;
  patente?: string;
  servicio: string;
  fecha: string;
  hora: string;
  observaciones: string;
  estado: EstadoSolicitud;
  sugerenciaHorario?: string;
  createdAt: number;
}

export interface Turno {
  id: string;
  cliente: string;
  telefono: string;
  vehiculo: string;
  tipoVehiculo?: TipoVehiculo;
  precio?: number;
  patente?: string;
  servicio: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  observaciones: string;
  estado: EstadoTurno;
  createdAt?: number;
  updatedBy?: 'Lucas' | 'Franco';
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: string;
  patente: string;
  visitasCount: number;
  ultimaVisita: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: string;
  descripcion?: string;
  icono?: string;
}

export interface Actividad {
  id: string;
  usuario: 'Lucas' | 'Franco';
  accion: string;
  timestamp: number;
  targetId?: string;
}

export interface FCMNotification {
  id: string;
  sender: 'Lucas' | 'Franco';
  recipient: 'Lucas' | 'Franco';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export type Operator = 'Lucas' | 'Franco';
