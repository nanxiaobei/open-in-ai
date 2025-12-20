import { cn } from '@/utils/cn';
import './Loading.css';

export const Loading = ({ className }: { className?: string }) => {
  return (
    <div className={cn('loading', className)}>
      <div />
      <div />
      <div />
    </div>
  );
};
