import React from 'react';
import { useModal } from 'lib/hooks/useModal';
import { useControls } from "react-zoom-pan-pinch";
import { Coordinate } from 'lib/PDF_Quiz_Types';

interface FlotingBtnsProps {
    nowPage?: number;
    maxPageNumber?: number;
    handleChangePage?: (direction: string) => void;

    onCloseCallback?: () => void;
    showFloating?: boolean;
    tempAOI:Coordinate[][];
    handleSolveQuiz:(oneAOI: Coordinate, pageIndex: number, aoiIndex: number)=>void;
}
type noAnswer={ 
    name:string;
    aoiNumber:number;
    pageNumber:number;
};

const FloatingBtns: React.FC<FlotingBtnsProps> = ({ handleSolveQuiz,tempAOI,nowPage, maxPageNumber, handleChangePage, onCloseCallback, showFloating }) => {
    const { showModal } = useModal();
    const { zoomIn, zoomOut, resetTransform } = useControls();


    return (<>
        <div className="floating floating_status"
            style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            onMouseDown={(e)=>{
                
                e.stopPropagation();
            }}
        >{`${nowPage} / ${maxPageNumber}`}
        </div>

        <div className="floating floating_zoomin" 
             style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            onMouseDown={(e)=>{
                
                e.stopPropagation();
            zoomIn();
        }}>
            확대
        </div>
        <div className="floating floating_reset" 
             style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            onMouseDown={(e)=>{
                e.stopPropagation();
                resetTransform();
        }}>
            원래대로
        </div>
        <div className="floating floating_zoomout" 
             style={{
                opacity: showFloating ? 1 : 0,
                transition: "100ms"

            }}
            onMouseDown={(e)=>{
                
                e.stopPropagation();
                zoomOut();
        }}>
            축소
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
                //tempAOI에있는거확인
        
                const noAnswerArr:noAnswer[] = tempAOI.flatMap((onePageAOI, pageIndex) => 
                    onePageAOI.map((oneAOI, aoiIndex) => {
                        if (!oneAOI.answer) {
                            return {
                                name: oneAOI.name,
                                aoiNumber: aoiIndex+1,
                                pageNumber: pageIndex+1
                            };
                        } else {
                            return null;
                        }
                    }).filter(oneAOI => oneAOI !== null) as noAnswer[]
                );
                // console.log("res",noAnswerArr)
                if(noAnswerArr.length){
                    
                    // noAnswerArr[n].name~
                    //handleSolveQuiz
                    
                    showModal(
                        <div style={{minWidth:"200px"}}>
                            <h2>미응답 문제가 있습니다</h2>
                            {noAnswerArr.map((d: noAnswer, index) => (
                                <p key={`nowAnswer_${index}`}
                                onClick={() => handleSolveQuiz(tempAOI[d.pageNumber - 1][d.aoiNumber - 1], d.pageNumber - 1, d.aoiNumber - 1)}
                                style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}

                                >{d.name}</p>
                            ))}
                            <p>그래도 응시를 종료하시겠습니까?</p>
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

                }   
                else{
                    showModal(
                        <div style={{minWidth:"200px"}}>
                            <h2>측정저장</h2>
                            <p>측정을 저정하고 종료하시겠습니까?</p>
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
                }
        
            }}>
            종료
        </button>
    </>)
}
export default FloatingBtns;