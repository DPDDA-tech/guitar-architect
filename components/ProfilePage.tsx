import React, { useEffect, useRef, useState } from 'react';
import { loadConfig, saveConfig } from '../utils/persistence';
import { supabase } from '../src/lib/supabase';
import { canUseDisplayName, getDisplayNameError, getSupabaseDisplayName } from '../src/lib/userIdentity';
import { loadUserProfile, saveUserProfile, UserProfile } from '../src/lib/userProfile';
import { pushLocalSnapshotToSupabase } from '../src/lib/cloudSync';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AppState, ThemeMode } from '../types';

const navigateHome = () => {
  window.history.pushState(null, '', '/');
  window.dispatchEvent(new CustomEvent('ga-route-change'));
};

const ProfilePage: React.FC = () => {
  const [config, setConfig] = useState<AppState | null>(() => loadConfig());
  const lang = config?.lang || 'pt';
  const theme = config?.theme || 'dark';
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [logo, setLogo] = useState(config?.userLogo || '');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? null);
      const userId = data.user?.id;
      if (data.user && userId) {
        // PRIORIDADE: Dados escopados pelo UUID do Supabase
        const currentProfile = loadUserProfile(userId);
        const next = {
          ...currentProfile,
          displayName: currentProfile.displayName || getSupabaseDisplayName(data.user),
          email: data.user.email || '',
        };
        setProfile(next);
      }
    });
  }, []);

  const updateConfig = (patch: Partial<AppState>) => {
    const userId = authUser?.id;
    const current = loadConfig(userId);
    if (!current) return;
    const next = { ...current, ...patch };
    saveConfig(next, userId);
    setConfig(next);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    updateConfig({ theme: nextTheme });
  };

  const syncProfile = async (nextProfile: UserProfile, nextLogo = logo) => {
    const userId = authUser?.id;
    const saved = saveUserProfile(nextProfile, userId);
    setProfile(saved);

    const current = loadConfig(userId);
    if (current) {
      const nextConfig = {
        ...current,
        // currentUser mantém o UUID para consistência de storage
        currentUser: userId || current.currentUser,
        userLogo: nextLogo || undefined,
      };
      saveConfig(nextConfig, userId);
      setConfig(nextConfig);
    }

    if (authUser) {
      await pushLocalSnapshotToSupabase(authUser.id, saved.displayName || getSupabaseDisplayName(authUser));
    }

    return saved;
  };

  const saveProfile = async () => {
    setStatus('');
    setError('');

    if (profile.displayName && !canUseDisplayName(profile.displayName, authUser?.email)) {
      setError(getDisplayNameError(lang));
      return;
    }

    const next = await syncProfile(profile);

    if (authUser && next.displayName) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: next.displayName },
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
    }

    setStatus(lang === 'pt' ? 'Perfil salvo e sincronizado.' : 'Profile saved and synced.');
  };

  const sendPasswordReset = async () => {
    setStatus('');
    setError('');
    const email = authUser?.email || profile.email;
    if (!email) {
      setError(lang === 'pt' ? 'Informe um e-mail para recuperar a senha.' : 'Enter an e-mail to recover the password.');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setStatus(lang === 'pt' ? 'Enviamos um link de recuperação para seu e-mail.' : 'A recovery link was sent to your e-mail.');
  };

  const changePassword = async () => {
    setStatus('');
    setError('');
    if (!authUser) {
      setError(lang === 'pt' ? 'Entre na conta antes de trocar a senha.' : 'Sign in before changing the password.');
      return;
    }
    if (newPassword.length < 6) {
      setError(lang === 'pt' ? 'Use uma senha com pelo menos 6 caracteres.' : 'Use a password with at least 6 characters.');
      return;
    }
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) {
      setError(passwordError.message);
      return;
    }
    setNewPassword('');
    setStatus(lang === 'pt' ? 'Senha atualizada.' : 'Password updated.');
  };

  const handleLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 512000) {
      setError(lang === 'pt' ? 'Arquivo muito grande. Limite: 500KB.' : 'File too large. Limit: 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const nextLogo = String(reader.result || '');
      setLogo(nextLogo);
      void syncProfile(profile, nextLogo);
    };
    reader.readAsDataURL(file);
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition ${
    isLight
      ? 'border-slate-300 bg-white text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-blue-500'
      : 'border-blue-900/55 bg-[#070d18] text-white focus:border-blue-400'
  }`;
  const cardClass = `rounded-[28px] border p-5 md:p-7 ${
    isLight
      ? 'border-[#c7d4e4] bg-[#f8fbff] shadow-[0_22px_70px_rgba(71,85,105,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]'
      : 'border-blue-900/55 bg-[#07111f] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(96,165,250,0.08)]'
  }`;

  return (
    <main
      className={`min-h-screen px-5 py-8 md:px-10 ${isLight ? 'text-slate-900' : 'text-white'}`}
      style={{
        backgroundColor: isLight ? '#eef3f8' : '#05070b',
        backgroundImage: isLight
          ? 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)'
          : 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-400">Guitar Architect</p>
            <h1 className="mt-2 text-4xl font-black italic uppercase tracking-tight text-blue-500">
              {lang === 'pt' ? 'Perfil' : 'Profile'}
            </h1>
            <p className={`mt-3 max-w-3xl text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {lang === 'pt'
                ? 'Gerencie sua identidade, contato, logo de exportação e segurança da conta.'
                : 'Manage your identity, contact, export logo and account security.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-slate-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {isLight ? (lang === 'pt' ? 'Escuro' : 'Dark') : (lang === 'pt' ? 'Claro' : 'Light')}
            </button>
            <span className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-slate-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'PT-BR' : 'EN'}
            </span>
            <button onClick={navigateHome} className="rounded-xl border border-blue-500/30 px-4 py-3 text-[10px] font-black uppercase text-blue-500">
              {lang === 'pt' ? 'Voltar ao fretboard' : 'Back to fretboard'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className={cardClass}>
            <h2 className="text-xl font-black uppercase">{lang === 'pt' ? 'Dados do usuário' : 'User data'}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{lang === 'pt' ? 'Nome público' : 'Public name'}</span>
                <input className={inputClass} value={profile.displayName} onChange={event => setProfile({ ...profile, displayName: event.target.value })} />
              </label>
              <label>
                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">E-mail</span>
                <input className={inputClass} value={authUser?.email || profile.email} onChange={event => setProfile({ ...profile, email: event.target.value })} disabled={Boolean(authUser)} />
              </label>
              <label>
                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{lang === 'pt' ? 'Telefone' : 'Phone'}</span>
                <input className={inputClass} value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} />
              </label>
              <label>
                <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{lang === 'pt' ? 'Endereço' : 'Address'}</span>
                <input className={inputClass} value={profile.address} onChange={event => setProfile({ ...profile, address: event.target.value })} />
              </label>
            </div>
            <button onClick={saveProfile} className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-[10px] font-black uppercase text-white shadow-xl">
              {lang === 'pt' ? 'Salvar perfil' : 'Save profile'}
            </button>
          </section>

          <aside className={cardClass}>
            <h2 className="text-xl font-black uppercase">{lang === 'pt' ? 'Logo de exportação' : 'Export logo'}</h2>
            <div className={`mt-5 flex aspect-[16/7] items-center justify-center overflow-hidden rounded-2xl border ${isLight ? 'border-slate-200 bg-white' : 'border-blue-900/50 bg-[#05070b]'}`}>
              {logo ? <img src={logo} className="h-full w-full object-contain p-4" /> : <span className="text-xs font-black uppercase text-slate-500">{lang === 'pt' ? 'Sem logo própria' : 'No custom logo'}</span>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
            <button onClick={() => fileInputRef.current?.click()} className="mt-4 w-full rounded-2xl border border-blue-500/40 px-4 py-3 text-[10px] font-black uppercase text-blue-500">
              {lang === 'pt' ? 'Subir logo' : 'Upload logo'}
            </button>
          </aside>

          <section className={cardClass}>
            <h2 className="text-xl font-black uppercase">{lang === 'pt' ? 'Acesso e senha' : 'Access and password'}</h2>
            <p className={`mt-2 text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {lang === 'pt'
                ? 'Recupere a senha por e-mail ou troque a senha enquanto estiver logado.'
                : 'Recover your password by e-mail or change it while signed in.'}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button onClick={sendPasswordReset} className="rounded-2xl border border-blue-500/40 px-4 py-3 text-[10px] font-black uppercase text-blue-500">
                {lang === 'pt' ? 'Enviar recuperação' : 'Send recovery'}
              </button>
              <input className={inputClass} type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder={lang === 'pt' ? 'Nova senha' : 'New password'} />
              <button onClick={changePassword} className="rounded-2xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">
                {lang === 'pt' ? 'Trocar senha' : 'Change password'}
              </button>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-black uppercase">{lang === 'pt' ? 'Conta e dados' : 'Account and data'}</h2>
            <p className={`mt-2 text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {lang === 'pt'
                ? 'Exclusão e transferência de conta exigem verificação administrativa. Dados bancários futuros deverão ser tratados por provedor seguro.'
                : 'Account deletion and transfer require administrative verification. Future banking data should be handled by a secure provider.'}
            </p>
            <div className="mt-5 grid gap-3">
              <a className="rounded-2xl border border-red-400/40 px-4 py-3 text-center text-[10px] font-black uppercase text-red-500" href="mailto:contato@guitararchitect.com.br?subject=Solicitar exclusao de conta Guitar Architect">
                {lang === 'pt' ? 'Solicitar exclusão' : 'Request deletion'}
              </a>
              <a className="rounded-2xl border border-blue-500/40 px-4 py-3 text-center text-[10px] font-black uppercase text-blue-500" href="mailto:contato@guitararchitect.com.br?subject=Solicitar transferencia de conta Guitar Architect">
                {lang === 'pt' ? 'Solicitar transferência' : 'Request transfer'}
              </a>
            </div>
          </section>
        </div>

        {(status || error) && (
          <div className={`mt-6 rounded-2xl border p-4 text-sm font-bold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {error || status}
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
