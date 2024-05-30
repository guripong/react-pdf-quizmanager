import React, { createContext, useContext, useState, ReactNode } from 'react';
import "./Modal.scss";
interface ModalContextType {
  showModal: (content: ReactNode, onConfirm?: () => void, onCancel?: () => void) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [onCancel, setOnCancel] = useState<(() => void) | null>(null);
    console.log("랜더");
  const showModal = (content: ReactNode, 
    onConfirm?: () => void, 
    onCancel?: () => void) => {

    setContent(content);
    setOnConfirm(() => onConfirm || null);
    setOnCancel(() => onCancel || null);
    setIsVisible(true);

  };

  const hideModal = () => {
    setIsVisible(false);
    setContent(null);
    setOnConfirm(null);
    setOnCancel(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (onCancel) {
        onCancel();
      }
      hideModal();
    }
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {isVisible && content && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal">
            <div className="modal-content">
              {content}
            </div>
            <div className="modal-actions">
              {onConfirm && (
                <button onClick={() => { 
                    onConfirm();
                     hideModal(); 
                }} className="modal-button confirm">네</button>
              )}
              {onCancel && (
                <button onClick={() => { 
                    onCancel(); 
                    hideModal(); 
                }} className="modal-button cancel">아니요</button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
