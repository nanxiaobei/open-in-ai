import { Img } from '@/components/Img';
import { nameMap, urlMap, useStore } from '@/store';
import { cn } from '@/utils/cn';
import { emit } from '@/utils/event';
import { getUrl } from '@/utils/getUrl';
import { Reorder } from 'motion/react';
import { useEffect, useRef } from 'react';
import './Content.css';

function Content() {
  const { state, setHistory } = useStore();
  const {
    popList,
    popMap,
    popLarge,
    popDark,
    popText,
    popUppercase,
    authData,
  } = state;

  const isAuthed = Boolean(authData && !authData.error);
  const isError = Boolean(authData && authData.error);

  const popEl = useRef<HTMLDivElement | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isPopClose = useRef(false);

  const selectionRef = useRef<Selection | null>(null);
  const textRef = useRef('');
  const isOpen = useRef(false);

  const onClose = () => {
    startPos.current = null;
    Object.assign(popEl.current!.style, {
      pointerEvents: 'none',
      opacity: 0,
      scale: 'var(--scale-close)',
    });
    setTimeout(() => {
      popEl.current!.dataset.open = '';
    }, 10);
  };

  const onPopClose = () => {
    isPopClose.current = true;
    selectionRef.current?.removeAllRanges();
    setTimeout(() => {
      onClose(); // for better ux
    }, 50);
  };

  useEffect(() => {
    let timerId: number | null = null;
    let rafId: number | null = null;

    const onSelect = (delay: number) => {
      if (timerId) {
        clearTimeout(timerId);
      }

      timerId = window.setTimeout(() => {
        if (isPopClose.current) {
          isPopClose.current = false;
          return;
        }

        selectionRef.current = window.getSelection();

        if (selectionRef.current) {
          textRef.current = selectionRef.current.toString().trim();

          if (textRef.current) {
            if (!selectionRef.current.isCollapsed) {
              isOpen.current = true;
              const rect = selectionRef.current
                .getRangeAt(0)
                .getBoundingClientRect();

              startPos.current = { x: window.scrollX, y: window.scrollY };
              Object.assign(popEl.current!.style, {
                pointerEvents: 'auto',
                opacity: 1,
                scale: 'var(--scale-open)',
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.bottom + 8}px`,
                translate: '-50% 0',
              });
              setTimeout(() => {
                popEl.current!.dataset.open = 'true';
              }, 10);
            }
          } else {
            if (isOpen.current) {
              isOpen.current = false;
              onClose();
            }
          }
        }
      }, delay);
    };

    const onMouseUp = () => onSelect(200);
    const onKeyUp = () => onSelect(10);
    const onScroll = () => {
      if (!startPos.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const dx = startPos.current!.x - window.scrollX;
        const dy = startPos.current!.y - window.scrollY;
        popEl.current!.style.translate = `calc(${dx}px - 50%) ${dy}px`;
        rafId = null;
      });
    };
    const onPopMouseDown = (event: MouseEvent) => event.preventDefault();

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    popEl.current?.addEventListener('mousedown', onPopMouseDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('scroll', onScroll);
      popEl.current?.removeEventListener('mousedown', onPopMouseDown);
    };
  }, []);

  const isDrag = useRef(false);

  return (
    <Reorder.Group
      as="div"
      ref={popEl}
      className={cn(
        'pop-list glass',
        popLarge ? 'large' : '',
        popDark ? 'dark' : '',
        popText ? 'text' : '',
        popUppercase ? 'uppercase' : '',
      )}
      axis="x"
      values={popList}
      onReorder={(newList) => {
        if (isAuthed) {
          setHistory({ popList: newList });
        }
      }}
    >
      {popList.map((type) => {
        const show = popMap[type];
        const text = nameMap[type];

        if (!show) {
          return (
            <Reorder.Item
              key={type}
              as="div"
              layout="position"
              value={type}
              className="hide"
            />
          );
        }

        return (
          <Reorder.Item
            key={type}
            as="div"
            layout="position"
            value={type}
            title={popText ? undefined : text}
            {...(isAuthed
              ? {
                  onDragStart: () => {
                    isDrag.current = true;
                  },
                  onDragEnd: () => {
                    setTimeout(() => {
                      isDrag.current = false;
                    }, 10);
                  },
                }
              : undefined)}
          >
            <Img
              src={`/${type}.svg`}
              onClick={() => {
                if (isError) {
                  emit('bg', 'toggleSide');
                  return;
                }

                if (isAuthed && !isDrag.current) {
                  onPopClose();

                  if (type === 'copy') {
                    navigator.clipboard.writeText(textRef.current);
                  } else {
                    let url = getUrl(textRef.current);
                    if (!url) {
                      const str = new URLSearchParams({
                        q: textRef.current,
                      }).toString();
                      url = `${urlMap[type]}${str.slice(2)}`;
                    }
                    emit('bg', 'createTab', url);
                  }
                }
              }}
            >
              {text}
            </Img>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}

export default Content;
