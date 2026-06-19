import React from 'react';
import type { Lang } from '../i18n';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLight?: boolean;
  lang?: Lang;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLight = false,
  lang = 'pt',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
          isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900'
        }`}
      >
        <h2 className={`text-base font-black uppercase tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
          {lang === 'pt' ? 'Sair da conta' : 'Log out'}
        </h2>
        <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
          {lang === 'pt' ? 'Deseja realmente sair da sua conta?' : 'Are you sure you want to log out of your account?'}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 rounded-xl border px-4 py-3 text-xs font-black uppercase transition-colors ${
              isLight
                ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                : 'border-zinc-700 text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-red-500 bg-red-600 px-4 py-3 text-xs font-black uppercase text-white transition-colors hover:bg-red-500"
          >
            {lang === 'pt' ? 'Sair' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
