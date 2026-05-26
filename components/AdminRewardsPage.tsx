import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../src/lib/supabase';
import { isAdminEmail } from '../utils/adminAccess';
import { getStoredAdminRewardGrants, type AdminRewardGrant } from '../utils/adminRewardGrantStorage';
import { grantRewardToEmail, revokeRewardFromEmail } from '../utils/adminRewardActions';
import { getAdminRewardCatalog } from '../utils/adminRewardCatalog';
import { 
  listActiveSupabaseRewardGrants, 
  grantSupabaseRewardToEmail, 
  revokeSupabaseRewardFromEmail,
  grantRewardToAllUsers
} from '../utils/supabaseRewardGrants';
import { listAllAdminEligibleUsers } from '../utils/supabaseAdminUsers';

type UnifiedGrant = {
  email: string;
  rewardId: string;
  reason?: string | null;
  source: string;
  grantedAt: string;
  grantedBy?: string | null;
};

type AuthStatus = 'checking' | 'authorized' | 'unauthorized' | 'signedOut';

const navigateHome = () => {
  window.history.pushState(null, '', '/');
  window.dispatchEvent(new CustomEvent('ga-route-change'));
};

const AdminRewardsPage: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [registeredUserCount, setRegisteredUserCount] = useState<number | null>(null);

  // States para o formulÃƒÂ¡rio
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [grants, setGrants] = useState<UnifiedGrant[]>([]);
  const [grantMode, setGrantMode] = useState<'single' | 'all-users'>('single');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [lastBulkResult, setBulkResult] = useState<{ s: number; f: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRewardId, setFilterRewardId] = useState('');

  const catalog = useMemo(() => getAdminRewardCatalog(), []);

  const filteredGrants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return grants
      .filter((grant) => {
        const matchesReward = filterRewardId === '' || grant.rewardId === filterRewardId;
        const matchesSearch =
          q === '' ||
          grant.email.toLowerCase().includes(q) ||
          grant.rewardId.toLowerCase().includes(q);

        return matchesReward && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.grantedAt).getTime() -
          new Date(a.grantedAt).getTime()
      );
  }, [grants, searchQuery, filterRewardId]);

  const refreshGrants = async () => {
    const local = getStoredAdminRewardGrants().map(g => ({
      email: g.email,
      rewardId: g.rewardId,
      reason: g.reason,
      source: g.source,
      grantedAt: g.grantedAt
    }));

    const remote = (await listActiveSupabaseRewardGrants()).map(g => ({
      email: g.email,
      rewardId: g.reward_id,
      reason: g.reason,
      source: g.source,
      grantedAt: g.granted_at,
      grantedBy: g.granted_by
    }));

    setGrants([...remote, ...local]);
  };

  const refreshUserCount = async () => {
    const users = await listAllAdminEligibleUsers();
    setRegisteredUserCount(users.length > 0 ? users.length : 0);
  };

  useEffect(() => {
    console.log('[Admin Auth Trace] AdminRewardsPage montado. Iniciando checkAuth...');
    let isMounted = true;

    const checkAuth = async () => {
      let status: AuthStatus = 'signedOut';
      try {
        const startedAt = Date.now();
        console.log('[Admin Auth Trace] Chamando getSession... (timeout: 8000ms)');
        const result = await Promise.race([
          supabase.auth.getSession().then((res) => ({ type: 'session' as const, res })),
          new Promise<{ type: 'timeout' }>((resolve) => {
            window.setTimeout(() => resolve({ type: 'timeout' }), 8000);
          }),
        ]);
        if (!isMounted) return;

        if (result.type === 'timeout') {
          console.error(`[Admin Auth Trace] getSession TIMEOUT após ${Date.now() - startedAt}ms`);
          status = 'signedOut';
          setCurrentUserEmail(null);
          return;
        }

        const { data: { session }, error } = result.res;
        console.log(`[Admin Auth Trace] getSession resolvido em ${Date.now() - startedAt}ms`);
        const email = session?.user?.email || null;
        console.log(`[Admin Auth Trace] SessÃƒÂ£o: ${!!session}, Email: ${email}, Erro:`, error);
        setCurrentUserEmail(email);

        if (error || !session?.user || !email) {
          console.log('[Admin Auth Trace] UsuÃƒÂ¡rio nÃƒÂ£o logado ou sem email.');
          status = 'signedOut';
        } else if (isAdminEmail(email)) {
          console.log('[Admin Auth Trace] ADMIN AUTORIZADO via utils/adminAccess');
          status = 'authorized';
          void refreshGrants();
          void refreshUserCount();
        } else {
          console.log('[Admin Auth Trace] EMAIL NÃƒÆ’O AUTORIZADO PARA ADMIN');
          status = 'unauthorized';
        }
      } catch (err) {
        console.error('[Admin Auth Trace] ERRO CRÃƒÂTICO no checkAuth:', err);
        status = 'signedOut';
      } finally {
        console.log(`[Admin Auth Trace] Definindo estado final: ${status}`);
        if (isMounted) setAuthStatus(status);
      }
    };

    checkAuth();

    // Listener para reagir a logoff global
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && isMounted) {
        setAuthStatus('signedOut');
        setCurrentUserEmail(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGrant = async () => {
    if (!selectedRewardId) {
      alert('Selecione uma recompensa.');
      return;
    }

    if (grantMode === 'all-users') {
      if (!confirm('Esta aÃƒÂ§ÃƒÂ£o concederÃƒÂ¡ o selo selecionado para TODOS os usuÃƒÂ¡rios cadastrados. Confirmar?')) return;
      
      setBulkProcessing(true);
      setBulkResult(null);
      
      const res = await grantRewardToAllUsers(
        selectedRewardId, 
        'Bulk Admin UI Grant', 
        currentUserEmail || 'admin'
      );
      
      setBulkResult({ s: res.successCount, f: res.failCount });
      setBulkProcessing(false);
      refreshGrants();
      return;
    }
    
    if (!targetEmail.trim()) {
      alert('Preencha o e-mail do beneficiÃƒÂ¡rio.');
      return;
    }

    const res = await grantSupabaseRewardToEmail({
      email: targetEmail,
      rewardId: selectedRewardId,
      reason: 'Admin UI Global Grant',
      grantedBy: currentUserEmail || 'unknown'
    });

    if (!res.ok) {
      // Fallback local se falhar ou se quiser manter ambos (opcional)
      grantRewardToEmail({ email: targetEmail, rewardId: selectedRewardId, reason: 'Admin UI Local Fallback' });
    }

    refreshGrants();
  };

  const handleLogout = async () => {
  try {
    console.log('[Admin Auth Trace] handleLogout iniciado');
    localStorage.removeItem('ga_require_account_login');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Admin Auth Trace] signOut retornou erro:', error);
      return;
    }
    console.log('[Admin Auth Trace] signOut concluÃ­do com sucesso');
  } catch (err) {
    console.error('[Admin Auth Trace] Erro no signOut:', err);
  }
};

  const handleRevoke = async (email: string, rewardId: string, source: string) => {
    if (source === 'admin-supabase') {
      await revokeSupabaseRewardFromEmail(email, rewardId);
    } else {
      revokeRewardFromEmail({ email, rewardId });
    }
    refreshGrants();
  };

  if (authStatus === 'checking') return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-black uppercase tracking-widest">
      Verificando Credenciais...
    </div>
  );

  if (authStatus === 'signedOut') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-100">
      <h1 className="text-xl font-black text-red-500 uppercase tracking-tight">Acesso administrativo restrito</h1>
      <p className="mt-2 text-zinc-400 font-bold max-w-sm">FaÃƒÂ§a login com uma conta autorizada para acessar as ferramentas de gestÃƒÂ£o.</p>
      <button onClick={navigateHome} className="mt-8 px-6 py-3 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs transition-colors hover:bg-zinc-700">Voltar ao Fretboard</button>
    </div>
  );

  if (authStatus === 'unauthorized') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-100">
      <h1 className="text-xl font-black text-red-500 uppercase tracking-tight">Acesso negado</h1>
      <p className="mt-2 text-zinc-400 font-bold">O e-mail ({currentUserEmail}) nÃƒÂ£o possui permissÃƒÂµes administrativas.</p>
      <button onClick={navigateHome} className="mt-8 px-6 py-3 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs transition-colors hover:bg-zinc-700">Voltar ao Fretboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <header className="border-b border-zinc-800 px-6 py-8 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-500">Guitar Architect Ã¢â‚¬Â¢ Admin</p>
            <h1 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">Reward Management</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="w-fit rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-3 text-[10px] font-black uppercase text-red-400 hover:bg-red-900/40 transition-colors">
              Logoff
            </button>
            <button onClick={navigateHome} className="w-fit rounded-xl border border-zinc-700 px-5 py-3 text-[10px] font-black uppercase hover:bg-zinc-900 transition-colors">
              Voltar ao App
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 md:px-12">
        {/* Admin Stats Summary */}
        <div className="flex gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl px-6 py-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Registered users</p>
            <p className={`mt-1 text-2xl font-black ${registeredUserCount === null ? 'text-zinc-600 text-[10px]' : 'text-blue-500'}`}>
              {registeredUserCount === null ? 'User count unavailable' : registeredUserCount}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Coluna de AÃƒÂ§ÃƒÂµes */}
          <section className="space-y-6">
            <div className={`rounded-3xl border p-6 shadow-xl transition-all ${
              grantMode === 'all-users' ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'
            } ${bulkProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-lg font-black uppercase tracking-tight mb-6">Nova ConcessÃƒÂ£o</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <button 
                    onClick={() => setGrantMode('single')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${grantMode === 'single' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    UsuÃƒÂ¡rio ÃƒÅ¡nico
                  </button>
                  <button 
                    onClick={() => setGrantMode('all-users')}
                    className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${grantMode === 'all-users' ? 'bg-amber-600/20 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Todos (Bulk)
                  </button>
                </div>

                {grantMode === 'single' ? (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">E-mail do BeneficiÃƒÂ¡rio</label>
                    <input 
                      type="email"
                      value={targetEmail}
                      onChange={e => setTargetEmail(e.target.value)}
                      placeholder="usuario@email.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 animate-in zoom-in-95">
                    <p className="text-[11px] font-black uppercase leading-tight text-amber-500">
                      Ã¢Å¡Â Ã¯Â¸Â Esta aÃƒÂ§ÃƒÂ£o concederÃƒÂ¡ o selo selecionado para TODOS os usuÃƒÂ¡rios cadastrados.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Selo / Reward ID</label>
                  <select 
                    value={selectedRewardId}
                    onChange={e => setSelectedRewardId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-colors appearance-none"
                  >
                    <option value="">Selecionar reward...</option>
                    <optgroup label="MANUAL">
                      {catalog.filter(r => r.grantMode === 'manual').map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                      ))}
                    </optgroup>
                    <optgroup label="AUTOMÃƒÂTICO/MANUAL">
                      {catalog.filter(r => r.grantMode === 'automatic').map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                      ))}
                    </optgroup>
                    <optgroup label="MANUAL/AUTOMÃƒÂTICO">
                      {catalog.filter(r => r.grantMode === 'manual-or-automatic').map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button onClick={handleGrant} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-[10px] font-black uppercase shadow-lg shadow-blue-950/20 active:scale-95 transition-all w-full">
                    {grantMode === 'all-users' ? 'Executar ConcessÃƒÂ£o em Massa' : 'Conceder Selo'}
                  </button>
                  {grantMode === 'single' && (
                    <button onClick={() => handleRevoke(targetEmail, selectedRewardId, 'admin-supabase')} className="border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded-xl py-3 text-[10px] font-black uppercase active:scale-95 transition-all w-full">
                      Revogar
                    </button>
                  )}
                </div>

                {bulkProcessing && (
                  <div className="text-center py-2 animate-pulse">
                    <p className="text-[10px] font-black uppercase text-blue-400">Processando...</p>
                  </div>
                )}

                {lastBulkResult && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resultado:</p>
                    <p className="mt-1 text-[11px] font-bold">
                      <span className="text-emerald-500">Ã¢Å“â€ {lastBulkResult.s} sucessos</span>
                      <span className="mx-2 text-zinc-700">|</span>
                      <span className="text-red-500">Ã¢Å“â€“ {lastBulkResult.f} falhas</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <p className="text-[10px] font-bold leading-relaxed text-blue-400/80 italic">
                Painel administrativo de gerenciamento de recompensas premium.
              </p>
            </div>
          </section>

          {/* Coluna da Lista */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Admin Grants</h2>
              <button onClick={refreshGrants} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">Atualizar</button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por e-mail ou reward..."
                className="flex-1 min-w-[180px] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
              />
              <select 
                value={filterRewardId}
                onChange={(e) => setFilterRewardId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Filtrar Reward...</option>
                {catalog.map(r => (
                  <option key={r.id} value={r.id}>{r.id}</option>
                ))}
              </select>
              <div className="flex items-center px-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                {filteredGrants.length} grants
              </div>
            </div>

            <div className="space-y-3">
              {filteredGrants.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-600 font-bold uppercase text-xs">Nenhuma concessÃƒÂ£o encontrada.</p>
                </div>
              ) : filteredGrants.map((grant, idx) => (
                <div key={`${grant.email}-${grant.rewardId}-${idx}`} className="group relative bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-400 truncate">{grant.email}</span>
                        <span className="text-zinc-700 text-xs">Ã¢â‚¬Â¢</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${grant.source === 'admin-supabase' ? 'text-emerald-500' : 'text-zinc-500'}`}>{grant.source}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase border ${grant.reason?.includes('[BULK]') ? 'border-amber-900/50 text-amber-500' : 'border-zinc-800 text-zinc-500'}`}>
                          {grant.reason?.includes('[BULK]') ? 'BULK' : 'SINGLE'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-amber-500 truncate">{grant.rewardId}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-zinc-500 uppercase">
                        <span>Motivo: {grant.reason || '-'}</span>
                        <span>Data: {new Date(grant.grantedAt).toLocaleString()}</span>
                        {grant.grantedBy && <span className="text-blue-500/80">Por: {grant.grantedBy}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleRevoke(grant.email, grant.rewardId, grant.source);
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
