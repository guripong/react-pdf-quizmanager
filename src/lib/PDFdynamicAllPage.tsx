import React, { createRef, useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import _ from "lodash";
import MultipleCropDiv from "./components/MutlipleCropDiv";
import { Coordinate, MultipleCropDivInstance, PDFdynamicAllPageInstance, PDFdynamicAllPageProps, PercentPagesData } from "./PDF_Quiz_Types";
import { arraysAreEqual, findMaxIndex } from "./util/util";


const PDFdynamicAllPage = forwardRef<PDFdynamicAllPageInstance, PDFdynamicAllPageProps>((props, ref) => {
    const { set_selAOI, set_tempAOI, tempAOI, AOI_mode, set_nowPage, preparePage, pages, percentPagesData, leftPreviewShow } = props;

    const scrollDivRef = useRef<HTMLDivElement>(null);
    const pagesArrRef = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
    if (pagesArrRef.current.length !== percentPagesData.length) {
        pagesArrRef.current = Array(percentPagesData.length)
            .fill(null)
            .map((_, i) => pagesArrRef.current[i] || createRef());
    }

    // const pageMultileCropDivRef = useRef(Array.from({ length: percentPagesData.length }, () => createRef()));
    const pageMultileCropDivRef = useRef<Array<React.RefObject<MultipleCropDivInstance>>>([]);
    if (pageMultileCropDivRef.current.length !== percentPagesData.length) {
        pageMultileCropDivRef.current = Array(percentPagesData.length)
            .fill(null)
            .map((_, i) => pageMultileCropDivRef.current[i] || createRef());
    }

  
    const changeCoordinate = (pageIndex: number, coordinate: any, index: number, coordinates: any[]) => {
        set_tempAOI((aoi) => {
            if (coordinates) {
                aoi[pageIndex] = coordinates;
            }
            return JSON.parse(JSON.stringify(aoi));
        });
    };

    const deleteCoordinate = (pageIndex: number, targetCoordinate: any) => {
        set_tempAOI((aoi) => {
            const pageAOI = aoi[pageIndex];
            for (let i = 0; i < pageAOI.length; i++) {
                if (pageAOI[i].id === targetCoordinate.id) {
                    pageAOI.splice(i, 1);
                    break;
                }
            }
            return JSON.parse(JSON.stringify(aoi));
        });
    };

    const changeCropName = (pageIndex: number, targetCoordinate: any, newName: string) => {
        set_tempAOI((aoi) => {
            const pageAOI = aoi[pageIndex];
            for (let i = 0; i < pageAOI.length; i++) {
                if (pageAOI[i].id === targetCoordinate.id) {
                    pageAOI[i].name = newName;
                    break;
                }
            }
            return JSON.parse(JSON.stringify(aoi));
        });
    };

    const moveCoordinate = useCallback((pageIndex: number, areaIndex: number, e: any, containerInform: { width: number; height: number }) => {
        set_tempAOI((aoi) => {
            const { width: containerWidth, height: containerHeight } = containerInform;
            const pageAOI = aoi[pageIndex];
            let last_cropCoordinate = pageAOI[areaIndex];
            const { xr, yr, widthr, heightr } = last_cropCoordinate;
            const x = xr * containerWidth;
            const y = yr * containerHeight;
            const w = containerWidth * widthr;
            const h = containerHeight * heightr;
            const { dx, dy } = e;
            const movex = x + dx / 2 < 0 ? 0 : x + dx / 2;
            const movey = y + dy / 2 < 0 ? 0 : y + dy / 2;

            const maxx = containerWidth - w;
            const maxxr = 1 - widthr;
            const maxy = containerHeight - h;
            const maxyr = 1 - heightr;

            let newCoordinate = {
                ...last_cropCoordinate,
                x: Math.min(movex, maxx),
                y: Math.min(movey, maxy),
                width: w,
                height: h,
                xr: Math.min((movex) / containerWidth, maxxr),
                yr: Math.min((movey) / containerHeight, maxyr),
            };
            pageAOI[areaIndex] = newCoordinate;
            return JSON.parse(JSON.stringify(aoi));
        });
    }, [set_tempAOI]);

    const resizeCoordinate = useCallback((pageIndex: number, areaIndex: number, e: any, containerInform: any) => {
        set_tempAOI((aoi: Coordinate[][]) => {
            // 컨테이너의 너비와 높이를 가져옵니다.
            const { width: containerWidth, height: containerHeight } = containerInform;
            // 페이지의 좌표를 가져옵니다.
            const pageAOI = aoi[pageIndex];
            // 현재 수정 중인 좌표를 가져옵니다.
            let lastCropCoordinate = pageAOI[areaIndex];
            // 현재 좌표값에서 x와 y를 계산합니다.
            const { xr, yr } = lastCropCoordinate;
            const x = xr * containerWidth;
            const y = yr * containerHeight;
            // 이벤트에서 변경된 사각형의 너비와 높이를 가져옵니다.
            const { width, height } = e.rect;
            // 이벤트에서 변경된 사각형의 좌측 상단 모서리 좌표를 가져옵니다.
            const { left, top } = e.deltaRect;
    
            // 변경된 좌표값을 계산합니다.
            let newCoordinate = {
                ...lastCropCoordinate,
                // 변경된 좌표값을 반영합니다.
                x: x + left / 2,
                y: y + top / 2,
                width: width,
                height: height,
                xr: (x + left / 2) / containerWidth,
                yr: (y + top / 2) / containerHeight,
                widthr: width / containerWidth,
                heightr: height / containerHeight,
            };
    
            // 수정된 좌표를 페이지에 반영합니다.
            pageAOI[areaIndex] = newCoordinate;
    
            // 변경된 좌표를 반환합니다.
            return JSON.parse(JSON.stringify(aoi));
        });
    }, [set_tempAOI]);
    

    const [shouldRenderHighQualityPageArray, set_shouldRenderHighQualityPageArray] = useState<PercentPagesData[] |null>(null);
    const beforeHighqualityRef = useRef<PercentPagesData[] | null>(null);
    const ismakingHighQualityRef = useRef<boolean>(false);
    const firstPartVisibleInformRef = useRef<any>(null);
    const prevFirstPartVisibleInformRef = useRef<any>(null);
    const shouldMoveScrollPercent = useRef<boolean>(false);

    const changePercentPagesData = useCallback(() => {

        // console.log("@@@@@@@@@@@@@@@changePercentPagesData@@@@@@@@@@@");
        let beforehouldRenderHighQualityPageArray = beforeHighqualityRef.current;
        const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current || {
            scrollTop: 0,
            clientHeight: 0,
            scrollHeight: 0,
        };
        // console.log("obj",scrollDivRef.current.getValues())
        const currentScroll = scrollTop;
        let visibleMin = currentScroll;
        let visibleMax = currentScroll + clientHeight;
        let hs = 0;
        let data: any = [];
        let shouldRenderPages: PercentPagesData[] = [];


        //메인페이지를 결정해줍시다.
        let firstPartVisibleInformation: any = null;

        let partVisibleArr: any = [];
        for (let i = 0; i < percentPagesData.length; i++) {
            const onePage = percentPagesData[i];
            let onePageHeight = onePage.height + onePage.marginHeight;

            let ps = hs + onePage.marginHeight;
            let pe = hs + onePage.height + onePage.marginHeight;
            const partVisibleRatio = (Math.min(pe, visibleMax) - Math.max(ps, visibleMin)) / (pe - ps);
            partVisibleArr.push(partVisibleRatio)
            let partVisible = false;
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
            data.push({
                pageNumber: i + 1,
                pageHeight: onePageHeight,
                viewMinScrollHeight: hs,
                viewMaxScrollHeight: hs + onePageHeight,
                page_s: hs + onePage.marginHeight,
                page_e: hs + onePage.height + onePage.marginHeight,
                partVisible: partVisible,
                partVisibleRatio: partVisibleRatio,
                visibleMin: visibleMin,
                visibleMax: visibleMax,
                ps: ps,
                pe: pe,

            });



            if (partVisible) {
                if (firstPartVisibleInformation === null) {
                    firstPartVisibleInformation = {
                        partVisibleRatio: partVisibleRatio,
                        pageNumber: i + 1,
                        pageHeight: onePageHeight,
                        scrollHeight: scrollHeight,
                        clientHeight: clientHeight,
                        page_s: hs + onePage.marginHeight,
                        page_e: hs + onePage.height + onePage.marginHeight,
                        visibleMin: visibleMin,
                        visibleMax: visibleMax,
                        ps: ps,
                        pe: pe,
                    };
                    // console.log("moveToLastScrollPosition",moveToLastScrollPosition)
                    if (shouldMoveScrollPercent.current) {

                        shouldMoveScrollPercent.current = false;
                        // console.log("과거 스크롤정보",firstPartVisibleInformRef.current);
                        let prev = firstPartVisibleInformRef.current;
                        let now = firstPartVisibleInformation;
                        // console.log("지금보이는 스크롤정보",firstPartVisibleInformation);
                        let prevRatio = prev.visibleMin / prev.scrollHeight;

                        let shouldmove = now.scrollHeight * prevRatio;
                        // shouldmove;
                        //

                        scrollDivRef.current!.scrollTop=shouldmove;
                        prevFirstPartVisibleInformRef.current = firstPartVisibleInformRef.current;
                        firstPartVisibleInformRef.current = firstPartVisibleInformation;
                        return;
                    }

                    // console.log("하..여기가...")
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

        set_nowPage(np => {
            let newnp = findMaxIndex(partVisibleArr) + 1;
            if (np === newnp) {
                return np;
            }
            else {
                return newnp;
            }
        });



        //  console.log("data",data);


        if (beforehouldRenderHighQualityPageArray) {
            if (arraysAreEqual(beforehouldRenderHighQualityPageArray, shouldRenderPages)) {
                return;
            }
            else {
                if (ismakingHighQualityRef.current) {
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
                return;
            }
            //맨처음 만드는경우다.
            console.log("2222222222이전값이 없고 신규 생성중");
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
            return new Promise(async function (resolve) {

                // console.log("@@@@@@@@@@@@@만드는작업돌입")
                for (let i = 0; i < shouldRenderPages.length; i++) {
                    const pg = shouldRenderPages[i];
                    const index:number = pg.pageNumber - 1;

                    // console.log("pg",pg)
                    if(!pages||!pages[index]){
                        resolve(false);
                        return;
                    }

                    let res = await preparePage(pages[index], pg.pageNumber, pg.pageSize.width, pg.pageSize.width);

                    if (res.valid) {
                        shouldRenderPages[i].canvas = res.canvas;
                    }
                    else {
                        resolve(false);
                        return;
                    }
                }
                resolve(true);

            });

        }


    }, [percentPagesData, pages, preparePage, set_nowPage]);



    const forceMoveScrollTopToPage = useCallback((pageNumber: number) => {
        if (!percentPagesData) return;



        let sctop = null;
        for (let i = 0; i < percentPagesData.length; i++) {
            const p: any = percentPagesData[i];
            if (p.pageNumber === pageNumber) {
                sctop = p.viewMinScrollHeight + (p.marginHeight);
                break;
            }

        }
        if (sctop !== null&&scrollDivRef.current) {
            scrollDivRef.current.scrollTop = sctop;
        }


        // console.dir(scrollDivRef);
        // scrollDivRef.crTop(0);
    }, [percentPagesData])




    useImperativeHandle(ref, () => ({
        set_focusAOIArea: (pageNumber, AreaNumber) => {
            if (pageMultileCropDivRef.current &&
                pageMultileCropDivRef.current.length&&
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


    useEffect(() => {
        const debouncedChangePercentPagesData = _.debounce(() => {
            changePercentPagesData();
        }, 300);
        debouncedChangePercentPagesData();
    }, [changePercentPagesData])


    const handleOnScroll = useCallback(() => {
        changePercentPagesData();
    }, [changePercentPagesData]);




    return (<div className="PDFdynamicAllPage" style={{
        marginLeft: leftPreviewShow ? 150 : 0,
        width: leftPreviewShow ? "calc(100% - 150px)" : "100%"
    }}>
        <div onScroll={handleOnScroll} ref={scrollDivRef} className="scrollDiv">

            {percentPagesData && percentPagesData.map((onePage, index) => {

                let highQualityData = null;
                if (shouldRenderHighQualityPageArray && shouldRenderHighQualityPageArray.find(d => d.pageNumber === index + 1)) {
                    highQualityData = shouldRenderHighQualityPageArray.find(d => d.pageNumber === index + 1);
                    // console.log("highQualityData",highQualityData);
                }
                // console.log("여기pageNumber",pageNumber,shouldRenderHighQualityPageArray)
                return (
                    <div className="onePageWrap"
                        style={{
                            marginTop: onePage.marginHeight,
                        }}
                        ref={pagesArrRef.current[index]}
                        key={'dynamic_page_' + index}
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
                                    // console.log("onePage",onePage);
                                    if (canvas && onePage.bluredCanvas) {
                                        // Get the canvas's 2D rendering context
                                        const context = canvas.getContext('2d');
                                        // Draw the canvas content onto the canvas element
                                        if (context) {
                                            context.drawImage(onePage.bluredCanvas, 0, 0);
                                        }

                                        // delete onePage.canvas;
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
                                            // console.log("onePage",onePage);
                                            if (canvas && highQualityData.canvas) {
                                                // console.log("하이퀄리티랜더", pageNumber)
                                                // Get the canvas's 2D rendering context
                                                const context = canvas.getContext('2d');
                                                // Draw the canvas content onto the canvas element
                                                if (context) {
                                                    context.drawImage(highQualityData.canvas, 0, 0);
                                                }

                                                // delete onePage.canvas;
                                            }
                                        }}

                                    />
                                </div>
                            }
                            <div className="AreaCanvasWrap">

                                {tempAOI && tempAOI[index] &&
                                    <MultipleCropDiv
                                        ref={pageMultileCropDivRef.current[index]}
                                        AOI_mode={AOI_mode}
                                        pageIndex={index}
                                        coordinates={tempAOI[index]}
                                        onChange={(p, i, np) => changeCoordinate(index, p, i, np)}
                                        onDelete={(targetcoordinate) => deleteCoordinate(index, targetcoordinate)}
                                        onResize={resizeCoordinate}
                                        onMove={moveCoordinate}
                                        onFixCropName={(targetcoordinate, newname) => changeCropName(index, targetcoordinate, newname)}
                                        set_selAOI={set_selAOI}
                                    />
                                }
                            </div>



                        </div>


                    </div>)
            })}
        </div>

    </div>)
});

export default PDFdynamicAllPage;