import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import _ from "lodash";
import "./PDF_Enroll_Quiz.scss";
import * as pdfjsLib from 'pdfjs-dist';
import type {
    PercentPageDataType
    // ,PreparedPageType
    , PDF_Enroll_QuizProps, PreviewPage,
    PDFdynamicAllPageInstance,Coordinate,
    preparePage
} from './PDF_Quiz_Types';
import PDFpreview from "./PDFpreview";
import { PDFPageProxy, RenderParameters } from "pdfjs-dist/types/display/api";
import PDFTopBar from "./PDFTopbar";
import PDFdynamicAllPage from "./PDFdynamicAllPage";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;


const PDF_Enroll_Quiz: React.FC<PDF_Enroll_QuizProps> = (props) => {
    const { className, AOI
        , pdfInform, previewOption, option, path, PDFDocumentOnLoadCallback } = props;
    const initFileName = pdfInform?.fileName || "임시파일이름";

    const [pages, setPages] = useState<PDFPageProxy[]|null>(null);
    const documentRef = useRef<HTMLDivElement>(null);
    const dynamicAllPageRef = useRef<PDFdynamicAllPageInstance>(null);

    const [preparedPreviewPages, set_preparedPreviewPages] = useState<PreviewPage[]>();
    const [percentPagesData, set_percentPagesData] = useState<PercentPageDataType[]>();


    const [tempAOI, set_tempAOI] = useState<Coordinate[][]>([]);
    const [hideAOIPageListArr, set_hideAOIPageListArr] = useState<any[]>([]);
    const [AOI_mode, set_AOI_mode] = useState<number>(0); // 0 아님, 1Quiz,2글,3사진,표
    const [selAOI, set_selAOI] = useState<any>();
    // console.log("hideAOIPageListArr",hideAOIPageListArr)


    const [leftPreviewShow, set_leftPreviewShow] = useState(previewOption && previewOption.initLeftPreviewshow ? previewOption.initLeftPreviewshow : false);
    const [viewPercent, set_viewPercent] = useState(option.initViewPercent ? option.initViewPercent : '100%');
    const [nowPage, set_nowPage] = useState<number>(1);
    const [fileName, set_fileName] = useState(initFileName);
    const maxPageNumber = useMemo(() => {
        if (pages) {
            return pages.length;
        }
        else {
            return 0;
        }
    }, [pages])
    const [foldAOIList, set_foldAOIList] = useState(true);

    useEffect(() => {
        if (selAOI) {
            set_foldAOIList(false);
            set_hideAOIPageListArr((prev: any) => {
                prev[selAOI.pageNumber - 1] = false;
                return JSON.parse(JSON.stringify(prev));
            })
            // set_hideAOIPageListArr(prev => {
            //     if (!prev || !Array.isArray(prev)) {
            //         // If prev is falsy or not an array, initialize a new array
            //         const newHideList = Array(maxPageNumber).fill(true);
            //         newHideList[selAOI.pageNumber - 1] = false;
            //         return newHideList;
            //     }

            //     // prev is truthy and an array, perform the update
            //     const newHideList = [...prev];
            //     newHideList[selAOI.pageNumber - 1] = false;
            //     return newHideList;
            // });
        }
    }, [selAOI])



    useEffect(() => {
        const vacancy: any[] = Array.from({ length: maxPageNumber }, () => []);
        // console.log("vacancy",vacancy)
        /*
        let hideList =[];
        for(let i = 0; i <maxPageNumber; i++){
            hideList[i]=true;
        }
        set_hideAOIPageListArr(hideList);
        */
        const initialHideAOIPageListArr: any[] = Array.from({ length: maxPageNumber }, () => true);
        set_hideAOIPageListArr(initialHideAOIPageListArr);


        if (AOI) {
            set_tempAOI(AOI);
            for (let i = 0; i < vacancy.length; i++) {
                if (AOI[i]) {
                    vacancy[i] = AOI[i];
                }
                set_tempAOI(vacancy);
            }
        }
        else {
            if (maxPageNumber) {
                set_tempAOI(vacancy);
            }
        }

    }, [maxPageNumber, AOI])


    useEffect(() => {
        if (!path) return;

        async function getPDFdocumentByPath() {
            try {
                const loadingTask = await pdfjsLib.getDocument(path);
                const pdf = await loadingTask.promise;

                const pdfInfo = pdf._pdfInfo;
                const pdfPageNumbers = pdfInfo.numPages;
                const loadedPages: PDFPageProxy[] = [];

                for (let i = 1; i <= pdfPageNumbers; i++) {
                    const page: PDFPageProxy = await pdf.getPage(i);
                    loadedPages.push(page);
                }

                setPages(loadedPages);
                if (PDFDocumentOnLoadCallback) {
                    PDFDocumentOnLoadCallback(pdfPageNumbers);
                }

            } catch (error) {
                // 오류 처리
                console.error("PDF 로드 중 오류 발생:", error);
            }
        }

        getPDFdocumentByPath();
    }, [path, PDFDocumentOnLoadCallback]);

    
    const preparePage = useCallback<preparePage>((page, pageNumber, specificSize,renderWidth) => {
        return new Promise(async function (resolve, reject) {



            const shouldPreparePage = page;
            if (!shouldPreparePage) {
                reject({
                    valid: false,
                    msg: "해당 페이지가 존재하지 않음"
                })
                return;
            }
            const pageOriginWidth = shouldPreparePage.view[2];
            const pageOriginHeight = shouldPreparePage.view[3];

            let myscale;
            if (specificSize) {
                myscale = specificSize / pageOriginWidth;
            }
            else {
                myscale = 1 * renderWidth / pageOriginWidth;
            }


            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true });
            const viewport = shouldPreparePage.getViewport({ scale: myscale }); // 원하는 스케일로 조정
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            // console.log("랜더컨택스 완료")
            const resizeRatio = renderWidth / viewport.width;

            await shouldPreparePage.render(renderContext).promise;


            resolve({
                valid: true,
                canvas: canvas,
                // pageNumber: pageNumber,
                // originScale: myscale,
                // PDForiginSize: {
                //     width: pageOriginWidth,
                //     height: pageOriginHeight
                // },
                canvasSize: {
                    width: viewport.width,
                    height: viewport.height
                },
                // wrapperSize: {
                //     resizeRatio: resizeRatio,
                //     width: renderWidth,
                //     height: viewport.height * resizeRatio
                // },
            })
        });


    }, [])
    


    useEffect(() => {
        if (!pages) return;
        if (!previewOption) return;
        if (preparedPreviewPages) return;


        const renderWidth = previewOption.wrapperStyle ? previewOption.wrapperStyle.width - previewOption.pageMargin * 2 : 200;
        // const renderWidth = previewOption.wrapperStyle.width-40;

        prepareAllPage(pages);
        async function prepareAllPage(pages: PDFPageProxy[]) {

            console.log("prepareAllPage목표:", pages);

            const p: Promise<PreviewPage>[] = [];
            for (let i = 0; i < pages.length; i++) {
                p[i] = preparePage2(i + 1, renderWidth);
            }
            Promise.all(p).then((res: PreviewPage[]) => {
                console.log("preparePageRes[]:", res);
                // let preparedPages=res;
                set_preparedPreviewPages(res);

            }).catch(err => {
                console.log("preparePage에러:", err.msg);
                // set_loadingmsg(err.msg);
            })

            function preparePage2(pageNumber: number, specificSize: number) {
                return new Promise<PreviewPage>(function (resolve, reject) {
                    if (!pageNumber) {
                        reject({
                            valid: false,
                            msg: "페이지넘버가 없음"
                        })
                        return;
                    }


                    const shouldPreparePage = pages[pageNumber - 1];
                    if (!shouldPreparePage) {
                        reject({
                            valid: false,
                            msg: "해당 페이지가 존재하지 않음"
                        })
                        return;
                    }
                    const pageOriginWidth = shouldPreparePage.view[2];
                    const pageOriginHeight = shouldPreparePage.view[3];

                    let myscale;
                    if (specificSize) {
                        myscale = specificSize / pageOriginWidth;
                    }
                    else {
                        myscale = 1 * renderWidth / pageOriginWidth;
                    }


                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    const viewport = shouldPreparePage.getViewport({ scale: myscale }); // 원하는 스케일로 조정
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const renderContext: RenderParameters = {
                        canvasContext: context || {},
                        viewport: viewport,
                    };
                    // console.log("랜더컨택스 완료")
                    const resizeRatio = renderWidth / viewport.width;

                    // await shouldPreparePage.render(renderContext).promise;
                    shouldPreparePage.render(renderContext).promise.then(() => {
                        resolve({
                            canvas: canvas,
                            pageNumber: pageNumber,
                            originScale: myscale,
                            PDForiginSize: {
                                width: pageOriginWidth,
                                height: pageOriginHeight
                            },
                            canvasSize: {
                                width: viewport.width,
                                height: viewport.height
                            },
                            wrapperSize: {
                                resizeRatio: resizeRatio,
                                width: renderWidth,
                                height: viewport.height * resizeRatio
                            },
                        })
                    });


                });

            }
        }
    }, [previewOption, pages, preparedPreviewPages])

    const prevRenderWidth = useRef<number>();
    //레프트바의 preview에 대한..설정인데
    useEffect(() => {
        if (!preparedPreviewPages) return;
        const wrapEl: HTMLElement | null = documentRef.current;
        let resizing = false; // Flag to track whether resizing is in progress

        const resizeObserver = new ResizeObserver(entries => {
            // 크기 변경시 실행할 작업을 여기에 작성합니다.
            entries.forEach(() => {
                // console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
                // set_renderWidth(entry.contentRect.width * viewPercent / 100);
                // const contentWidth = wrapEl.offsetWidth;
                // const contentHeight = wrapEl.offsetHeight;

                const intViewPercent = parseInt(viewPercent);
                const sidebarSize = leftPreviewShow ? 150 : 0;
                const renderWidth = (wrapEl!.offsetWidth - sidebarSize) * intViewPercent / 100;

                if (prevRenderWidth.current === renderWidth) {
                    return;
                }
                prevRenderWidth.current = renderWidth;
                // console.log("PDF 크기",renderWidth)
                // console.log('PDF 껍데기의 크기가 변경되었습니다!', contentWidth, contentHeight);
                //   const renderWidth = contentWidth * parseInt(viewPercent) / 100;
                debouncedGeneratePercentPagesData(renderWidth);
            });
        });

        function generatePercentPagesData(renderWidth: number) {
            if (resizing) {
                return; // If resizing is already in progress, return early
            }
            resizing = true; // Set the resizing flag to true
            // console.log("generatePercentPagesData 호출")
            const viewPercentPagesData = [];
            // const intViewPercent = parseInt(viewPercent);
            // const sidebarSize = leftPreviewShow ? 150 : 0;
            // const renderWidth = (wrapEl.offsetWidth - sidebarSize) * intViewPercent / 100;
            // console.log("renderWidth",renderWidth)
            let hs = 0;
            if (preparedPreviewPages) {
                for (let i = 0; i < preparedPreviewPages.length; i++) {
                    const onePage = preparedPreviewPages[i];
                    const { PDForiginSize } = onePage;
                    const onePageWidth = renderWidth;
                    const onePageHeight = renderWidth * PDForiginSize.height / PDForiginSize.width;
                    const onePageMarginTop = 25;
                    viewPercentPagesData.push({
                        pageNumber: i + 1,
                        bluredCanvas: onePage.canvas,
                        bluredCanvasSize: onePage.canvasSize,
                        width: onePageWidth,
                        height: onePageHeight,
                        marginHeight: onePageMarginTop,
                        viewMinScrollHeight: hs,
                        viewMaxScrollHeight: hs + onePageHeight + onePageMarginTop,
                        // visible: hs >= visibleMin && (hs + onePageHeight) <= visibleMax ? true : false
                    });

                    hs = hs + onePageHeight + onePageMarginTop;
                }
            }

            set_percentPagesData(viewPercentPagesData);
            resizing = false;
        }
        const debouncedGeneratePercentPagesData = _.debounce((arg) => {
            generatePercentPagesData(arg)
        }, 300);

        if(wrapEl){
            resizeObserver.observe(wrapEl);
        }

        return () => {
            resizeObserver.disconnect();
        }
    }, [preparedPreviewPages, viewPercent, leftPreviewShow])




    if(!path){
        return <div className="LoadingScreen">PDF 파일을 등록해주세요...</div>
    }


    return (<div className={`PDF_Enroll_Quiz ${className}`} ref={documentRef}>
        {previewOption && preparedPreviewPages && percentPagesData ?
            <>
                <PDFTopBar
                    dynamicAllPageRef={dynamicAllPageRef}
                    fileName={fileName}
                    set_fileName={set_fileName}
                    AOI_mode={AOI_mode}
                    set_AOI_mode={set_AOI_mode}
                    viewPercent={viewPercent}
                    set_viewPercent={set_viewPercent}
                    maxPageNumber={maxPageNumber}
                    nowPage={nowPage}
            
                    handleChangeNowPage={(p) => {
                        set_nowPage(p)
                    }}
                    set_leftPreviewShow={set_leftPreviewShow}
                />


                <PDFpreview
                    dynamicAllPageRef={dynamicAllPageRef}
                    leftPreviewShow={leftPreviewShow}
                    nowPage={nowPage}
                    previewOption={previewOption}
                    preparedPreviewPages={preparedPreviewPages}
                    handlePreviewChange={(page: number) => {
                        // console.log("pageClick", page);
                        set_nowPage(page);
                    }}
                    hideAOIPageListArr={hideAOIPageListArr}
                    set_hideAOIPageListArr={set_hideAOIPageListArr}
                    tempAOI={tempAOI}
                    selAOI={selAOI}
                    set_selAOI={set_selAOI}
                    foldAOIList={foldAOIList}
                    set_foldAOIList={set_foldAOIList}
                />


                <PDFdynamicAllPage
                    ref={dynamicAllPageRef}
                    leftPreviewShow={leftPreviewShow}
                    percentPagesData={percentPagesData}
                    set_nowPage={set_nowPage}
                    tempAOI={tempAOI}
                    set_tempAOI={set_tempAOI}
                    AOI_mode={AOI_mode}
                    pages={pages}
                    preparePage={preparePage}
      
                    set_selAOI={set_selAOI}
                />
            </>
            :
            <>
                <div className="LoadingScreen">Loading...</div>
            </>
        }
    </div>)
}
export default PDF_Enroll_Quiz;
