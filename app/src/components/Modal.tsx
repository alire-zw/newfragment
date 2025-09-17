import styles from './Modal.module.css';
import { useEffect, useState, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  footerInput?: ReactNode;
  onCancel?: (() => void) | null;
  middleButton?: ReactNode;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'تایید', 
  cancelText = 'لغو',
  confirmDisabled = false,
  footerInput = null,
  onCancel = null,
  middleButton = null
}: ModalProps) {
  
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // تشخیص باز/بسته شدن کیبورد
  useEffect(() => {
    if (!isOpen) return;

    let timeoutId: NodeJS.Timeout;
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      // استفاده از debounce برای جلوگیری از تغییرات مکرر
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        
        // تشخیص دقیق‌تر: اگر ارتفاع بیش از 150 پیکسل کم شده باشه
        const heightDifference = initialHeight - currentHeight;
        const keyboardIsOpen = heightDifference > 150;
        
        setIsKeyboardOpen(keyboardIsOpen);
      }, 50); // تاخیر کوتاه برای نرم‌تر شدن
    };

    // استفاده از visualViewport اگر موجود باشه (پشتیبانی بهتر از کیبورد)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // چک اولیه
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isOpen]);
  
  // بستن مودال با کلید Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.modalOverlay} ${isKeyboardOpen ? styles.keyboardAdjusted : ''}`} 
      onClick={onClose}
    >
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button 
            type="button" 
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <span className={styles.modalCloseX}>
              <svg 
                fillRule="evenodd" 
                viewBox="64 64 896 896" 
                focusable="false" 
                width="1em" 
                height="1em" 
                fill="currentColor"
              >
                <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
              </svg>
            </span>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {children}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          {footerInput && (
            <div className={styles.footerInput}>
              {footerInput}
            </div>
          )}
          <div className={styles.footerButtons}>
            {cancelText && (
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnDefault}`}
                onClick={onCancel || onClose}
              >
                {cancelText}
              </button>
            )}
            {middleButton && middleButton}
            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
