import React, { createContext, useContext, useState, ReactNode } from 'react';
import "./Modal.scss";
import FloatingBtns from 'lib/pdfplayquiz/FloatingBtns';
import { floatingProps } from 'lib/PDF_Quiz_Types';
interface ModalContextType {
  showModal: (content: ReactNode, 
    onConfirm?: () => void,
    onCancel?: () => void,
    btnNameArr?: string[]
  ) => void,
  

  hideModal: () => void;
  showDefaultModal: (obj: floatingProps) => void;

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
  // console.log("랜더onConfirm",onConfirm);

  const [btnNameArr,set_btnNameArr] = useState<string[] | null>(null);


  const showDefaultModal = (obj: floatingProps) => {

    setOnConfirm(() => onConfirm || null);
    setOnCancel(() => onCancel || null);
    setIsVisible(true);
  }

  const showModal = (content: ReactNode,
    confirmAction?: () => void,
    cancelAction?: () => void,
    btnNameArr?:string[]) => {
    set_btnNameArr(btnNameArr || null);
    setContent(content);
    setOnConfirm(() => confirmAction || null);
    setOnCancel(() => cancelAction || null);
    setIsVisible(true);

  };

  const hideModal = () => {

    setIsVisible(false);
    setContent(null);
    setOnConfirm(null);
    setOnCancel(null);
    set_btnNameArr(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (onCancel) {
        onCancel();
      }
      hideModal();
    }
  };
  // console.log("showDefault", showDefault)
  const contextValue: ModalContextType = {
    // 다른 함수들...
    showModal, hideModal, showDefaultModal 

  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}



      {isVisible && (content) && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal" style={{
            padding:content?"20px":""
          }}>
            <div className="modal-content">
              {content}
            </div>
            <div className="modal-actions">
              {onConfirm && (
                <button onClick={() => {
                  onConfirm();
                  hideModal();
                }} className="modal-button confirm">
                  {btnNameArr&&btnNameArr[0]?btnNameArr[0]:'네'}</button>
              )}
              {onCancel && (
                <button onClick={() => {
                  onCancel();
                  hideModal();
                }} className="modal-button cancel"> {btnNameArr&&btnNameArr[1]?btnNameArr[1]:'아니요'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
