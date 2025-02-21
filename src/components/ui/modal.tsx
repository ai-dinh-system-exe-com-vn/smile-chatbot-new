'use client';

import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        )}
        {title && (
          <h3 className="font-bold text-lg mb-4">{title}</h3>
        )}
        <div className={cn('mt-2', className)}>
          {children}
        </div>
      </div>
      <div className="modal-backdrop bg-neutral/50 cursor-pointer" onClick={onClose} />
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'error';
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="mt-2">{children}</div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={cn('btn', {
              'btn-primary': variant === 'primary',
              'btn-secondary': variant === 'secondary',
              'btn-accent': variant === 'accent',
              'btn-error': variant === 'error',
            })}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}