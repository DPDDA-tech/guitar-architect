import React, { useState } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
}

const PIX_KEY = 'contato@guitararchitect.com.br';

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, isLight }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-black uppercase tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            Apoiar o Guitar Architect
          </h2>

          <button
            onClick={onClose}
            className={`font-black text-sm transition-colors ${
              isLight
                ? 'text-zinc-500 hover:text-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <p className={`text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
            Se o Guitar Architect te ajudar, considere contribuir para manter e evoluir o projeto de forma contínua.
          </p>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Pix (Brasil)
            </div>

            <div
              className={`p-3 rounded-xl border font-mono text-sm tracking-wide select-all ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-100'
              }`}
            >
              {PIX_KEY}
            </div>

            <button
              onClick={handleCopy}
              className="w-full rounded-xl bg-blue-600 text-white text-sm font-black uppercase py-3 shadow-md hover:bg-blue-700 active:scale-[0.98] transition"
            >
              {copied ? '✓ Copiado!' : 'Copiar chave Pix'}
            </button>

            <p className={`text-sm text-center ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Projeto criado e mantido por{' '}
              <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                Dílio Alvarenga
              </span>
            </p>
          </div>

          <p className={`text-xs text-center leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Antes de confirmar o Pix, verifique se o nome exibido pelo seu banco corresponde ao responsável pelo projeto.
          </p>

          <p className={`text-xs text-center ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Contribuições são opcionais e não desbloqueiam funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;