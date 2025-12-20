import { useActivate } from '@/hooks/useActivate';
import { Footer } from '@/sidepanel/Footer';
import { Settings } from '@/sidepanel/Settings';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import { watch } from '@/utils/event';
import { useEffect } from 'react';
import './SidePanel.css';

export const SidePanel = () => {
  const { windowId, state } = useStore();
  const { authData } = state;

  useEffect(() => {
    return watch({
      [`closeSide_${windowId}`]: () => window.close(),
      [`isSideOpen_${windowId}`]: () => true,
    });
  }, []);

  const { isPending } = useActivate();
  const authError = authData?.error;

  return (
    <div className="flex flex-col px-(--px) pt-(--py) pb-[250px]">
      <div
        className={cn(
          'flex flex-col [&>h2]:pb-[4px] [&>h2:not(:first-of-type)]:pt-[16px]',
          authData
            ? `${authError ? 'pointer-events-none opacity-30 blur-[3px]' : ''}`
            : 'pointer-events-none',
          isPending ? 'pointer-events-none opacity-70' : '',
        )}
      >
        <Settings />
      </div>

      <Footer />
    </div>
  );
};
