
import type { Coordinate } from "lib/PDF_Quiz_Types";

import React, { RefObject, useEffect, useState } from "react";
// import { Rnd } from "react-rnd";

interface OnequizProps {
    pageIndex: number;
    aoiIndex: number;
    oneAOI: Coordinate;
    containerRef: RefObject<HTMLDivElement>;
    handleSolveQuiz:(AOI:Coordinate,pageIndex:number,areaIndex:number)=>void;
    onChangeOneAOI:(targetChangeAOI:Coordinate,pageIndex:number,areaIndex:number)=>void;
}

const OneQuiz: React.FC<OnequizProps> = (props) => {
    const { oneAOI, pageIndex, aoiIndex, containerRef ,onChangeOneAOI,handleSolveQuiz} = props;
    // console.log("containerRef", containerRef)
    // console.log("oneAOI", oneAOI)

    const [cropRenderSize, setCropRenderSize] = useState({
        width: oneAOI.width + "%",
        height: oneAOI.height + "%",
        x: containerRef.current ? oneAOI.x / 100 * containerRef.current.offsetWidth : 0,
        y: containerRef.current ? oneAOI.y / 100 * containerRef.current.offsetHeight : 0,
        isAnswered: oneAOI.answer ? true : false
    })

    useEffect(() => {
        if (!containerRef.current) return;
        const wrapEl = containerRef.current;



        const resizeObserver = new ResizeObserver(entries => {
            // 크기 변경시 실행할 작업을 여기에 작성합니다.
            entries.forEach((/*entry*/) => {
                // console.log("resize에따라서 실제 cropRenderSize재할당")
                //   console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
                // set_renderWidth(entry.contentRect.width * viewPercent / 100);
                // const contentWidth = wrapEl.offsetWidth;
                // const contentHeight = wrapEl.offsetHeight;
                // debouncedResetContainerInform();
                setCropRenderSize({
                    width: oneAOI.width + "%",
                    height: oneAOI.height + "%",
                    x: containerRef.current ? oneAOI.x * containerRef.current.offsetWidth / 100 : 0,
                    y: containerRef.current ? oneAOI.y * containerRef.current.offsetHeight / 100 : 0,
                    isAnswered: oneAOI.answer ? true : false
                });
                // handleTestLoad();
            });
        });

        resizeObserver.observe(wrapEl);
        return () => {
            resizeObserver.disconnect();
        }

    }, [containerRef, oneAOI])





    
    // console.log("cropRenderSize", cropRenderSize)
    return (<div className="OneQuiz" 
        onClick={()=>{
            // e.stopPropagation();
            handleSolveQuiz(oneAOI,pageIndex,aoiIndex)
        }}

        style={{
            width: cropRenderSize.width,
            height: cropRenderSize.height,
            left: cropRenderSize.x + "px",
            top: cropRenderSize.y + "px",
            position: "absolute",
            background: cropRenderSize.isAnswered?"":"",
            border:cropRenderSize.isAnswered?"2px dashed rgb(101, 199, 101)":""
        }}

    >

        <div className="oneQuizRelativeWrap">
            <div className="choosedAnswer">
             {oneAOI.answer}
            </div>

        </div>

    </div>)
}
export default OneQuiz;