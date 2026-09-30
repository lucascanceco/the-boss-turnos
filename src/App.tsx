import React, { useState } from 'react';
import { PublicBookingPortal } from './components/PublicBookingPortal';
import { DEFAULT_VEHICLE_PRICING } from './data/mockData';
import { Solicitud, VehiclePricing } from './types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [vehiclePricing] = useState<VehiclePricing>(DEFAULT_VEHICLE_PRICING);

  const handlePublicSubmitSolicitud = async (
    solicitud: Omit<Solicitud, 'id' | 'estado' | 'createdAt'>
  ) => {
    try {
      await addDoc(collection(db, 'solicitudes'), {
        ...solicitud,
        estado: 'Pendiente',
        createdAt: serverTimestamp()
      });

      console.log('Solicitud guardada en Firebase:', solicitud);

      return {
        success: true,
        collisionWarning: false
      };
    } catch (error) {
      console.error('Error al guardar la solicitud en Firebase:', error);

      return {
        success: false,
        collisionWarning: false
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="min-h-screen w-full flex items-start justify-center py-6 sm:py-10 px-3 sm:px-6">
        <div className="w-full max-w-3xl">
          <PublicBookingPortal
            vehiclePricing={vehiclePricing}
            onSubmitSolicitud={handlePublicSubmitSolicitud}
          />
        </div>
      </main>
    </div>
  );
}
