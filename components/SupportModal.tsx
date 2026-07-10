import React, { useState } from 'react';
import type { Lang } from '../i18n';
import { SUPPORTER_PIX_KEY, SUPPORTER_WISE_DETAILS } from '../utils/supporterConstants';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  lang: Lang;
}

type SupportMethod = 'pix' | 'wise';
type WiseField = keyof typeof SUPPORTER_WISE_DETAILS;

const wiseFieldOrder: WiseField[] = ['accountHolder', 'accountNumber', 'routingNumber', 'swiftBic'];

const wiseFieldLabels: Record<WiseField, { pt: string; en: string }> = {
  accountHolder: { pt: 'Titular da conta', en: 'Account holder' },
  accountNumber: { pt: 'Número da conta', en: 'Account number' },
  routingNumber: { pt: 'Routing number', en: 'Routing number' },
  swiftBic: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' },
};

const copyToClipboard = async (value: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // falls through to the legacy fallback below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
};

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, isLight, lang }) => {
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<SupportMethod>('pix');
  const [copiedWiseField, setCopiedWiseField] = useState<WiseField | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORTER_PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCopyWiseField = async (field: WiseField) => {
    const succeeded = await copyToClipboard(SUPPORTER_WISE_DETAILS[field]);
    if (!succeeded) return;
    setCopiedWiseField(field);
    setTimeout(() => setCopiedWiseField(prev => (prev === field ? null : prev)), 1500);
  };

  if (!isOpen) return null;

  const tabActiveClass = 'bg-blue-600 text-white';
  const tabInactiveClass = isLight
    ? 'text-zinc-600 hover:text-zinc-900'
    : 'text-zinc-400 hover:text-zinc-100';

  const fieldBoxClass = isLight
    ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
    : 'border-zinc-700 bg-zinc-800 text-zinc-100';

  const fieldCopyBtnClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-blue-500';

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

          <p className={`text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
            {lang === 'pt'
              ? 'O Guitar Architect é um projeto independente. As contribuições ajudam a manter o desenvolvimento, a infraestrutura e a criação de novos recursos.'
              : 'Guitar Architect is an independent project. Contributions help support ongoing development, infrastructure, and the creation of new features.'}
          </p>

          <div
            className={`flex gap-1 rounded-xl border p-1 ${
              isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'
            }`}
            role="tablist"
            aria-label={lang === 'pt' ? 'Formas de apoio' : 'Support methods'}
          >
            <button
              type="button"
              role="tab"
              aria-selected={method === 'pix'}
              onClick={() => setMethod('pix')}
              className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                method === 'pix' ? tabActiveClass : tabInactiveClass
              }`}
            >
              PIX
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === 'wise'}
              onClick={() => setMethod('wise')}
              className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                method === 'wise' ? tabActiveClass : tabInactiveClass
              }`}
            >
              {lang === 'pt' ? 'Wise Internacional' : 'Wise (International)'}
            </button>
          </div>

          {method === 'pix' && (
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

              <p className={`text-center text-xs leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {lang === 'pt'
                  ? 'Antes de confirmar o Pix, verifique se o nome exibido pelo seu banco corresponde ao responsável pelo projeto.'
                  : 'Before confirming the Pix transfer, verify that the name shown by your bank matches the project owner.'}
              </p>
            </div>
          )}

          {method === 'wise' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-400">
                  {lang === 'pt' ? 'Apoio internacional via Wise' : 'International support via Wise'}
                </div>
                <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {lang === 'pt'
                    ? 'Para contribuições em USD, utilize os dados bancários abaixo.'
                    : 'To support Guitar Architect in USD, use the banking details below.'}
                </p>
              </div>

              {wiseFieldOrder.map(field => (
                <div key={field}>
                  <div className="mb-1 text-xs uppercase tracking-wider text-zinc-400">
                    {wiseFieldLabels[field][lang]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`select-all flex-1 rounded-xl border p-3 font-mono text-sm tracking-wide ${fieldBoxClass}`}
                    >
                      {SUPPORTER_WISE_DETAILS[field]}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyWiseField(field)}
                      aria-label={
                        lang === 'pt'
                          ? `Copiar ${wiseFieldLabels[field].pt}`
                          : `Copy ${wiseFieldLabels[field].en}`
                      }
                      className={`shrink-0 rounded-xl border px-3 py-3 text-[11px] font-black uppercase tracking-wide transition-colors ${fieldCopyBtnClass}`}
                    >
                      {copiedWiseField === field
                        ? (lang === 'pt' ? 'Copiado' : 'Copied')
                        : (lang === 'pt' ? 'Copiar' : 'Copy')}
                    </button>
                  </div>
                </div>
              ))}

              <p className={`text-center text-sm ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {lang === 'pt' ? 'Projeto criado e mantido por ' : 'Project created and maintained by '}
                <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  Dílio Alvarenga
                </span>
              </p>
            </div>
          )}

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
