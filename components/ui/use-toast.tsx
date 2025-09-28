'use client';

import { toast as s } from 'sonner';

export type ToastProps = {
  title?: string;
  description?: string;
  duration?: number; // ms
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning';
};

export function useToast() {
  const toast = (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return s(props);
    }
    const {
      title = '',
      description,
      duration,
      variant = 'default',
    } = props;

    // маппим variants на методы sonner
    switch (variant) {
      case 'destructive':
        return s.error(title, { description, duration });
      case 'success':
        return s.success(title, { description, duration });
      case 'info':
        return s.info(title, { description, duration });
      case 'warning':
        return s.warning(title, { description, duration });
      default:
        return s(title, { description, duration });
    }
  };

  return {
    toast,
    // прямые хелперы тоже пригодятся
    success: (title: string, opts?: { description?: string; duration?: number }) =>
      s.success(title, opts),
    error: (title: string, opts?: { description?: string; duration?: number }) =>
      s.error(title, opts),
    info: (title: string, opts?: { description?: string; duration?: number }) =>
      s.info(title, opts),
    warning: (title: string, opts?: { description?: string; duration?: number }) =>
      s.warning(title, opts),
    dismiss: s.dismiss,
  };
}
