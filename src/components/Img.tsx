import { cn } from '@/utils/cn';
import { emit } from '@/utils/event';
import { CSSProperties, HTMLProps, useRef, useState } from 'react';

const cacheMap: Record<string, string> = {};

export const Img = ({
  src,
  className,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & { src: undefined | string }) => {
  const [url, setUrl] = useState('');
  const prevSrc = useRef('');

  if (src && prevSrc.current !== src) {
    prevSrc.current = src;

    if (src in cacheMap) {
      setUrl(cacheMap[src]);
    } else {
      const newSrc = src.startsWith('http') ? src : chrome.runtime.getURL(src);
      emit('bg', 'getBase64', newSrc).then((base64) => {
        cacheMap[src] = base64;
        setUrl(cacheMap[src]);
      });
    }
  }

  return (
    <div
      className={cn('img', className)}
      style={
        {
          ...style,
          backgroundImage: `url(${url})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } as CSSProperties
      }
      {...props}
    />
  );
};
