import React from 'react';
import { useModal } from 'lib/hooks/useModal';
import { useControls } from "react-zoom-pan-pinch";

interface FlotingBtnsProps {
    nowPage?: number;
    maxPageNumber?: number;
    handleChangePage?: (direction: string) => void;

    onCloseCallback?: () => void;
    showFloating?: boolean;
}


const FloatingBtns: React.FC<FlotingBtnsProps> = ({ nowPage, maxPageNumber, handleChangePage, onCloseCallback, showFloating }) => {
    const { showModal } = useModal();
    const { /*zoomIn, zoomOut,*/ resetTransform } = useControls();


    return (<>
        <div className="floating floating_status"
            style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            onMouseDown={()=>{
                resetTransform();
            }}
        >{`${nowPage} / ${maxPageNumber}`}
    
        </div>
        <button className="floating floating_left"
            style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms",
                display:`${nowPage&&nowPage <= 1?"none":""}`
            }}
            onMouseDown={(e) => {
 
                e.stopPropagation();
                // console.log("왼")
                if(handleChangePage){
                    handleChangePage("left");
                    // console.log("왼쪽")
                }

                }}>
            {'<'}
        </button>
        <button className="floating floating_right"
            style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms",
                display:`${maxPageNumber&&nowPage&&maxPageNumber > nowPage?"":"none"}`
            }}
            onMouseDown={(e)=>{
 
            
                e.stopPropagation();
                // console.log("오른")
                if(handleChangePage){
                    handleChangePage("right")
                }


             }}
                >
            {'>'}
        </button>

        <button
            style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            className="floating floating_down" onMouseDown={(e) => {
                e.stopPropagation();

                //아직안푼게 남았는데 종효할래?
                
                showModal(
                    <div style={{minWidth:"200px"}}>
                        <h2>측정중단</h2>
                        <p>중단하시겠습니까?</p>
                    </div>,
                    () => {
                        if (onCloseCallback) {
                            onCloseCallback()
                        }
                    },
                    () => {
                        // console.log("중단취소")
                    }
                );
            }}>
            종료
        </button>
    </>)
}
export default FloatingBtns;