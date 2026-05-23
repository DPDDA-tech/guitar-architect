import React, { useEffect } from 'react';

interface ConstancyUnlockToastProps {
  rewardTitle: string;
  rewardDescription: string;
  rewardImage: string;
  onClose: () => void;
}

export const ConstancyUnlockToast: React.FC<ConstancyUnlockToastProps> = ({
  rewardTitle,
  rewardDescription,
  rewardImage,
  onClose
}) => {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[340px] overflow-hidden rounded-2xl border border-blue-900/40 bg-[linear-gradient(145deg,rgba(3,7,18,0.96),rgba(9,13,24,0.98))] shadow-[0_20px_80px_rgba(37,99,235,0.28)] backdrop-blur-xl animate-in slide-in-from-right duration-500">
      <div className="flex gap-4 p-4">
        <div className="shrink-0 overflow-hidden rounded-xl border border-blue-900/50 bg-slate-950">
          <img
            src={rewardImage}
            alt={rewardTitle}
            className="h-20 w-20 object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
            Constância desbloqueada
          </p>

          <h3 className="mt-1 text-sm font-black text-white">
            {rewardTitle}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {rewardDescription}
          </p>

          <button
            onClick={onClose}
            className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300 hover:text-blue-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};