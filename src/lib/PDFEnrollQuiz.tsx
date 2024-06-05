import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import _ from "lodash";
import "./PDFEnrollQuiz.scss";


import PDFpreview from "./PDFpreview";
import PDFTopBar from "./PDFTopbar";
import PDFdynamicAllPage from "./PDFdynamicAllPage";
import { produce } from 'immer';

import type {
    PercentPageDataType
    , PDFEnrollQuizProps, PreRenderedPDFPage,
    PDFdynamicAllPageInstance, Coordinate,
    AOIProps
} from './PDF_Quiz_Types';
import type { PDFPageProxy } from "pdfjs-dist/types/display/api";
import usePDFLoader from "./hooks/usePDFLoader";
import { ModalProvider } from "./hooks/useModal";
import Loading from "./components/loading/Loading";
import PDFPlayQuiz from "./pdfplayquiz/PDFPlayQuiz";



const PDFEnrollQuiz: React.FC<PDFEnrollQuizProps> = (props) => {
    const { className, AOI  
        , pdfInform, option, path, PDFDocumentOnLoadCallback, onCloseCallback, onSaveCallback } = props;

    const { pages, maxPageNumber, preparePage } = usePDFLoader(path, PDFDocumentOnLoadCallback);

    const previewOption = useMemo(() => {
        const defaultPreviewOption = {
            initLeftPreviewshow: true,
            pageMargin: 40,
            wrapperStyle: {
                position: "absolute",
                left: 0,
                width: 150,
            }
        }
        return {
            ...defaultPreviewOption,
            ...option?.previewOption,
            wrapperStyle: {
                ...defaultPreviewOption.wrapperStyle,
                ...option?.previewOption?.wrapperStyle,
            },
        };
    }, [option]);


    const initFileName = pdfInform?.fileName || "임시파일이름";


    const documentRef = useRef<HTMLDivElement>(null);
    const dynamicAllPageRef = useRef<PDFdynamicAllPageInstance>(null);

    const [preparedPreviewPages, set_preparedPreviewPages] = useState<PreRenderedPDFPage[]>();
    const [percentPagesData, set_percentPagesData] = useState<PercentPageDataType[]>();


    //가장 처음 init 으로 받은 AOI는 여기에 저장됩니다
    const [tempAOI, set_tempAOI] = useState<Coordinate[][]>([]);


    //처음에는 preview의 AOI리스트가 모두 숨겨져있다..
    const [hideAOIPageListArr, set_hideAOIPageListArr] = useState<boolean[]>([]);

    //마우스드래그시 객관식이나 주관식이 생성됨
    const [AOI_mode, set_AOI_mode] = useState<number>(0); // 0 아님, 1객관식,2주관식


    const [selAOI, set_selAOI] = useState<AOIProps | null>(null);
    // console.log("hideAOIPageListArr",hideAOIPageListArr)


    const [leftPreviewShow, set_leftPreviewShow] = useState(previewOption.initLeftPreviewshow ?? false);
    const [viewPercent, set_viewPercent] = useState(option?.pageViewOption?.initViewPercent ?? '100%');
    const [nowPage, set_nowPage] = useState<number>(1);
    const [fileName, set_fileName] = useState(initFileName);


    //AreaList  AOI2차원배열 previewList를 default로 접어둠
    const [foldAOIList, set_foldAOIList] = useState(true);

    useEffect(() => {
        if (selAOI && selAOI.pageNumber) {
            set_foldAOIList(false);

            set_hideAOIPageListArr(prev =>
                produce(prev, draft => {
                    draft[selAOI.pageNumber - 1] = false;
                })
            );
        }
    }, [selAOI])



    //page수에 맞춰서 tempAOI 2차원배열 생성
    useEffect(() => {
        const vacancy: Coordinate[][] = Array.from({ length: maxPageNumber }, () => []);
        const initialHideAOIPageListArr: boolean[] = Array.from({ length: maxPageNumber }, () => true);
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


    // const [pages, setPages] = useState<PDFPageProxy[]|null>(null);
    //path로 부터 PDF page들을 읽습니다 PDFPageProxy 타입으로.



    //미리보기 페이지들 생성 가장우선..저해상도로 먼저 랜더
    //고정사이즈로 랜더 할까?
    useEffect(() => {
        if (!pages) return;
        if (!previewOption || !previewOption.wrapperStyle || !previewOption.wrapperStyle.width || !previewOption.pageMargin) return;
        if (preparedPreviewPages) return;

        console.log("@@@@@@@@@@@@@@@미리보기 페이지 생성 관련이슈체크");
        const aimRenderWidthOfPreviewPage = previewOption.wrapperStyle.width - 40 - previewOption.pageMargin;
        // const renderWidth=200;

        prepareAllPage(pages);
        function prepareAllPage(pages: PDFPageProxy[]) {
            console.log("prepareAllPage목표:", pages);
            const p: Promise<PreRenderedPDFPage>[] = [];
            for (let i = 0; i < pages.length; i++) {
                p[i] = preparePage(pages[i], i + 1, aimRenderWidthOfPreviewPage);
            }

            Promise.all(p).then((preparedPDFPages: PreRenderedPDFPage[]) => {
                console.log("preparedPDFPages[]:", preparedPDFPages);
                // let preparedPages=res;
                set_preparedPreviewPages(preparedPDFPages);

            }).catch(err => {
                console.log("preparePage에러:", err.msg);
                // set_loadingmsg(err.msg);
            })
        }
    }, [previewOption, pages, preparedPreviewPages, preparePage])


    const prevHighQualityRenderedWidth = useRef<number>();
    //레프트바의 preview에 대한..설정인데
    //1.preparedPreviewPages   미리보기 페이지기 완성된 후에 
    //2.고해상도 page를 준비하기 위한 객체 생성
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
                const sidebarSize = leftPreviewShow ? previewOption.wrapperStyle.width : 0;
                const renderWidth = (wrapEl!.offsetWidth - sidebarSize) * intViewPercent / 100;
                //renderWidth는 고해상도의 실제 width를 의미

                if (prevHighQualityRenderedWidth.current === renderWidth) {
                    return;
                }
                prevHighQualityRenderedWidth.current = renderWidth;
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

            //하이랜더 안한 데이터들임
            const viewPercentPagesData: PercentPageDataType[] = [];
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
        }, 100);

        if (wrapEl) {
            resizeObserver.observe(wrapEl);
        }

        return () => {
            resizeObserver.disconnect();
        }
    }, [preparedPreviewPages, viewPercent, leftPreviewShow, previewOption])

    const handleOnSave = useCallback(() => {
        if (onSaveCallback && typeof onSaveCallback === 'function') {
            onSaveCallback(tempAOI, fileName);
        }
    }, [onSaveCallback, tempAOI, fileName]);



    const [showPreview,set_showPreview] = useState(false);
    const handleOpenPreview=()=>{
        // if(onPreviewCallback){
        //     onPreviewCallback({
        //         path:path,
        //         AOI:tempAOI
        //     })
        // }
        set_showPreview(true);
    }


    if (!path) {
        return <div className="LoadingScreen">PDF 파일을 등록해주세요...</div>
    }

    


    return (<><div className={`PDFEnrollQuiz ${className}`} ref={documentRef}>
        <ModalProvider>
            {previewOption && preparedPreviewPages && percentPagesData ?
                <>
                    <PDFTopBar
                        handleOnSave={handleOnSave}
                        onCloseCallback={onCloseCallback}
                        dynamicAllPageRef={dynamicAllPageRef}
                        fileName={fileName}
                        set_fileName={set_fileName}
                        AOI_mode={AOI_mode}
                        set_AOI_mode={set_AOI_mode}
                        viewPercent={viewPercent}
                        set_viewPercent={set_viewPercent}
                        maxPageNumber={maxPageNumber}
                        nowPage={nowPage}
                        handleOpenPreview={handleOpenPreview}
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
                        previewOption={previewOption}
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
                    <Loading />
                </>
            }

        </ModalProvider>

    </div>
       {showPreview&&
          <div style={{  width: '100%', height: '100%',left:0,top:0,position:"fixed", display: "flex", background: "#fff" }}>
          <PDFPlayQuiz
  
            path={path}
            AOI={tempAOI}
  
            onCloseCallback={() => {
               set_showPreview(false);
            }}
  
            onSaveCallback={(newAOI: Coordinate[][]) => {
              // setTempAOI(newAOI);
              console.log("저장할newAOI", newAOI)
              set_showPreview(false);
            }}
  
          />
  
        </div>

       }
    </>
    )
}
export default PDFEnrollQuiz;
