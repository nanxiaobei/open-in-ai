import { useStore } from '@/store.ts';
import { cn } from '@/utils/cn';
import { ReactNode, useEffect, useState } from 'react';

export const AirSwitch = ({
  className,
  checked,
  onChange,
  text,
}: {
  className?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  text: ReactNode;
}) => {
  const { state } = useStore();
  const { authData } = state;

  const isAuthed = Boolean(authData && !authData.error);
  const [sliderClass, setSliderClass] = useState('');

  useEffect(() => {
    setSliderClass('before:duration-200');
  }, []);

  return (
    <div
      className={cn(
        'box justify-between',
        className,
        checked ? '[--dot:#00b669]' : '[--dot:rgb(0_0_0/0.12)]',
      )}
      onClick={isAuthed ? () => onChange(!checked) : undefined}
    >
      <div className={cn(checked ? '' : 'opacity-50')}>{text}</div>
      <div
        className={cn(
          '[--dash-h:20px] [--dash-w:8px] [--track-h:6px] [--track-w:calc(var(--dash-h)*2.2)]',
          'relative h-(--track-h) w-(--track-w) rounded-full inset-shadow-2xs inset-shadow-black/10',
          'before:glass before:absolute before:top-1/2 before:h-(--dash-h) before:w-(--dash-w) before:-translate-y-1/2 before:rounded-[2px]',
          sliderClass,
          checked
            ? 'bg-green-500 before:left-[calc(var(--track-w)-var(--dash-w))]'
            : 'bg-gray-400 before:left-0',
        )}
      />
    </div>
  );
};
