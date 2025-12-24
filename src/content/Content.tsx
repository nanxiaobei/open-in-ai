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
  const selectionRef = useRef<Selection | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const textRef = useRef('');
  const isOpen = useRef(false);
  const isManualClosed = useRef(false);

  const onClose = () => {
    isOpen.current = false;
    Object.assign(popEl.current!.style, {
      pointerEvents: 'none',
      opacity: 0,
      scale: 'var(--scale-close)',
    });
    setTimeout(() => {
      popEl.current!.dataset.view = '';
    }, 10);
  };

  useEffect(() => {
    let timerId: number | null = null;
    let rafId: number | null = null;

    const onSelect = (delay: number) => {
      if (timerId) {
        clearTimeout(timerId);
      }

      timerId = window.setTimeout(() => {
        if (isManualClosed.current) {
          isManualClosed.current = false;
          return;
        }

        selectionRef.current = window.getSelection();

        if (selectionRef.current) {
          textRef.current = selectionRef.current.toString().trim();

          if (textRef.current) {
            if (!selectionRef.current.isCollapsed) {
              isOpen.current = true;
              rangeRef.current = selectionRef.current.getRangeAt(0);
              const rect = rangeRef.current.getBoundingClientRect();

              Object.assign(popEl.current!.style, {
                pointerEvents: 'auto',
                opacity: 1,
                scale: 'var(--scale-open)',
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.bottom + 8}px`,
              });
              setTimeout(() => {
                popEl.current!.dataset.view = 'open';
              }, 10);
            }
          } else {
            if (isOpen.current) {
              onClose();
            }
          }
        }
      }, delay);
    };

    const onMouseUp = () => onSelect(200);
    const onKeyUp = () => onSelect(10);
    const onPosition = () => {
      if (isOpen.current) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = rangeRef.current!.getBoundingClientRect();
          Object.assign(popEl.current!.style, {
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.bottom + 8}px`,
          });
          rafId = null;
        });
      }
    };
    const onPopMouseDown = (event: MouseEvent) => event.preventDefault();

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('scroll', onPosition, { passive: true });
    window.addEventListener('resize', onPosition);
    popEl.current?.addEventListener('mousedown', onPopMouseDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('scroll', onPosition);
      window.removeEventListener('resize', onPosition);
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
        isError ? 'error' : '',
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
            dragListener={isAuthed}
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
                  isManualClosed.current = true;
                  selectionRef.current?.removeAllRanges();

                  if (type === 'copy') {
                    navigator.clipboard.writeText(textRef.current);
                    setTimeout(() => onClose(), 50); // for better ux
                  } else {
                    popEl.current!.dataset.view = 'jump';
                    onClose();
                    let url = getUrl(textRef.current);
                    if (!url) {
                      const str = new URLSearchParams({
                        q: textRef.current,
                      }).toString();
                      url = `${urlMap[type]}${str.slice(2)}`;
                    }
                    setTimeout(() => {
                      emit('bg', 'createTab', url);
                    }, 10);
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
