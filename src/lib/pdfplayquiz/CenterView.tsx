
import { produce } from 'immer';
import type { Coordinate, PDFPlayQuizProps, PreRenderedPDFPage, floatingProps } from 'lib/PDF_Quiz_Types';
import usePDFLoader from 'lib/hooks/usePDFLoader';
import { PDFPageProxy } from 'pdfjs-dist/types/display/api';
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useMemo } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import OneQuiz from './OneQuiz';
import { useModal } from 'lib/hooks/useModal';
import FloatingBtns from './FloatingBtns';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

const PanningInteractionHandler = (instance: any, state: any) => {
    if (state?.positionX >= 0 && state?.positionY >= 0 && state?.scale <= 1) {
        instance.setup.panning.disabled = true;
    } else {
        instance.setup.panning.disabled = false;
    }
};
const CenterView: React.FC<PDFPlayQuizProps> = (props) => {
    const { AOI, path, PDFDocumentOnLoadCallback,
        onCloseCallback
        , onSaveCallback } = props;
    const { showModal } = useModal();

    const { pages, maxPageNumber, preparePage } = usePDFLoader(path, PDFDocumentOnLoadCallback);
    const [preparedPage, set_preparedPage] = useState<PreRenderedPDFPage[]>();


    //전체페이지 로딩까지 기다리는방식 채택

    const PDFPlayQuizRef = useRef<HTMLDivElement>(null);
    const AOIWrapperRef = useRef<HTMLDivElement>(null);

    const isPreparingPages = useRef<boolean>(false);

    useEffect(() => {
        if (!pages) return;
        if (!PDFPlayQuizRef || !PDFPlayQuizRef.current) return;
        // if (preparedPage) return;
        console.log("isPreparingPages", isPreparingPages)
        //전체화면이 아닐경우 기다려버려라.
        console.log("@@@@@@@@@@@@@@@미리보기 페이지 생성 관련이슈체크");

        // const renderWidth=200;

        const wrapEl = PDFPlayQuizRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            // 크기 변경시 실행할 작업을 여기에 작성합니다.
            entries.forEach((/*entry*/) => {
                // console.log("resize에따라서 실제 cropRenderSize재할당")
                //   console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
                // set_renderWidth(entry.contentRect.width * viewPercent / 100);
                // const contentWidth = wrapEl.offsetWidth;
                // const contentHeight = wrapEl.offsetHeight;
                // debouncedResetContainerInform();
                prepareAllPage(pages, wrapEl.offsetWidth);
                // handleTestLoad();
            });
        });



        function prepareAllPage(pages: PDFPageProxy[], aimsize: number) {
            console.log("prepareAllPage목표:", pages);

            const p: Promise<PreRenderedPDFPage>[] = [];
            for (let i = 0; i < pages.length; i++) {
                p[i] = preparePage(pages[i], i + 1, aimsize);
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

        resizeObserver.observe(wrapEl);
        return () => {
            resizeObserver.disconnect();
        }

    }, [pages, preparePage])


    const [tempAOI, set_tempAOI] = useState<Coordinate[][]>([]);
    useEffect(() => {
        const vacancy: Coordinate[][] = Array.from({ length: maxPageNumber }, () => []);
        const initialHideAOIPageListArr: boolean[] = Array.from({ length: maxPageNumber }, () => true);

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

    const [nowPage, set_nowPage] = useState(1);
    // console.log("preparedPage", preparedPage)

    // console.log("tempAOI", tempAOI)
    const scrollDivRef = useRef<Scrollbars>(null);


    const handleChangePage = (direciton: string) => {
        if (direciton === "right") {
            //오른쪽
            set_nowPage(p => {
                if (p + 1 <= maxPageNumber) {
                    return p + 1;
                }
                else {
                    return p;
                }

            })
        }
        else {
            //왼쪽
            console.log("왼!")
            set_nowPage(p => {
                if (p > 1) {
                    return p - 1;
                }
                else {
                    return p;
                }

            })
        }

    }

    const preparedNowPage = useMemo<PreRenderedPDFPage | null>(() => {
        if (preparedPage && preparedPage[nowPage - 1]) {

            return preparedPage[nowPage - 1]
        }
        else {
            return null;
        }
    }, [preparedPage, nowPage])

    const nowPageAOI = useMemo<Coordinate[] | null>(() => {
        if (tempAOI && tempAOI[nowPage - 1]) {
            return tempAOI[nowPage - 1]
        }
        else {
            return null;
        }
    }, [tempAOI, nowPage])


    const handleChangeOneAOI = (oneAOI: Coordinate, p_i: number, a_i: number) => {
        // changejustOneAOI(pageIndex,)
        //pageIndex,
        // console.log("@@@onChangeOneAOI",oneAOI,pageIndex,areaIndex)
        set_tempAOI((prevTempAOI) => {
            // console.log("prevTempAOI",prevTempAOI);
            // console.log("oneAOI",oneAOI);
            return produce(prevTempAOI, draft => {
                if (oneAOI) {
                    draft[p_i][a_i] = oneAOI;
                }
            });

            // return prevTempAOI;
        });

    }





    const [showPagination, set_showPagination] = useState(false);
    const handleSolveQuiz = (oneAOI: Coordinate, pageIndex: number, aoiIndex: number) => {
        console.log("emfdjdhk")
        set_showPagination(true);

        const btnNameArr: string[] = ["확인", "취소"];
        // handleChangeOneAOI
        if (oneAOI.type === "MC") {


            let selectedAnswer = oneAOI.answer || "1";
            showModal(
                <div>
                    <h2>{oneAOI.name}</h2>
                    <p>객관식 답을 골라주세요</p>
                    <select className="normalSelect"
                        defaultValue={selectedAnswer}
                        onChange={(e) => {
                            selectedAnswer = e.target.value;
                        }}
                    >
                        {/* <option value="0">정답없음</option> */}
                        {[...Array(oneAOI.quizOptionCount).keys()].map((value) => (
                            <option key={value + 1} value={value + 1}>
                                {value + 1}
                            </option>
                        ))}
                    </select>
                </div>,
                (() => {
                    const newAOI: Coordinate = {
                        ...oneAOI,
                        answer: selectedAnswer
                    }
                    handleChangeOneAOI(newAOI, pageIndex, aoiIndex);
                    set_showPagination(false);
                }),
                (() => {

                    console.log("닫기취소")
                }),
                btnNameArr
            );
        }
        else if (oneAOI.type === "SJ") {
            let selectedAnswer = oneAOI.answer || "";

            //주관식
            showModal(
                <div>
                    <h2>{oneAOI.name}</h2>
                    <p>주관식답을 기입해 주세요.</p>

                    <input
                        className="normalSelect"
                        style={{ width: 130 }}
                        defaultValue={oneAOI.answer}
                        onChange={(e) => {
                            selectedAnswer = e.target.value;
                        }}
                    />
                </div>,
                (() => {
                    const newAOI: Coordinate = {
                        ...oneAOI,
                        answer: selectedAnswer
                    }
                    handleChangeOneAOI(newAOI, pageIndex, aoiIndex);
                    set_showPagination(false);
                }),
                (() => {

                    console.log("닫기취소")
                }),
                btnNameArr
            );
        }


        // set_tempAOI((prevTempAOI) => {
        //     // console.log("prevTempAOI",prevTempAOI);
        //     // console.log("oneAOI",oneAOI);
        //     return produce(prevTempAOI, draft => {
        //         if (oneAOI) {
        //             draft[pageIndex][aoiIndex] = oneAOI;
        //         }
        //     });

        //     // return prevTempAOI;
        // });

    }



    return (<div className="centerView" ref={PDFPlayQuizRef} onClick={(e) => {
        e.stopPropagation();
        console.log("여기는?");
        set_showPagination(p => !p)
        // showDefaultModal(floatingDefault);
    }}>


        {preparedNowPage &&
            (


                <TransformWrapper
    
                    // initialScale={innerFrameScale}
                    // ref={transformWrapperRef}
                    // centerOnInit={true}
                    // centerZoomedOut={true}
                    // onZoomStop={(ref) => {

                    //     // let a:ReactZoomPanPinchRef = ref;
                    //     // let b = a.instance;

                    //     PanningInteractionHandler(ref.instance, ref.state);
                    // }}
                    // onPanning={(ref) => {
                    //     console.log("onPanning")
                    //     PanningInteractionHandler(ref.instance, ref.state);
                    // }}
                    // onInit={(ref) => {
                    //     ref.instance.setup.panning.disabled = true;
                    // }}

                // centerOnInit={true}
                // maxScale={innerFrameScale}
                // disablePadding={true}
                // minScale={1}
                // wheel={{ step: 0.1 }}
                // pinch={{ step: 200 }}
                // initialPositionX={0}
                // initialPositionY={0}
                // initialScale={1}
                // initialPositionX={200}
                // initialPositionY={100}
                >

                    {({ setTransform, zoomIn, zoomOut, resetTransform, ...rest }) => {
                        console.log("preparedNowPage",preparedNowPage)
                        return (
                   
                                <TransformComponent
                         
                                    wrapperStyle={{
                                        width:`${PDFPlayQuizRef.current?.offsetWidth}px`,
                                        height:`${PDFPlayQuizRef.current?.offsetHeight}px`,
                                        // overflow:"scroll"
                                    }}
                                    contentStyle={{
                                        background: '#C00000',
                          
                                        width: preparedNowPage.wrapperSize.width,
                                        height: preparedNowPage.wrapperSize.height,
                              
                                        // width:`1000px`,
                                        // height:`500px`,
                                        // width:gazeRef.current.width,
                                        // height:gazeRef.current.height,
                                        // marginLeft:100,

                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}

                                >

                                    <div className="pageCanvasWrap" style={{
                                        position: 'relative',
                                        width: preparedNowPage.wrapperSize.width,
                                        height: preparedNowPage.wrapperSize.height,
                                    }}>
                                        <canvas
                                            className="onePageCanvas"
                                            style={{
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            width={preparedNowPage.canvasSize.width} // Set the canvas width
                                            height={preparedNowPage.canvasSize.height} // Set the canvas height

                                            ref={(canvas: HTMLCanvasElement | null) => {
                                                // console.log("onePage",onePage);
                                                if (canvas && preparedNowPage.canvas) {
                                                    // Get the canvas's 2D rendering context
                                                    const context = canvas.getContext('2d');
                                                    // Draw the canvas content onto the canvas element
                                                    if (context) {
                                                        context.drawImage(preparedNowPage.canvas, 0, 0);
                                                    }
                                                    // delete onePage.canvas;
                                                }
                                            }}

                                        />
                                        <div className="nowPageAOI" ref={AOIWrapperRef} style={{
                                            position:"absolute",
                                            left:0,
                                            top:0,
                                            width: preparedNowPage.wrapperSize.width,
                                            height: preparedNowPage.wrapperSize.height,
                                        }}>
                                            <div className="AOIWrap" >
                                                {nowPageAOI &&
                                                    nowPageAOI.map((oneAOI, i) => {
                                                        const pageIndex = nowPage - 1;
                                                        const aoiIndex = i;
                                                        return (<OneQuiz
                                                            handleSolveQuiz={handleSolveQuiz}
                                                            onChangeOneAOI={handleChangeOneAOI}
                                                            key={`OneQuiz_${pageIndex}_${aoiIndex}`}
                                                            containerRef={AOIWrapperRef}
                                                            pageIndex={pageIndex}
                                                            aoiIndex={aoiIndex}
                                                            oneAOI={oneAOI}
                                                        />)
                                                    })
                                                }
                                            </div>

                                        </div>

                                    </div>

                                </TransformComponent>
                  
                        )
                    }}
                </TransformWrapper>

            )
        }








        {showPagination && <div style={{ background: "rgba(0,0,0,.3)", width: "100%", height: "100%", position: "fixed", left: 0, top: 0 }}>
            <FloatingBtns
                nowPage={nowPage}
                maxPageNumber={maxPageNumber}
                handleChangePage={handleChangePage}

                onCloseCallback={onCloseCallback}
                showFloating={showPagination}
            />

        </div>
        }

    </div>)
}
export default CenterView;