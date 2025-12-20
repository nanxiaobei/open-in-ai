import { RefObject, useEffect, useRef } from 'react';

export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onClick: (event: MouseEvent | TouchEvent) => void,
  enable: boolean = true,
) => {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const enableRef = useRef(enable);
  enableRef.current = enable;

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (enableRef.current) {
        const el = ref.current;
        if (el && !el.contains(event.target as Node)) {
          onClickRef.current(event);
        }
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
};
