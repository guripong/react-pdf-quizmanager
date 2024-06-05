import React, { createRef, useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import _ from "lodash";
// import MultipleCropDiv from "./components/MutlipleCropDiv";
import { Coordinate, MultipleCropDivInstance, PDFdynamicAllPageInstance, PDFdynamicAllPageProps, PercentPageDataType, PercentPagesData, PreRenderedPDFPage } from "./PDF_Quiz_Types";
import { arraysAreEqual, findMaxIndex } from "./util/util";
// import VirtualScroll from "./components/VirtualScroll";
import MultipleCropDiv2 from "./components/MutlipleCropDiv2";
import { produce } from 'immer';
// import { Scrollbars } from 'react-custom-scrollbars-2';


interface ShouldRenderPageInform {
    pageNumber:number;
    canvas?:HTMLCanvasElement;
    pageSize:{
        width:number;
        height:number;
    }
}

interface TempData {
    pageNumber: number;
    pageHeight: number;
    viewMinScrollHeight: number;
    viewMaxScrollHeight: number;
    page_s: number;
    page_e: number;
    partVisible?: boolean;
    partVisibleRatio?: number;
    visibleMin: number;
    visibleMax: number;
    ps: number;
    pe: number;
}

interface VisibleInformation {

    pageNumber: number;
    pageHeight: number;
    scrollHeight: number;
    clientHeight: number;
    page_s: number;
    page_e: number;
    partVisibleRatio: number;
    visibleMin: number;
    visibleMax: number;
    ps: number;
    pe: number;
}


//한페이지를 모두 렌더
const PDFdynamicAllPage = forwardRef<PDFdynamicAllPageInstance, PDFdynamicAllPageProps>((props, ref) => {
    const { previewOption, set_selAOI, set_tempAOI, tempAOI, AOI_mode, set_nowPage, preparePage, pages, percentPagesData, leftPreviewShow } = props;

    const scrollDivRef = useRef<HTMLDivElement>(null);
    // const scrollDivRef = useRef<Scrollbars>(null);





    // const pageMultileCropDivRef = useRef(Array.from({ length: percentPagesData.length }, () => createRef()));
    const pageMultileCropDivRef = useRef<Array<React.RefObject<MultipleCropDivInstance>>>([]);
    if (pageMultileCropDivRef.current.length !== percentPagesData.length) {
        pageMultileCropDivRef.current = Array(percentPagesData.length)
            .fill(null)
            .map((_, i) => pageMultileCropDivRef.current[i] || createRef());
    }


    const changeAOI = (pageIndex: number, newPageAOIArr: Coordinate[]) => {

        set_tempAOI((aoi) => {
            return produce(aoi, draft => {
                if (newPageAOIArr) {
                    draft[pageIndex] = newPageAOIArr;
                }
            });
        });

    };

    const deleteCoordinate = (pageIndex: number, targetAOI: Coordinate) => {
        set_tempAOI(aoi => {
            return produce(aoi, draft => {
                const pageAOI = draft[pageIndex];
                for (let i = 0; i < pageAOI.length; i++) {
                    if (pageAOI[i].id === targetAOI.id) {
                        pageAOI.splice(i, 1);
                        break;
                    }
                }
            });
        });
    };


    const changeCropName = (pageIndex: number, targetAOI: Coordinate, newName: string) => {
        set_tempAOI(aoi => {
            return produce(aoi, draft => {
                const pageAOIArr = draft[pageIndex];

                for (let i = 0; i < pageAOIArr.length; i++) {
                    if (pageAOIArr[i].id === targetAOI.id) {
                        pageAOIArr[i].name = newName;
                        break;
                    }
                }
            });
        });


    };





    const [shouldRenderHighQualityPageArray, set_shouldRenderHighQualityPageArray] = useState<ShouldRenderPageInform[] | null>(null);
    const beforeHighqualityRef = useRef<PercentPagesData[] | null>(null);
    const ismakingHighQualityRef = useRef<boolean>(false); //하이퀄리티 pdfpage 만드는중
    const firstPartVisibleInformRef = useRef<VisibleInformation | null>(null);
    const prevFirstPartVisibleInformRef = useRef<VisibleInformation | null>(null);
    const shouldMoveScrollPercent = useRef<boolean>(false);



    //#@! 최적화 필요?
    const changePercentPagesData = useCallback(() => {
        if(!scrollDivRef.current) return; //부모가 없다?

        // console.log("@@@@@@@@@@@@@@@changePercentPagesData@@@@@@@@@@@");
        const beforehouldRenderHighQualityPageArray = beforeHighqualityRef.current;

        const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current|| {
            scrollTop: 0,
            clientHeight: 0,
            scrollHeight: 0,
        };
        // console.log("obj",scrollDivRef.current.getValues())
        const currentScroll: number = scrollTop; //지금 scrollTop 위치
        const visibleMin = currentScroll; //보이기위한 최소값
        const visibleMax = currentScroll + clientHeight; //보이기위한 최대값
        let hs = 0; //지금까지의 페이지 높이들 합
        const temp_data: TempData[] = []; //임시 콘솔 확인용
        const shouldRenderPages: ShouldRenderPageInform[] = [];


        //메인페이지를 결정해줍시다.
        let firstPartVisibleInformation: VisibleInformation | null = null;

        const partVisibleArr: number[] = [];

        for (let i = 0; i < percentPagesData.length; i++) {
            const onePage = percentPagesData[i];
            const onePageHeight = onePage.height + onePage.marginHeight;


            const ps = hs + onePage.marginHeight;  //page Start
            const pe = hs + onePage.height + onePage.marginHeight; //page End
            //PDF파일이 화면에 보이는 비율을 계산
            const partVisibleRatio = (Math.min(pe, visibleMax) - Math.max(ps, visibleMin)) / (pe - ps);

            partVisibleArr.push(partVisibleRatio)
            let partVisible = false; //지금 PDF파일의 일부가 화면에 보이는가? 스크롤위치에 따라 계산
            if (visibleMin <= ps && visibleMax >= ps) {
                partVisible = true;
            }
            if (visibleMin <= pe && visibleMax >= pe) {
                partVisible = true;
            }
            if (visibleMin >= ps && visibleMax <= pe) {
                partVisible = true;
            }


            // console.log("visibleMin",visibleMin);
            temp_data.push({
                pageNumber: i + 1,
                pageHeight: onePageHeight,
                viewMinScrollHeight: hs,
                viewMaxScrollHeight: hs + onePageHeight,
                page_s: hs + onePage.marginHeight,
                page_e: hs + onePage.height + onePage.marginHeight,
                partVisible: partVisible, //보이는가?
                partVisibleRatio: partVisibleRatio, //보이는비율
                visibleMin: visibleMin, //보이기위한 최소
                visibleMax: visibleMax, //보이기위한 최대
                ps: ps, //page Start
                pe: pe, //page End

            });


            // 스크롤위치 강제이동.. viewPercent바꿧을시
            if (partVisible) {
                if (firstPartVisibleInformation === null) {
                    firstPartVisibleInformation = {
                    
                        pageNumber: i + 1,
                        pageHeight: onePageHeight,
                        scrollHeight: scrollHeight,
                        clientHeight: clientHeight,
                        page_s: hs + onePage.marginHeight,
                        page_e: hs + onePage.height + onePage.marginHeight,
                        partVisibleRatio: partVisibleRatio,
                        visibleMin: visibleMin,
                        visibleMax: visibleMax,
                        ps: ps,
                        pe: pe,
                    };
                    // console.log("moveToLastScrollPosition",moveToLastScrollPosition)
                    if (shouldMoveScrollPercent.current) {

                        shouldMoveScrollPercent.current = false;
                        // console.log("과거 스크롤정보",firstPartVisibleInformRef.current);
                        const prev = firstPartVisibleInformRef.current;
                        const now = firstPartVisibleInformation;
                        // console.log("지금보이는 스크롤정보",firstPartVisibleInformation);
                        if (prev) {
                            const prevRatio = prev.visibleMin / prev.scrollHeight;

                            const shouldmove = now.scrollHeight * prevRatio;
                            // shouldmove;
                            //
                            //강제 이동시킴.. percent가 바뀌어도.. 지금 보고있는 PDF위치로                            
                            // scrollDivRef.current.scrollTop(shouldmove);
                            scrollDivRef.current.scrollTop = shouldmove;

                            prevFirstPartVisibleInformRef.current = firstPartVisibleInformRef.current;
                            firstPartVisibleInformRef.current = firstPartVisibleInformation;
                            return;
                        }
                    }

                    prevFirstPartVisibleInformRef.current = firstPartVisibleInformRef.current;
                    firstPartVisibleInformRef.current = firstPartVisibleInformation;

                }
                shouldRenderPages.push({
                    pageNumber: i + 1,
                    pageSize: {
                        width: onePage.width,
                        height: onePage.height
                    }
                });
            }

            hs += onePageHeight;
        }
        // console.log("partVisibleArr",partVisibleArr)


        set_nowPage(prevNowPage => {
            const newnp = findMaxIndex(partVisibleArr) + 1;
            // console.log("newnp",newnp)
            if (prevNowPage === newnp) {
                return prevNowPage;
            }
            else {
                return newnp;
            }
        });


        // console.log("shouldRenderPages",shouldRenderPages)


        //  console.log("data",data);


        if (beforehouldRenderHighQualityPageArray) {
            if (arraysAreEqual(beforehouldRenderHighQualityPageArray, shouldRenderPages)) {
                // console.log("안만듬")
                return;
            }
            else {
                if (ismakingHighQualityRef.current) {
                    // console.log("이미 만드는중")
                    return;
                }

                // console.log("111111111이전값이 있지만 틀려서 생성중");
                //어째서 여기가 계속 호출되는것인가?
                makeVirtualCanvasHighQualityPage().then(valid => {
                    ismakingHighQualityRef.current = false;
                    if (valid) {
                        // console.log("이전값 beforehouldRenderHighQualityPageArray",beforehouldRenderHighQualityPageArray);
                        // console.log("shouldRenderHighQualityPageArray 리사이즈할당")

                        set_shouldRenderHighQualityPageArray(shouldRenderPages);
                        beforeHighqualityRef.current = shouldRenderPages;
                    }
                });
            }
        }
        else {
            if (ismakingHighQualityRef.current) {
                // console.log("이미 만드는중")
                return;
            }
            //맨처음 만드는경우다.
            // console.log("2222222222이전값이 없고 신규 생성중 하이퀄리티");
            makeVirtualCanvasHighQualityPage().then(valid => {
                ismakingHighQualityRef.current = false;
                if (valid) {
                    // console.log("shouldRenderHighQualityPageArray 신규할당")

                    set_shouldRenderHighQualityPageArray(shouldRenderPages);
                    beforeHighqualityRef.current = shouldRenderPages;
                }
            });
        }

        function makeVirtualCanvasHighQualityPage() {
            ismakingHighQualityRef.current = true;
            return new Promise(function (resolve) {

                // console.log("@@@@@@@@@@@@@만드는작업돌입")
                let promiseChain = Promise.resolve();

                for (let i = 0; i < shouldRenderPages.length; i++) {
                    const pg:PercentPagesData = shouldRenderPages[i];
                    const index = pg.pageNumber - 1;

                    // console.log("pg",pg)
                    if (!pages || !pages[index]) {
                        resolve(false);
                        return;
                    }

                    promiseChain = promiseChain.then(() => {
                        return preparePage(pages[index], pg.pageNumber, pg.pageSize.width)
                            .then((res:PreRenderedPDFPage) => {
                                if (res.valid) {
                                    shouldRenderPages[i].canvas = res.canvas;
                                } else {
                                    resolve(false);
                                    throw new Error("Invalid page");  // Stop further execution
                                }
                            });
                    });
                }

                promiseChain.then(() => resolve(true))
                    .catch(() => resolve(false));  // Catch any error and resolve with false
            });
        }



    }, [percentPagesData, pages, preparePage, set_nowPage]);

    const handleOnScroll = useCallback(() => {

        changePercentPagesData();
    }, [changePercentPagesData]);


    useEffect(() => {
        const debouncedChangePercentPagesData = _.debounce(() => {
            changePercentPagesData();
        }, 100);
        debouncedChangePercentPagesData();
    }, [changePercentPagesData])


    //해당 page로 스크롤을 이동시킴
    const forceMoveScrollTopToPage = useCallback((pageNumber: number) => {
        if (!percentPagesData) return;
        if(!scrollDivRef.current) return;

        //해당 page의 Top scroll위치를 계산합니다.
        let sctop = null;
        for (let i = 0; i < percentPagesData.length; i++) {
            const p: PercentPageDataType = percentPagesData[i];
            if (p.pageNumber === pageNumber) {
                sctop = p.viewMinScrollHeight + (p.marginHeight);
                break;
            }

        }
        if (sctop !== null && scrollDivRef.current) {
            scrollDivRef.current.scrollTop = sctop;
            //해당 page의 Top scroll위치로 이동합니다;
            // scrollDivRef.current.scrollTop(sctop);

        }
    }, [percentPagesData])




    useImperativeHandle(ref, () => ({
        set_focusAOIArea: (pageNumber, AreaNumber) => {
            // console.log("pageNumber",pageNumber);
            // console.log("AreaNumber",AreaNumber);
            if (pageMultileCropDivRef.current &&
                pageMultileCropDivRef.current.length &&
                pageMultileCropDivRef.current[pageNumber - 1]) {
                pageMultileCropDivRef.current[pageNumber - 1]?.current?.set_focusArea(AreaNumber);
            }
        },
        set_scrollMoveToPage: (pageNumber) => {
            forceMoveScrollTopToPage(pageNumber);
        },
        moveTothePrevScroll: () => {
            shouldMoveScrollPercent.current = true;
        }
    }), [forceMoveScrollTopToPage]);





    //하나의 AOI정보 변경
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

    
    const PDFdynamicAllPageStyle = useMemo(() => {
        if (!previewOption?.wrapperStyle?.width) {
            return {};
        }
        return {
            marginLeft: leftPreviewShow ? previewOption.wrapperStyle.width : 0,
            width: leftPreviewShow ? `calc(100% - ${previewOption.wrapperStyle.width}px)` : "100%"
        }
    }, [leftPreviewShow, previewOption]);





    return (

        <div className="PDFdynamicAllPage" style={PDFdynamicAllPageStyle}>
            <div className="scrollDiv" ref={scrollDivRef}
            onScroll={handleOnScroll} style={{width:"100%",height:"100%"}} >
                {/* <div onScroll={handleOnScroll} ref={scrollDivRef} className="scrollDiv"> */}

                    {percentPagesData && percentPagesData.map((onePage, pageIndex) => {
                        let highQualityData = null;
                        if (shouldRenderHighQualityPageArray && shouldRenderHighQualityPageArray.find(d => d.pageNumber === pageIndex + 1)) {
                            highQualityData = shouldRenderHighQualityPageArray.find(d => d.pageNumber === pageIndex + 1);
                        }

                        return (
                            <div className="onePageWrap"
                                style={{
                                    marginTop: onePage.marginHeight,
                                }}
                           

                                key={'dynamic_page_' + pageIndex}
                            >
                                <div className="pageCanvasWrap" style={{
                                    width: onePage.width,
                                    height: onePage.height,
                                }}>
                                    <canvas
                                        className="onePageCanvas"
                                        width={onePage.bluredCanvasSize.width} // Set the canvas width
                                        height={onePage.bluredCanvasSize.height} // Set the canvas height
                                        ref={(canvas) => {
                                            if (canvas && onePage.bluredCanvas) {
                                                const context = canvas.getContext('2d');
                                                if (context) {
                                                    context.drawImage(onePage.bluredCanvas, 0, 0);
                                                }
                                            }
                                        }}
                                    />
                                    {highQualityData && highQualityData.pageSize &&

                                        <div className="highQualityCanvasWrap">
                                            <canvas
                                                className="onePageCanvas"
                                                width={highQualityData.pageSize.width} // Set the canvas width
                                                height={highQualityData.pageSize.height} // Set the canvas height
                                                ref={(canvas) => {
                                                    if (canvas && highQualityData.canvas) {
                                                        const context = canvas.getContext('2d');
                                                        if (context) {
                                                            context.drawImage(highQualityData.canvas, 0, 0);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    }
                                    <div className="AreaCanvasWrap">
                                        {tempAOI && tempAOI[pageIndex] &&
                                            <MultipleCropDiv2
                                                ref={(ref: MultipleCropDivInstance) => {
                                                    pageMultileCropDivRef.current[pageIndex] = { current: ref };
                                                }}
                                                AOI_mode={AOI_mode}
                                                pageIndex={pageIndex}
                                                pageAOIArr={tempAOI[pageIndex]}
                                                onChangeAOI={(newPageAOIArr) => changeAOI(pageIndex, newPageAOIArr)}
                                                onDeleteAOI={(targetcoordinate) => deleteCoordinate(pageIndex, targetcoordinate)}
                                                onFixCropName={(targetcoordinate, newname) => changeCropName(pageIndex, targetcoordinate, newname)}
                                                set_selAOI={set_selAOI}

                                                onChangeOneAOI={handleChangeOneAOI}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })}


                {/* </div> */}
            </div>
        </div>



    )
});

export default PDFdynamicAllPage;