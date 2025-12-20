import { Img } from '@/components/Img';
import { cn } from '@/utils/cn';
import { Reorder, useDragControls } from 'motion/react';
import type { ComponentProps } from 'react';

export const MoveItem = (
  props: { disabled?: boolean } & Omit<
    ComponentProps<typeof Reorder.Item<unknown, 'div'>>,
    'as' | 'dragListener' | 'dragControls'
  >,
) => {
  const { className, children, disabled, ...restProps } = props;
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      className={cn('relative select-none [--drag-w:36px]', className)}
      dragListener={false}
      dragControls={disabled ? undefined : controls}
      {...restProps}
    >
      {children}
      <Img
        className={cn(
          'absolute inset-y-0 left-0 w-(--drag-w) bg-size-[14px]! opacity-40',
          disabled ? '' : 'hover:cursor-grab active:cursor-grabbing',
        )}
        src="/drag.png"
        onPointerDown={disabled ? undefined : (event) => controls.start(event)}
      />
    </Reorder.Item>
  );
};
