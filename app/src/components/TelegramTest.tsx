'use client';

import { isTelegramWebApp, setupMainButton, hideMainButton } from '@/utils/telegram';
import { useEffect } from 'react';

export default function TelegramTest() {
  useEffect(() => {
    if (isTelegramWebApp()) {
      setupMainButton('Test Main Button', () => {
        alert('Main button clicked!');
      });

      return () => {
        hideMainButton();
      };
    }
  }, []);

  return (
    <div className="space-y-4 mb-6">
      {/* Component content removed */}
    </div>
  );
}
