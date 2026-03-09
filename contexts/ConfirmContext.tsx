import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface ConfirmContextType {
  confirm: (title: string, message: string) => Promise<boolean>;
  alert: (title: string, message: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const confirm = (title: string, message: string): Promise<boolean> => {
    setIsAlert(false);
    setTitle(title);
    setMessage(message);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const alert = (title: string, message: string): Promise<void> => {
    setIsAlert(true);
    setTitle(title);
    setMessage(message);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => () => resolve());
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        isAlert={isAlert}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
