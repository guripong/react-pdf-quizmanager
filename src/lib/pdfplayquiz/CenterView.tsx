
import { produce } from 'immer';
import type { Coordinate, PDFPlayQuizProps, PreRenderedPDFPage } from 'lib/PDF_Quiz_Types';
import usePDFLoader from 'lib/hooks/usePDFLoader';
import { PDFPageProxy } from 'pdfjs-dist/types/display/api';
import React, {  useState, useRef, useEffect, useMemo, LegacyRef } from 'react';
// import Scrollbars from 'react-custom-scrollbars-2';
import OneQuiz from './OneQuiz';
import { useModal } from 'lib/hooks/useModal';
import FloatingBtns from './FloatingBtns';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import Loading from 'lib/components/loading/Loading';


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
        //#@! 리사이즈시 init view 필요

        const resizeObserver = new ResizeObserver(entries => {
            // 크기 변경시 실행할 작업을 여기에 작성합니다.
            entries.forEach((/*entry*/) => {
                // console.log("resize에따라서 실제 cropRenderSize재할당")
                //   console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
                // set_renderWidth(entry.contentRect.width * viewPercent / 100);
                // const contentWidth = wrapEl.offsetWidth;
                // const contentHeight = wrapEl.offsetHeight;
                // debouncedResetContainerInform();

                // console.log("여기호출?")
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
    // const scrollDivRef = useRef<Scrollbars>(null);


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








    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [showPagination, set_showPagination] = useState(false);
    const handleSolveQuiz = (oneAOI: Coordinate, pageIndex: number, aoiIndex: number) => {
        console.log("handleSolveQuiz")

        if (isDragging) {
            setIsDragging(false);
            return;

        }
        // set_showPagination(true);

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




    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // console.log("마우스다운")
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        const dx = Math.abs(e.clientX - startPos.x);
        const dy = Math.abs(e.clientY - startPos.y);
        const movementThreshold = 5; // Adjust the threshold as needed

        if (dx < movementThreshold && dy < movementThreshold) {
            // console.log("원클릭으로 판단");
            set_showPagination(p => !p);
            setIsDragging(false);
            // showDefaultModal(floatingDefault);
        } else {
            // console.log("마우스업 - Drag detected");
            setIsDragging(true);
        }
    };
    const zoompanRef = useRef<ReactZoomPanPinchRef>(null);
    useEffect(()=>{
        if(!preparedNowPage ||!zoompanRef.current){
            return ;
        }

        const parentEl=zoompanRef.current.instance.contentComponent?.offsetParent;
        console.log("parentEl",parentEl)

        function handleWheel(event:WheelEvent){
            if(!preparedNowPage){
                return;
            }
            if(!PDFPlayQuizRef.current){
                return;
            }
            if (event.ctrlKey) {
                return; // Ctrl 키가 눌렸을 때는 무시
            }
            
            event.preventDefault();
            event.stopPropagation();

            if (zoompanRef.current) {
                // const deltaY = event.wheelDeltaY;
                const deltaY = event.deltaY;
                const { state } = zoompanRef.current.instance.getContext();
                const { positionX, positionY, scale } = state;
                // const { positionX, positionY, scale } = zoompanRef.current.state;
                let newY = positionY - deltaY * 4;
                // console.log("deltaY",deltaY)
                // 예외 처리: newY가 0 미만이면 0으로 설정
                newY = Math.min(newY, 0);

                // 예외 처리: 현재 scale 보다 더 크게 확대되지 않도록 제한
                const contentHeight = (preparedNowPage.wrapperSize.height*scale-PDFPlayQuizRef.current.offsetHeight);
                if (newY < -(contentHeight)) {
                    newY = -(contentHeight);
                }

                zoompanRef.current.setTransform(positionX, newY, scale);
               
            }
        }
        if(parentEl){
            parentEl.addEventListener("wheel",handleWheel as EventListener)
        }
        return ()=>{
            parentEl?.removeEventListener("wheel",handleWheel as EventListener)
        }
    },[preparedNowPage])
    // console.log("zoompanRef",zoompanRef.current?.instance?.contentComponent?.offsetParent)
    return (<div className="centerView" ref={PDFPlayQuizRef}

        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
    >


        {preparedNowPage ?
            (


                <TransformWrapper
                    ref={zoompanRef}
                    doubleClick={{disabled:true}}
                    panning={{disabled:false}}
                    limitToBounds={true}
                    alignmentAnimation={{
                        disabled: true,
                        sizeY: 0,
                        sizeX: 0 
                    }}
                    wheel={{ disabled: false ,

                        wheelDisabled:true
                    }} // Wheel zooming disabled

                    // onWheel={(zoomRef,event)=>{
                    // }}
                    // onZoom={(ref,event)=>{
                    // }}  
                    // maxPositionX={preparedNowPage.wrapperSize.width}
                    // minPositionY={0}
                    // maxPositionY={preparedNowPage.wrapperSize.height}
                    onPanningStart={()=>{
                        // console.log("시작")
                    }}
         
                    >
                    {() => {
                        // console.log("preparedNowPage",preparedNowPage)
                        return (<>

                            <TransformComponent
                           
                                wrapperStyle={{
                                    width: `${PDFPlayQuizRef.current?.offsetWidth}px`,
                                    height: `${PDFPlayQuizRef.current?.offsetHeight}px`,
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
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
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


                        </>)
                    }}
                </TransformWrapper>

            )
            :
            <>
                <Loading/>
            </>
        }










    </div>)
}
export default CenterView;