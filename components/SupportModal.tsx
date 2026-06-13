import React, { useState } from 'react';
import type { Lang } from '../i18n';
import { SUPPORTER_PIX_KEY } from '../utils/supporterConstants';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  lang: Lang;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, isLight, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORTER_PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-lg font-black uppercase tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            {lang === 'pt' ? 'Apoiar o Guitar Architect' : 'Support Guitar Architect'}
          </h2>

          <button
            onClick={onClose}
            className={`text-sm font-black transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label={lang === 'pt' ? 'Fechar' : 'Close'}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <p className={`text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
            {lang === 'pt'
              ? 'Se o Guitar Architect te ajudar, considere contribuir para manter e evoluir o projeto de forma contínua.'
              : 'If Guitar Architect helps you, consider contributing to keep the project sustainable and evolving.'}
          </p>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              {lang === 'pt' ? 'Pix (Brasil)' : 'Pix (Brazil)'}
            </div>

            <div
              className={`select-all rounded-xl border p-3 font-mono text-sm tracking-wide ${
                isLight
                  ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-100'
              }`}
            >
              {SUPPORTER_PIX_KEY}
            </div>

            <button
              onClick={handleCopy}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black uppercase text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              {copied
                ? (lang === 'pt' ? '✓ Copiado!' : '✓ Copied!')
                : (lang === 'pt' ? 'Copiar chave Pix' : 'Copy Pix key')}
            </button>

            <p className={`text-center text-sm ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {lang === 'pt' ? 'Projeto criado e mantido por ' : 'Project created and maintained by '}
              <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                Dílio Alvarenga
              </span>
            </p>
          </div>

          <p className={`text-center text-xs leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'pt'
              ? 'Antes de confirmar o Pix, verifique se o nome exibido pelo seu banco corresponde ao responsável pelo projeto.'
              : 'Before confirming the Pix transfer, verify that the name shown by your bank matches the project owner.'}
          </p>

          <p className={`text-center text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'pt'
              ? 'Contribuições são opcionais e não desbloqueiam funcionalidades.'
              : 'Contributions are optional and do not unlock features.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
