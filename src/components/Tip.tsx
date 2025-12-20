import { Toaster, ToasterProps } from 'sonner';

export const Tip = (
  props: Omit<ToasterProps, 'position' | 'toastOptions' | 'richColors'>,
) => {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{ duration: 1500 }}
      {...props}
    />
  );
};
