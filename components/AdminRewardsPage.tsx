import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../src/lib/supabase';
import { isAdminEmail } from '../utils/adminAccess';
import { getStoredAdminRewardGrants, type AdminRewardGrant } from '../utils/adminRewardGrantStorage';
import { grantRewardToEmail, revokeRewardFromEmail, toggleRewardGrant } from '../utils/adminRewardActions';
import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { constancyRewards } from '../data/constancyRewards';

const navigateHome = () => {
  window.history.pushState(null, '', '/');
  window.dispatchEvent(new CustomEvent('ga-route-change'));
};

const AdminRewardsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // States para o formulário
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [grants, setGrants] = useState<AdminRewardGrant[]>([]);

  const knownRewards = useMemo(() => [
    ...supporterFirstRewards.map(r => ({ id: r.id, title: r.title, type: 'MANUAL' })),
    ...constancyRewards.map(r => ({ id: r.id, title: r.title, type: 'AUTO/TEST' }))
  ], []);

  const refreshGrants = () => {
    setGrants(getStoredAdminRewardGrants());
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email || null;
      setCurrentUserEmail(email);
      const authorized = isAdminEmail(email);
      setIsAuthorized(authorized);
      if (authorized) refreshGrants();
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleAction = (action: () => void) => {
    if (!targetEmail.trim() || !selectedRewardId.trim()) {
      alert('Preencha o e-mail e selecione uma recompensa.');
      return;
    }
    action();
    refreshGrants();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-black uppercase tracking-widest">
      Verificando Credenciais...
    </div>
  );

  if (!currentUserEmail) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-100">
      <h1 className="text-xl font-black text-red-500 uppercase tracking-tight">Acesso administrativo restrito</h1>
      <p className="mt-2 text-zinc-400 font-bold max-w-sm">Faça login com uma conta autorizada para acessar as ferramentas de gestão.</p>
      <button onClick={navigateHome} className="mt-8 px-6 py-3 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs transition-colors hover:bg-zinc-700">Voltar ao Fretboard</button>
    </div>
  );

  if (!isAuthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-100">
      <h1 className="text-xl font-black text-red-500 uppercase tracking-tight">Acesso negado</h1>
      <p className="mt-2 text-zinc-400 font-bold">O e-mail ({currentUserEmail}) não possui permissões administrativas.</p>
      <button onClick={navigateHome} className="mt-8 px-6 py-3 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs transition-colors hover:bg-zinc-700">Voltar ao Fretboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <header className="border-b border-zinc-800 px-6 py-8 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-500">Guitar Architect • Admin</p>
            <h1 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">Reward Management</h1>
          </div>
          <button onClick={navigateHome} className="w-fit rounded-xl border border-zinc-700 px-5 py-3 text-[10px] font-black uppercase hover:bg-zinc-900 transition-colors">
            Voltar ao App
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 md:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Coluna de Ações */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
              <h2 className="text-lg font-black uppercase tracking-tight mb-6">Conceder Recompensa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">E-mail do Beneficiário</label>
                  <input 
                    type="email"
                    value={targetEmail}
                    onChange={e => setTargetEmail(e.target.value)}
                    placeholder="usuario@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Selo / Reward ID</label>
                  <select 
                    value={selectedRewardId}
                    onChange={e => setSelectedRewardId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-colors appearance-none"
                  >
                    <option value="">Selecionar reward...</option>
                    <optgroup label="PRIMEIROS APOIADORES (MANUAL)">
                      {knownRewards.filter(r => r.type === 'MANUAL').map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                      ))}
                    </optgroup>
                    <optgroup label="CONSTÂNCIA (AUTO/TEST)">
                      {knownRewards.filter(r => r.type === 'AUTO/TEST').map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleAction(() => grantRewardToEmail({ email: targetEmail, rewardId: selectedRewardId, reason: 'Admin UI Grant' }))}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-[10px] font-black uppercase shadow-lg shadow-blue-950/20 active:scale-95 transition-all"
                  >
                    Conceder
                  </button>
                  <button 
                    onClick={() => handleAction(() => revokeRewardFromEmail({ email: targetEmail, rewardId: selectedRewardId }))}
                    className="border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded-xl py-3 text-[10px] font-black uppercase active:scale-95 transition-all"
                  >
                    Revogar
                  </button>
                  <button 
                    onClick={() => handleAction(() => toggleRewardGrant({ email: targetEmail, rewardId: selectedRewardId, reason: 'Admin UI Toggle' }))}
                    className="col-span-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl py-3 text-[10px] font-black uppercase transition-all"
                  >
                    Alternar (Toggle)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <p className="text-[10px] font-bold leading-relaxed text-blue-400/80 italic">
                Nota: Nesta fase, os grants são salvos apenas no LocalStorage deste navegador. 
              </p>
            </div>
          </section>

          {/* Coluna da Lista */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Active Storage Grants</h2>
              <button onClick={refreshGrants} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">Atualizar</button>
            </div>

            <div className="space-y-3">
              {grants.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-600 font-bold uppercase text-xs">Nenhuma concessão local encontrada.</p>
                </div>
              ) : grants.map((grant, idx) => (
                <div key={`${grant.email}-${grant.rewardId}-${idx}`} className="group relative bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-400 truncate">{grant.email}</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{grant.source}</span>
                      </div>
                      <h3 className="text-base font-black text-amber-500 truncate">{grant.rewardId}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-zinc-500 uppercase">
                        <span>Motivo: {grant.reason || '-'}</span>
                        <span>Data: {new Date(grant.grantedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        revokeRewardFromEmail({ email: grant.email, rewardId: grant.rewardId });
                        refreshGrants();
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-red-950/40 text-red-500 p-2 rounded-lg hover:bg-red-900/40 transition-all"
                      title="Excluir"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminRewardsPage;