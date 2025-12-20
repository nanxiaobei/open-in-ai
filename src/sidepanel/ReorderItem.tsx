import { Img } from '@/components/Img';
import { cn } from '@/utils/cn';
import { Reorder, useDragControls } from 'motion/react';
import type { ComponentProps } from 'react';

export const ReorderItem = (
  props: Omit<
    ComponentProps<typeof Reorder.Item<unknown, 'div'>>,
    'as' | 'dragListener' | 'dragControls'
  >,
) => {
  const { className, children, ...restProps } = props;
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      className={cn('relative select-none [--drag-w:36px]', className)}
      dragListener={false}
      dragControls={controls}
      {...restProps}
    >
      {children}
      <Img
        className="absolute inset-y-0 left-0 w-(--drag-w) bg-size-[14px]! opacity-40 hover:cursor-grab active:cursor-grabbing"
        src="/drag.png"
        onPointerDown={(event) => controls.start(event)}
      />
    </Reorder.Item>
  );
};
