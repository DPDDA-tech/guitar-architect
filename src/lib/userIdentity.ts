/// <reference types="vite/client" />

import type { User as SupabaseUser } from '@supabase/supabase-js';

const RESERVED_DISPLAY_NAMES = [
  'Guitar Architect',
  'Guitar Architect Oficial',
  'Guitar Architect Official',
  'GA Oficial',
  'GA Official',
];

const normalizeIdentity = (value: string) => (
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
);

const getAdminEmails = () => (
  String(import.meta.env.VITE_GA_ADMIN_EMAILS || '')
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean)
);

export const isAdminEmail = (email?: string | null) => (
  Boolean(email && getAdminEmails().includes(email.toLowerCase()))
);

export const isReservedDisplayName = (name: string) => {
  const normalizedName = normalizeIdentity(name);
  return RESERVED_DISPLAY_NAMES.some(reserved => normalizeIdentity(reserved) === normalizedName);
};

export const canUseDisplayName = (name: string, email?: string | null) => (
  Boolean(name.trim() || email)
);

export const getDisplayNameError = (lang: 'pt' | 'en') => (
  lang === 'pt'
    ? 'Este nome é reservado para a administração do Guitar Architect.'
    : 'This name is reserved for Guitar Architect administration.'
);

export const getSupabaseDisplayName = (authUser: SupabaseUser) => {
  const metadataName =
    typeof authUser.user_metadata?.name === 'string'
      ? authUser.user_metadata.name
      : typeof authUser.user_metadata?.full_name === 'string'
        ? authUser.user_metadata.full_name
        : '';

  if (metadataName && canUseDisplayName(metadataName, authUser.email)) {
    return metadataName;
  }

  return authUser.email?.split('@')[0] || authUser.id;
};
