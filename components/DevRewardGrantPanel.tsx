import React, { useEffect, useState } from 'react';
import {
  getStoredAdminRewardGrants,
  type AdminRewardGrant,
} from '../utils/adminRewardGrantStorage';
import {
  grantRewardToEmail,
  revokeRewardFromEmail,
  toggleRewardGrant,
} from '../utils/adminRewardActions';

export const DevRewardGrantPanel: React.FC = () => {
  const [email, setEmail] = useState('');
  const [rewardId, setRewardId] = useState('');
  const [grants, setGrants] = useState<AdminRewardGrant[]>([]);
  const [isLocal, setIsLocal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const refreshList = () => {
    setGrants(getStoredAdminRewardGrants());
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setIsLocal(true);
      refreshList();
    }
  }, []);

  const handleAction = (action: () => void) => {
    if (!email.trim() || !rewardId.trim()) return;

    action();
    refreshList();
  };

  if (!isLocal) return null;

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-[9999] rounded bg-amber-600 px-2 py-1 text-[9px] font-black text-white opacity-60 shadow-lg hover:opacity-100"
      >
        DEV GRANTS
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-[10px] text-zinc-100 shadow-2xl">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-black text-amber-500">GA ADMIN CONSOLE</span>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="text-zinc-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-zinc-500">Target Email:</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-zinc-500">Reward ID:</label>
          <input
            value={rewardId}
            onChange={(event) => setRewardId(event.target.value)}
            placeholder="first_supporter_arquiteto"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleAction(() => grantRewardToEmail({ email, rewardId }))}
            className="rounded bg-emerald-700 py-1.5 font-bold hover:bg-emerald-600"
          >
            GRANT
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => revokeRewardFromEmail({ email, rewardId }))}
            className="rounded bg-red-900 py-1.5 font-bold hover:bg-red-800"
          >
            REVOKE
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => toggleRewardGrant({ email, rewardId }))}
            className="rounded bg-zinc-700 py-1.5 font-bold hover:bg-zinc-600"
          >
            TOGGLE
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-zinc-500">Active Grants ({grants.length})</span>
          <button
            type="button"
            onClick={refreshList}
            className="text-blue-400 hover:underline"
          >
            sync
          </button>
        </div>

        <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
          {grants.map((grant) => (
            <div
              key={`${grant.email}-${grant.rewardId}`}
              className="rounded border border-zinc-800 bg-zinc-800/50 p-1.5 text-[9px]"
            >
              <div className="truncate text-blue-300">{grant.email}</div>
              <div className="truncate font-bold text-amber-200">{grant.rewardId}</div>
            </div>
          ))}

          {grants.length === 0 && (
            <div className="py-2 italic text-zinc-700">No manual grants found.</div>
          )}
        </div>
      </div>
    </div>
  );
};