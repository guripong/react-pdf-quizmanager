
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
import useElapsedTime from 'lib/hooks/useElapsedTime';

const cropCanvasToSrc2 = (
    canvas: HTMLCanvasElement,
    left: number,
    top: number,
    width: number,
    height: number,
    padding: number,
    lrcut: number
  ):string|null=> {

    const tt = document.createElement('canvas');
    tt.width = width + padding * 2 - lrcut * 2;
    tt.height = height + padding * 2;
  
    const context = tt.getContext('2d');
    if(!context){
        return null;
    }
    context.drawImage(
      canvas,
      left - padding + lrcut,
      top - padding,
      width + padding * 2 - lrcut * 2,
      height + padding * 2,
      0,
      0,
      width + 2 * padding - lrcut * 2,
      height + 2 * padding
    );
    const src = tt.toDataURL();
    tt.remove(); // 가짜 캔버스 삭제함
    return src;
  };

  
const CenterView: React.FC<PDFPlayQuizProps> = (props) => {
    const { AOI, path, PDFDocumentOnLoadCallback,
        onCloseCallback } = props;
    const { showModal } = useModal();

    const { pages, maxPageNumber, preparePage } = usePDFLoader(path, PDFDocumentOnLoadCallback);
    const [preparedPage, set_preparedPage] = useState<PreRenderedPDFPage[]>();


    //전체페이지 로딩까지 기다리는방식 채택

    const PDFPlayQuizRef = useRef<HTMLDivElement>(null);
    const AOIWrapperRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        if (!pages) return;
        if (!PDFPlayQuizRef || !PDFPlayQuizRef.current) return;

        // if (preparedPage) return;

        //전체화면이 아닐경우 기다려버려라.

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
 
          
                // wrapEl.offsetHeight

                // const aimWidth =wrapEl.offsetWidth>1000? wrapEl.offsetWidth:wrapEl.offsetWidth*2;
                const aimWidth =wrapEl.offsetWidth>1000? wrapEl.offsetWidth:1000;
                // Math.max(wrapEl.offsetWidth,1000);
                // const aimWidth=wrapEl.offsetWidth;
                // console.log("캔버스에만들이미지목표사이즈aimWidth",aimWidth)
                prepareAllPage(pages, aimWidth);
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
                // console.log("preparedPDFPages[]:", preparedPDFPages);
                // console.log("preparedPDFPages",preparedPDFPages[0].canvasSize);
                // let preparedPages=res;
   
                const originCanvasSize =preparedPDFPages[0].canvasSize;
                const {width,height} = originCanvasSize;
                const initScale=wrapEl.offsetWidth/width;
                // console.log("initScale",initScale)
                // const initScale = wrapEl.offsetWidth/scaleWidth;
                // const scaleWidth = width*initScale;
                //wraper 과 scalewidth은항상 같을꺼임.

                // console.log("wrapEl.offsetWidth,scaleWidth,width",wrapEl.offsetWidth,scaleWidth,width);
                const scaleheight = height*initScale;

                // console.log("scaleWidth",scaleWidth)
                // console.log("scaleheight",scaleheight);
                // console.log("wrapEl.offsetWidth",wrapEl.offsetWidth)
                // console.log("wrapEl.offsetHeight",wrapEl.offsetHeight)
                set_initData({
                    scale:initScale,
                    initialPositionX:0,
                    initialPositionY:wrapEl.offsetHeight>scaleheight?
                    (wrapEl.offsetHeight-scaleheight)/2:0,
                });

                if(zoompanRef.current){
                    const { state } = zoompanRef.current.instance.getContext();
                    const { positionX, positionY } = state;
                    // console.log("wrapEl.offsetHeight",wrapEl.offsetHeight,scaleheight)
                    // console.log("positionY",positionY)
                    if(wrapEl.offsetHeight>scaleheight){
                        //크다가 줄어서 바뀐경우
                        zoompanRef.current.setTransform(positionX, wrapEl.offsetHeight>scaleheight?(wrapEl.offsetHeight-scaleheight)/2:positionY, initScale);
                    }
                    else{
                   
                        zoompanRef.current.setTransform(positionX, 0, initScale);
                    }
                
                }



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
        const canvas = preparedNowPage?.canvas;
        if(!canvas) return;
        if (isDragging) {
            setIsDragging(false);
            return;

        }
        // set_showPagination(true);
        // console.log("preparedNowPage",preparedNowPage)

        const canvasSize =preparedNowPage.canvasSize;
        const {width,height} = canvasSize;
        // cropCanvasToSrc2(canvas,)
        // console.log("oneAOI",oneAOI);
        const ctx = canvas.getContext("2d");
        const {x:xp,y:yp,width:wp,height:hp} = oneAOI;
        const base64=cropCanvasToSrc2(canvas, width*xp/100, height*yp/100, 
            width*wp/100, height*hp/100, 0, 0);
        // console.log("base64",base64);

        const btnNameArr: string[] = ["확인", "취소"];
        // handleChangeOneAOI
        if (oneAOI.type === "MC") {


            let selectedAnswer = oneAOI.answer || "1";
            showModal(
                <>
           
                        <img className="cropImg"src={base64??""} alt="" />
                
               
                        <h2>{oneAOI.name}</h2>
                        <div>

                        </div>
                        <p>대답을 선택하고 확인을 누르세요</p>
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
               
                  
                </>,
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
                <>
                    <img className="cropImg" src={base64??""} alt="" />
                    <h2>{oneAOI.name}<span></span></h2>
        
            
                    <input
                        className="normalInput"
                        style={{width:200}}
                        placeholder='대답을 입력하고 확인을 누르세요'
                        defaultValue={oneAOI.answer}
                        onChange={(e) => {
                            selectedAnswer = e.target.value;
                        }}
                    />
                </>,
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
        // console.log("parentEl",parentEl)

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
                // console.log("preparedNowPage",preparedNowPage)
                // console.log("preparedNowPage.wrapperSize.height*scale",preparedNowPage.wrapperSize.height*scale)
                // console.log("PDFPlayQuizRef.current.offsetHeight",PDFPlayQuizRef.current.offsetHeight)
                // 예외 처리: 현재 scale 보다 더 크게 확대되지 않도록 제한
                //wrapEl.offsetHeight>scaleheight?
                // (wrapEl.offsetHeight-scaleheight)/2:0,
                const renderHeight =preparedNowPage.wrapperSize.height*scale;
                if(renderHeight<PDFPlayQuizRef.current.offsetHeight){
                    const contentHeight = -((PDFPlayQuizRef.current.offsetHeight-renderHeight)/2);
                    if (newY < -(contentHeight)) {
                        newY = -(contentHeight);
                    }
                }
                else{
                    const contentHeight = (renderHeight-PDFPlayQuizRef.current.offsetHeight);
                    if (newY < -(contentHeight)) {
                        newY = -(contentHeight);
                    }
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
    },[preparedNowPage]);


    const [initData,set_initData] = useState({
        scale:1,
        initialPositionX:0,
        initialPositionY:0,
    });
    const getElapsedTime = useElapsedTime(); // useElapsedTime 훅을 호출합니다

    const handleOnClose = ()=>{
        if(onCloseCallback&& typeof onCloseCallback==='function'){
            const elapsedTime = getElapsedTime(); // 경과 시간을 계산합니다
            onCloseCallback(tempAOI,elapsedTime);
        }
    }

    // console.log("zoompanRef",zoompanRef.current?.instance?.contentComponent?.offsetParent)
    return (<div className="centerView" ref={PDFPlayQuizRef}

        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
    >


        {preparedNowPage ?
            (


                <TransformWrapper
                    ref={zoompanRef}
                    initialScale={initData.scale}
                    doubleClick={{disabled:true}}
                    panning={{disabled:false}}
                    limitToBounds={true}
                    alignmentAnimation={{
                        disabled: true,
                        sizeY: 0,
                        sizeX: 0 
                    }}
                    maxScale={3}
                    minScale={initData.scale}
                    // centerOnInit
                    initialPositionX={initData.initialPositionX}
                    initialPositionY={initData.initialPositionY}
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
                                    handleSolveQuiz={handleSolveQuiz}
                                    nowPage={nowPage}
                                    maxPageNumber={maxPageNumber}
                                    handleChangePage={handleChangePage}
                                    tempAOI={tempAOI}
                                    onCloseCallback={handleOnClose}
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