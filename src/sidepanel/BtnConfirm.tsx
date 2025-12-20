import { useClickOutside } from '@/hooks/useClickOutside.ts';
import { cn } from '@/utils/cn';
import { HTMLAttributes, ReactNode, useRef, useState } from 'react';

export const BtnConfirm = ({
  className,
  title,
  onConfirm,
  children,
  ...restProps
}: {
  className?: string;
  title?: ReactNode;
  onConfirm?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'>) => {
  const [open, setOpen] = useState(false);
  const pos = useRef<{ top: number; left: number }>(undefined);

  const onClose = () => {
    setOpen(false);
    setTimeout(() => {
      pos.current = undefined;
    }, 200);
  };

  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, open);

  return (
    <>
      <div
        className={cn('box tertiary', className)}
        onClick={(event) => {
          const rect = (event.target as HTMLDivElement).getBoundingClientRect();
          pos.current = {
            top: rect.bottom + 5,
            left: rect.left + rect.width / 2,
          };
          setOpen(true);
        }}
        {...restProps}
      >
        {children}
      </div>

      <div
        ref={ref}
        className={cn(
          'glass fixed z-9999 flex w-[200px] -translate-x-1/2 -translate-y-full cursor-default flex-col gap-[12px] rounded-[6px] p-[12px] text-center duration-200',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-60 opacity-0',
        )}
        style={pos.current}
      >
        {title}
        <div
          className={cn(
            'flex gap-[6px]',
            '*:glass *:flex *:h-[24px] *:flex-1 *:cursor-pointer *:items-center *:justify-center *:rounded-full *:text-[12px]',
          )}
        >
          <div className="opacity-50" onClick={onClose}>
            Cancel
          </div>
          <div
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            Confirm
          </div>
        </div>
      </div>
    </>
  );
};
