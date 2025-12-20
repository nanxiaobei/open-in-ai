import canvasConfetti from 'canvas-confetti';

export const confetti = (options: Omit<canvasConfetti.Options, 'zIndex'>) => {
  canvasConfetti({ zIndex: 999999999, ...options });
};
