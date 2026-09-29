import React from 'react';
import { Bell, X, Check, Smartphone } from 'lucide-react';
import { FCMNotification } from '../types';

interface NotificationCenterModalProps {
  notifications: FCMNotification[];
  currentUser: 'Lucas' | 'Franco';
  onClose: () => void;
  onClear: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  currentUser,
  onClose,
  onClear
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 bg-[#161616] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1FA2]/20 text-[#BA68C8] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-brand">Centro de Notificaciones FCM</h3>
              <p className="text-[11px] text-neutral-400">Señales cruzadas entre Lucas y Franco</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
              <Smartphone className="w-8 h-8 text-neutral-600 mx-auto" />
              <div>No hay notificaciones registradas.</div>
              <div className="text-[11px] text-neutral-500">
                Al crear o editar un turno con Lucas, Franco recibirá una notificación automática.
              </div>
            </div>
          ) : (
            notifications.map(notif => {
              const isForMe = notif.recipient === currentUser;
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                    isForMe
                      ? 'bg-[#1E1E1E] border-[#7B1FA2]/50 text-white'
                      : 'bg-[#161616] border-[#262626] text-neutral-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono font-bold text-[#F4B400]">
                      De {notif.sender} ➔ Para {notif.recipient} {isForMe && '(TÚ)'}
                    </span>
                    <span className="text-neutral-500">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs">{notif.title}</div>
                  <div className="text-[11px] text-neutral-300 leading-snug">{notif.body}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#161616] border-t border-[#262626] flex justify-end">
            <button
              onClick={onClear}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Limpiar Historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
