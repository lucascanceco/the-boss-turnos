import { Turno, Solicitud, Cliente, Servicio, Actividad, VehiclePricing } from '../types';

export const DEFAULT_VEHICLE_PRICING: VehiclePricing = {
  Auto: 20000,
  Suv: 25000,
  Camioneta: 30000
};

export const INITIAL_SERVICES: Servicio[] = [
  {
    id: 'srv-1',
    nombre: 'Lavado básico',
    precio: 18000,
    duracion: '45 min',
    descripcion: 'Lavado exterior a mano con shampoo pH neutro, secado con microfibra y aspirado de interior rápido.'
  },
  {
    id: 'srv-2',
    nombre: 'Lavado premium',
    precio: 28000,
    duracion: '1h 30m',
    descripcion: 'Descontaminado químico, llantas al detalle, ceras de carnauba hidrofóbica, acondicionador de plásticos y perfumado.'
  },
  {
    id: 'srv-3',
    nombre: 'Limpieza de Motor',
    precio: 22000,
    duracion: '1h 00m',
    descripcion: 'Lavado con vapor a baja humedad, desengrasado con pinceles de cerda suave e hidratación de mangueras y plásticos.'
  },
  {
    id: 'srv-4',
    nombre: 'Limpieza de Tapizados',
    precio: 35000,
    duracion: '2h 30m',
    descripcion: 'Inyección-extracción profunda en butacas y alfombras, remoción de manchas y desinfección con ozono.'
  },
  {
    id: 'srv-5',
    nombre: 'Detailing Completo & Cerámico',
    precio: 85000,
    duracion: '5h 00m',
    descripcion: 'Corrección de laca en 2 pasos (corte y acabado), abrillantado espejo y sellado cerámico 9H duración 12 meses.'
  }
];

export const INITIAL_CLIENTS: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Martín Rodríguez',
    telefono: '+5491145678901',
    vehiculo: 'Volkswagen Vento GLI',
    patente: 'AF 342 BZ',
    visitasCount: 6,
    ultimaVisita: '2026-09-24'
  },
  {
    id: 'cli-2',
    nombre: 'Gonzalo Benítez',
    telefono: '+5491156789012',
    vehiculo: 'Toyota Hilux GR-S',
    patente: 'AG 891 KL',
    visitasCount: 9,
    ultimaVisita: '2026-09-26'
  },
  {
    id: 'cli-3',
    nombre: 'Sofía Álvarez',
    telefono: '+5491167890123',
    vehiculo: 'Audi A3 Sportback',
    patente: 'AE 210 CD',
    visitasCount: 4,
    ultimaVisita: '2026-09-28'
  },
  {
    id: 'cli-4',
    nombre: 'Leandro Rossi',
    telefono: '+5491178901234',
    vehiculo: 'BMW Serie 3 330i',
    patente: 'AC 765 OP',
    visitasCount: 3,
    ultimaVisita: '2026-09-20'
  },
  {
    id: 'cli-5',
    nombre: 'Camila Morales',
    telefono: '+5491189012345',
    vehiculo: 'Peugeot 208 GT',
    patente: 'AF 119 XY',
    visitasCount: 2,
    ultimaVisita: '2026-09-18'
  }
];

export const INITIAL_TURNOS: Turno[] = [
  {
    id: 'tur-101',
    cliente: 'Martín Rodríguez',
    telefono: '+5491145678901',
    vehiculo: 'Volkswagen Vento GLI',
    patente: 'AF 342 BZ',
    servicio: 'Detailing Completo & Cerámico',
    fecha: '2026-09-29',
    hora: '09:00',
    observaciones: 'Prestar atención a micro-rayas en el capot. Cliente muy exigente.',
    estado: 'En proceso',
    updatedBy: 'Lucas'
  },
  {
    id: 'tur-102',
    cliente: 'Gonzalo Benítez',
    telefono: '+5491156789012',
    vehiculo: 'Toyota Hilux GR-S',
    patente: 'AG 891 KL',
    servicio: 'Lavado premium',
    fecha: '2026-09-29',
    hora: '11:30',
    observaciones: 'Viene de viaje con barro seco en guardabarros interiores.',
    estado: 'Confirmado',
    updatedBy: 'Franco'
  },
  {
    id: 'tur-103',
    cliente: 'Sofía Álvarez',
    telefono: '+5491167890123',
    vehiculo: 'Audi A3 Sportback',
    patente: 'AE 210 CD',
    servicio: 'Limpieza de Tapizados',
    fecha: '2026-09-29',
    hora: '14:00',
    observaciones: 'Mancha de café en asiento del acompañante.',
    estado: 'Pendiente',
    updatedBy: 'Lucas'
  },
  {
    id: 'tur-104',
    cliente: 'Leandro Rossi',
    telefono: '+5491178901234',
    vehiculo: 'BMW Serie 3 330i',
    patente: 'AC 765 OP',
    servicio: 'Lavado básico',
    fecha: '2026-09-29',
    hora: '16:30',
    observaciones: 'Lavado rápido antes de reunión ejecutiva.',
    estado: 'Confirmado',
    updatedBy: 'Franco'
  },
  {
    id: 'tur-105',
    cliente: 'Federico Castro',
    telefono: '+5491190123456',
    vehiculo: 'Ford Ranger Raptor',
    patente: 'AG 450 MN',
    servicio: 'Limpieza de Motor',
    fecha: '2026-09-28',
    hora: '10:00',
    observaciones: 'Limpieza con vapor y nutrición de mangueras completada.',
    estado: 'Finalizado',
    updatedBy: 'Lucas'
  },
  {
    id: 'tur-106',
    cliente: 'Ignacio Vega',
    telefono: '+5491133334444',
    vehiculo: 'Chevrolet Cruze RS',
    patente: 'AD 990 QW',
    servicio: 'Lavado premium',
    fecha: '2026-09-30',
    hora: '10:00',
    observaciones: 'Pasa a dejarlo a primera hora.',
    estado: 'Confirmado',
    updatedBy: 'Franco'
  }
];

export const INITIAL_SOLICITUDES: Solicitud[] = [
  {
    id: 'sol-201',
    cliente: 'Nicolás Giménez',
    telefono: '+5491122334455',
    vehiculo: 'Mercedes-Benz Clase A 250',
    patente: 'AF 876 GH',
    servicio: 'Detailing Completo & Cerámico',
    fecha: '2026-09-30',
    hora: '14:30',
    observaciones: 'Quiero protección cerámica antes de viajar a la costa.',
    estado: 'Pendiente',
    createdAt: Date.now() - 1000 * 60 * 35
  },
  {
    id: 'sol-202',
    cliente: 'Valeria Domínguez',
    telefono: '+5491199887766',
    vehiculo: 'Jeep Compass Limited',
    patente: 'AG 312 TY',
    servicio: 'Limpieza de Tapizados',
    fecha: '2026-10-01',
    hora: '09:30',
    observaciones: 'Tengo dos perros y necesito desinfección de pelos y olores.',
    estado: 'Pendiente',
    createdAt: Date.now() - 1000 * 60 * 120
  },
  {
    id: 'sol-203',
    cliente: 'Esteban Paredes',
    telefono: '+5491155443322',
    vehiculo: 'Volkswagen Golf GTI Mk7',
    patente: 'AA 908 JJ',
    servicio: 'Lavado premium',
    fecha: '2026-09-29',
    hora: '11:30', // Conflicts with tur-102! Demonstrates conflict detection
    observaciones: 'Solicitado vía web hace 10 min.',
    estado: 'Pendiente',
    createdAt: Date.now() - 1000 * 60 * 10
  }
];

export const INITIAL_ACTIVITIES: Actividad[] = [
  {
    id: 'act-1',
    usuario: 'Lucas',
    accion: 'Creó el turno para Martín Rodríguez (Volkswagen Vento GLI)',
    timestamp: Date.now() - 1000 * 60 * 180
  },
  {
    id: 'act-2',
    usuario: 'Franco',
    accion: 'Confirmó el turno de Gonzalo Benítez (Toyota Hilux GR-S)',
    timestamp: Date.now() - 1000 * 60 * 110
  },
  {
    id: 'act-3',
    usuario: 'Lucas',
    accion: 'Cambió estado a "En proceso" para Volkswagen Vento GLI',
    timestamp: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'act-4',
    usuario: 'Franco',
    accion: 'Finalizó el servicio de Ford Ranger Raptor',
    timestamp: Date.now() - 1000 * 60 * 20
  }
];
