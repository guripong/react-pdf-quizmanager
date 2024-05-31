
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { PDFPlayQuizProps, PreRenderedPDFPage } from "../PDF_Quiz_Types";
import usePDFLoader from "../hooks/usePDFLoader";
import { PDFPageProxy } from "pdfjs-dist/types/display/api";
const PDFPlayQuiz: React.FC<PDFPlayQuizProps> = (props) => {
    const { AOI, path, PDFDocumentOnLoadCallback ,
        onCloseCallback 
        ,onSaveCallback} = props;

    const {pages,maxPageNumber,preparePage}=usePDFLoader(path,PDFDocumentOnLoadCallback);
    const [preparedPage,set_preparedPage] = useState<PreRenderedPDFPage[]>();


    //전체페이지 로딩까지 기다리는방식 채택

    const PDFPlayQuizRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!pages) return;
        if (preparedPage) return;

        //전체화면이 아닐경우 기다려버려라.
        console.log("@@@@@@@@@@@@@@@미리보기 페이지 생성 관련이슈체크");
        const aimRenderWidthOfPreviewPage = 200;
        // const renderWidth=200;
        
        prepareAllPage(pages);
        function prepareAllPage(pages: PDFPageProxy[]) {
            console.log("prepareAllPage목표:", pages);
            const p: Promise<PreRenderedPDFPage>[] = [];
            for (let i = 0; i < pages.length; i++) {
                p[i] = preparePage(pages[i],i + 1, aimRenderWidthOfPreviewPage);
            }

            Promise.all(p).then((preparedPDFPages: PreRenderedPDFPage[]) => {
                console.log("preparedPDFPages[]:", preparedPDFPages);
                // let preparedPages=res;
                set_preparedPage(preparedPDFPages);

            }).catch(err => {
                console.log("preparePage에러:", err.msg);
                // set_loadingmsg(err.msg);
            })
        }
    }, [ pages,preparedPage,preparePage])

    return (<div className="PDFPlayQuiz" ref={PDFPlayQuizRef}>
        asf
    </div>)

}
export default PDFPlayQuiz;