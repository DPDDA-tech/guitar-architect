import { useCallback, useState } from 'react';

// Centralizes the "are you sure you want to log out?" confirmation so every
// logout entry point (desktop menu, mobile header, footer, admin page) opens
// the same modal instead of calling the real sign-out logic directly.
export const useLogoutConfirm = (performLogout: () => void | Promise<void>) => {
  const [isOpen, setIsOpen] = useState(false);

  const requestLogout = useCallback(() => {
    setIsOpen(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsOpen(false);
    await performLogout();
  }, [performLogout]);

  return { isOpen, requestLogout, cancelLogout, confirmLogout };
};
