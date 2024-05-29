import React,{ useState, useEffect, useRef , createRef, useCallback, useMemo
    // , useMemo, forwardRef, useImperativeHandle 
} from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { Coordinate, PDFPreviewProps } from "./PDF_Quiz_Types";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
interface FoldSvgProps {
    isFold: boolean;
}
const FoldSvg: React.FC<FoldSvgProps> = ({isFold})=>{
    return (<svg fill="#fff"
    style={{
        transform: isFold ? "rotate(-90deg)" : "",
    }}
    width="12px" height="12px" viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M 4.21875 10.78125 L 2.78125 12.21875 L 15.28125 24.71875 L 16 25.40625 L 16.71875 24.71875 L 29.21875 12.21875 L 27.78125 10.78125 L 16 22.5625 Z" /></svg>);
}
const PDFpreview: React.FC<PDFPreviewProps> = (props) => {
    const {
        preparedPreviewPages,
        handlePreviewChange,
        previewOption,
        leftPreviewShow,
        nowPage,
        dynamicAllPageRef,
        tempAOI,
        selAOI,
        set_selAOI,
        hideAOIPageListArr,
        set_hideAOIPageListArr,
        foldAOIList,
        set_foldAOIList
    } = props;

    const PDFpreviewRef = useRef<HTMLDivElement>(null);
    const previewContentsRef = useRef<HTMLDivElement>(null);
    const previewPageRefArr = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
    if (previewPageRefArr.current.length !== tempAOI.length) {
        previewPageRefArr.current = Array(tempAOI.length)
            .fill(null)
            .map((_, i) => previewPageRefArr.current[i] || createRef<HTMLDivElement>());
    }
    
    //스크롤 자동이동 nowPage이동에 따른
    useEffect(() => {
        if(!previewOption||!previewOption.pageMargin) return;

        if (PDFpreviewRef.current) {
            // 계산을 통해 onePageWrap이 보이게 하는 로직을 작성합니다.
            const pageWrapHeight = PDFpreviewRef.current.offsetHeight;
            // const scrollContainerHeight = PDFpreviewRef.current.scrollHeight;
            const currentScroll = PDFpreviewRef.current.scrollTop;

            const visibleMin = currentScroll;
            const visibleMax = currentScroll + pageWrapHeight;

            // console.log("pageWrapHeight",pageWrapHeight)
            // console.log("scrollContainerHeight",scrollContainerHeight);
            // console.log("visibleMin",visibleMin,visibleMax)

            // let data=[];
            let hs = 0;

            for (let i = 0; i < preparedPreviewPages.length; i++) {
                const onePage = preparedPreviewPages[i];
                const onePageHeight = onePage.wrapperSize.height + previewOption.pageMargin + 25;
                // data.push({
                //     pageNumber: i+1,
                //     pageHeight:onePageHeight,
                //     viewMinScrollHeight:hs,
                //     viewMaxScrollHeight:hs+onePageHeight,
                //     visible: hs>=visibleMin && (hs+onePageHeight)<=visibleMax ? true:false       
                // });

                if (nowPage === i + 1) {
                    const isneedtomovescroll = hs >= visibleMin && (hs + onePageHeight) <= visibleMax ? false : true;
                    if (isneedtomovescroll) {
                        //위아래인지 구분
                        PDFpreviewRef.current.scrollTop = hs;
                    }
                }
                hs += onePageHeight;
            }
        }
    }, [nowPage, preparedPreviewPages, previewOption]);

    const [foldPreview, set_foldPreview] = useState(false);
    
    //실제 pdf 보여지는page의 스크롤을 이동하는 함수임
    const handleScrollTothePage = useCallback((pageNumber:number) => {
        if (dynamicAllPageRef && dynamicAllPageRef.current) {
            // console.log(dynamicAllPageRef.current);
            dynamicAllPageRef.current.set_scrollMoveToPage(pageNumber);
        }
    },[dynamicAllPageRef]);
    
    // console.log("selAOI",selAOI)

    //고른 AOI 가 메뉴에 안보이면 AreaList Scroll을 이동시키는코드
    useEffect(() => {
        if (selAOI && previewContentsRef.current) {
            const pageNumber = selAOI.pageNumber;
            // const AOINumber = selAOI.AOINumber;
            // previewPageRefArr.current[pageNumber-1].current.scrollIntoView();
            // 무조건 이동,...

            const scrollElement = previewContentsRef.current;
            //스크롤을 움직여야할 element
            const currentScroll = scrollElement.scrollTop;
            const pageWrapHeight = scrollElement.offsetHeight;
            const visibleMin = currentScroll;
            const visibleMax = currentScroll + pageWrapHeight;
            const targetElement:HTMLDivElement |null = previewPageRefArr.current[pageNumber-1].current;
            //타겟element전까지 계산해야한다
            //1개의 AOI의 높이는 20
            //그룹의 높이도 20임.
            let totalHeight = 0;
            let pageStartHeight=0;
            let pageEndHeight=0;
            // Calculate the total height of hidden AOIs in collapsed groups
            for (let i = 0; i <= pageNumber - 1; i++) {
                const isHideChildAOIS = hideAOIPageListArr[i];
                pageStartHeight = totalHeight;

                if (!isHideChildAOIS) {
                    totalHeight += 20+tempAOI[i].length * 20; // Assuming each AOI has a height of 20
                }
                else{
                    totalHeight += 20
                }
                pageEndHeight=totalHeight
            }

            if(pageStartHeight>=visibleMin && pageStartHeight<=visibleMax
                &&pageEndHeight>=visibleMin && pageEndHeight<=visibleMax){
                // console.log("이미보이고있어서 스크롤이동을 하지 않겠다.")
            }
            else{
                // scrollElement.scrollTop = pageStartHeight;
                targetElement?.scrollIntoView({ block: 'center' });
            }
        }
    }, [selAOI,tempAOI,hideAOIPageListArr]);


    //#@! textinput Blur가 호출안댐
    

    const previewStyle= useMemo(()=>{
        if(!previewOption?.wrapperStyle?.width || !previewOption.pageMargin){
            return {};
        }
        const styleLeft= leftPreviewShow ? 
        0:-(previewOption.wrapperStyle.width + previewOption.pageMargin * 2);

        return {
            ...previewOption.wrapperStyle,
            left: styleLeft
        }
    },[previewOption,leftPreviewShow]);


    return (<div className="PDFpreview no-drag"
        style={previewStyle}>
        <div className="onePreView">
            <div className="previewTitle" onClick={() => set_foldPreview(d => !d)}>
            <FoldSvg isFold={foldPreview} />
                &nbsp;PDF Page List
            </div>
            <div className="previewContents" style={{ maxHeight: foldPreview ? 0 : '100%' }} ref={PDFpreviewRef}>
                {previewOption && preparedPreviewPages &&
                    preparedPreviewPages.map((onePage, index) => {
                        return (
                            <div className="onePageWrap"
                                style={{
                                    marginTop: previewOption.pageMargin,
                                }}
                                key={'preview_' + index}
                            >
                                <div style={{
                                    position: 'relative',
                                    width: onePage.wrapperSize.width,
                                    height: onePage.wrapperSize.height,
                                }}>
                                    <canvas
                                        className="onePageCanvas"
                                        style={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                        width={onePage.canvasSize.width} // Set the canvas width
                                        height={onePage.canvasSize.height} // Set the canvas height

                                        ref={(canvas: HTMLCanvasElement | null) => {
                                            // console.log("onePage",onePage);
                                            if (canvas && onePage.canvas) {
                                                // Get the canvas's 2D rendering context
                                                const context = canvas.getContext('2d');
                                                // Draw the canvas content onto the canvas element
                                                if(context){
                                                    context.drawImage(onePage.canvas, 0, 0);
                                                }
                                                // delete onePage.canvas;
                                            }
                                        }}

                                    />
                                    <div className={`onePageBlur ${nowPage === (index * 1 + 1) ? 'selPage' : ''}`} onClick={() => {
                                        if (handlePreviewChange) {
                                            handlePreviewChange(index + 1);
                                            //#@! 스크롤이 있다면 이동

                                        }
                                        handleScrollTothePage(index + 1);
                                    }} />
                                </div>


                                <div className="pageNumberWrapper">
                                    {index + 1}
                                </div>
                            </div>)
                    })
                }
                {/* <div style={{height:25}}/> */}
            </div>
            <div className="previewTitle" onClick={() => set_foldAOIList(d => !d)}>
                    <FoldSvg isFold={foldAOIList} />
                &nbsp;Area List
            </div>
            <div className="previewContents" ref={previewContentsRef} style={{ maxHeight: foldAOIList ? '0' : '100%' }}>
                {tempAOI && tempAOI.map((pageAOI, pageIndex) => {
                     return (
                        <div key={`pageAOI_${pageIndex}`} ref={previewPageRefArr.current[pageIndex]}>
                            <div className={`pageAOIGroup`} onClick={() => {
                                handleScrollTothePage(pageIndex + 1);
                                set_hideAOIPageListArr(prevState => {
                                    const newToggles = { ...prevState };
                                    newToggles[pageIndex] = !prevState[pageIndex];
                                    return newToggles;
                                });
                            }}>
                                <FoldSvg isFold={hideAOIPageListArr[pageIndex]} />   &nbsp;{(pageIndex + 1) + ' page AOI'}
                            </div>
                            {!hideAOIPageListArr[pageIndex] && pageAOI.map((oneAOI: Coordinate, AOIindex: number) => {
                                const AOI_type = oneAOI.type;
                                const AOI_type_text = AOI_type === "MC" ? "객관식" : "주관식";
                                let isSelected = false;
                                if (selAOI && selAOI.pageNumber === pageIndex + 1 && selAOI.AOINumber === AOIindex + 1) {
                                    isSelected = true;
                                }
                                return (
                                    <div className={`oneAOI ${AOI_type} ${isSelected ? 'focused' : ''}`}
                                        key={`oneAOIofPage_${AOIindex}`}
                                        onClick={() => {
                                            if (dynamicAllPageRef && dynamicAllPageRef.current) {
                                                dynamicAllPageRef.current.set_focusAOIArea(pageIndex + 1, AOIindex + 1);
                                                set_selAOI({
                                                    pageNumber: pageIndex + 1,
                                                    AOINumber: AOIindex + 1
                                                });
                                            }
                                        }}>
                                        &nbsp;&nbsp;<div className={AOI_type}>{AOI_type_text}</div>&nbsp;
                                        <div className="aoi_name">
                                            {oneAOI.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

            </div>
        </div>



    </div>)

}
export default PDFpreview;