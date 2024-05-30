import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';

import TextInput from './TextInput';
import QuizDetail from './QuizDetail';
import { Coordinate, CropAreaInstance, CropAreaProps } from 'lib/PDF_Quiz_Types';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

interface TextInputInstance {
    set_textEditMode: (value: boolean) => void
}




const CropArea2 = forwardRef<CropAreaInstance, CropAreaProps>((props, ref) => {
    const { onFixCropName, set_selAOI,
        onChangeOneAOI,
        containerRef, pageIndex, areaIndex,
        oneAOI, containerInform, onDeleteAOI } = props;
    const [isFocused, setIsFocused] = useState(false);
    const cropAreaRef = useRef<Rnd>(null);
    const textInputRef = useRef<TextInputInstance>(null);
    const [editMode, set_editMode] = useState<boolean>(false);

    // console.log("oneAOI",oneAOI)
    // const [showQuizDetail, set_showQuizDetail] = useState(false);

    useImperativeHandle(ref, () => ({
        set_focusArea() {
            setIsFocused(true);
            const el = cropAreaRef.current?.resizableElement.current;
            el?.scrollIntoView({ block: 'center' });
        },
        set_textEditMode(val) {
            // console.log("CropArea의 set_textEditMode 호출")
            set_editMode(val);
        },
        get_oneAOI() {
            return oneAOI;
        }
    }), [oneAOI]);


    useEffect(() => {
        if (editMode && textInputRef.current) {
            // console.log("하 다시")
            textInputRef.current?.set_textEditMode(true);
            // console.log("editMode",editMode)
            // console.log("textInputRef.current",textInputRef.current)
        }
    }, [editMode])


    useEffect(() => {
        let a: NodeJS.Timeout | number | undefined;
        if (!isFocused) {
            // console.log("포커스풀림", pageIndex, areaIndex);

            set_selAOI(null);

        }
        else {
            // console.log("asfasf")
            // console.log("포커스됨",pageIndex,areaIndex)

            a = setTimeout(function () {
                set_selAOI({
                    pageNumber: pageIndex + 1,
                    AOINumber: areaIndex + 1,
                });
            }, 10);
        }
        return () => {
            if (a !== undefined) {
                clearTimeout(a);
            }
        }

    }, [isFocused, set_selAOI, pageIndex, areaIndex]);






    //AOI밖에 클릭시.. AOI focus를 풀어줍니다.
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            e.stopPropagation();
            const el = cropAreaRef.current?.resizableElement.current;
            if (el && !el.contains(e.target as Node)) {
                // quizDetailRef 외부를 클릭했을 때
                setIsFocused(false);
            }
            else {
                setIsFocused(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])



    const handleChangeEditMode = useCallback((editMode: boolean) => {
        // console.log("editMode바뀜", editMode)
        set_editMode(editMode);
    }, []);



    const [cropRenderSize, setCropRenderSize] = useState({
        width: oneAOI.width + "%",
        height: oneAOI.height + "%",
        x: containerRef.current ? oneAOI.x / 100 * containerRef.current.offsetWidth : 0,
        y: containerRef.current ? oneAOI.y / 100 * containerRef.current.offsetHeight : 0,
    })


    //사이즈 변경시 이걸 호출하는데
    //문제가 prsample값이 바뀔때도 불필요하게 호출
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
                });
                // handleTestLoad();
            });
        });

        resizeObserver.observe(wrapEl);
        return () => {
            resizeObserver.disconnect();
        }

    }, [containerRef, oneAOI])



    const backgroundColor = useMemo(() => {
        const { type } = oneAOI;
        let bc;
        if (type === 'MC') {
            bc = 'rgba(255,0,0,.3)';
        }
        else if (type === 'SJ') {
            bc = "rgba(0,0,255,.3)";
        }
        return bc;
    }, [oneAOI])


    const handleOnResizeStop: RndResizeCallback = useCallback((e, direction, ref, delta, position) => {
        const left = containerRef.current ? (position.x * 100 / containerRef.current.offsetWidth) : 0;
        const top = containerRef.current ? (position.y * 100 / containerRef.current.offsetHeight) : 0;
        setCropRenderSize({
            width: ref.style.width,
            height: ref.style.height,
            ...position,
        });

        // areaIndex,areaIndex

        // console.log("원래원본:",oneAOI);
        const newAOI: Coordinate = {
            ...oneAOI,
            width: parseFloat(ref.style.width),
            height: parseFloat(ref.style.height),
            x: left,
            y: top,
        }
        onChangeOneAOI(newAOI, pageIndex, areaIndex);

        // setpsample({
        //     width: parseFloat(ref.style.width),
        //     height: parseFloat(ref.style.height),
        //     left: left,
        //     top: top,
        // });
    }, [containerRef, oneAOI, onChangeOneAOI, pageIndex, areaIndex]);


    const handleOnDragStop: RndDragCallback = useCallback((e, d) => {
        // console.log("원래원본드래그끝:",oneAOI);

        const newAOI: Coordinate = {
            ...oneAOI,
            x: containerRef.current ? d.x * 100 / containerRef.current.offsetWidth : 0,
            y: containerRef.current ? d.y * 100 / containerRef.current.offsetHeight : 0,
        }
        // console.log("dragStop oneAOI",oneAOI)
        // console.log("dragStop newAOI:",newAOI);
        onChangeOneAOI(newAOI, pageIndex, areaIndex);

        setCropRenderSize((bs) => {
            return {
                ...bs,
                x: d.x,
                y: d.y,
            }
        });


    }, [containerRef, oneAOI, onChangeOneAOI, pageIndex, areaIndex]);


    //#@!#@!
    //topAOIBar 의
    //방향을 위치에 따라 할당해줘야함

    return (

        <Rnd
            className="CropArea"
            ref={cropAreaRef}
            style={{
                background: backgroundColor, // 기본값 설정,
            }}
            size={{ width: cropRenderSize.width, height: cropRenderSize.height }}
            bounds={containerRef.current || undefined}
            position={{ x: cropRenderSize.x, y: cropRenderSize.y }}
            maxWidth={"100%"}
            maxHeight={"100%"}
            enableResizing={{
                bottom: true,
                bottomLeft: true,
                bottomRight: true,
                left: true,
                right: true,
                top: false,
                topLeft: false,
                topRight: false,
            }}
            // minWidth={"5%"}
            // minHeight={"5%"}
            // disableDragging={disableDragging}
            // onDragStart={(e)=>{
            //     console.log("드래그시작",e)
            //     // e.preventDefault();
            //     // e.stopPropagation();
            // }}
            onDragStop={handleOnDragStop}
            onResizeStop={handleOnResizeStop}
        >
            <div className={`CropAreaWrapper ${isFocused ? 'active-animatioon' : ''}`}>
                {isFocused &&
                    <div className="topAOIBar" style={{
                        opacity: 1,

                        // pointerEvents: "none" // Prevents drag and other pointer events
                    }}

                        onMouseDown={(e) => {
                            e.stopPropagation();
                            // console.log("Mouse down on topAOIBar - dragging disabled");
                        }}
                    >

                        <div className="fixCropName">
                            <TextInput
                                ref={textInputRef}
                                value={oneAOI.name}
                                onChange={(newFileName) => {
                                    // set_fileName(newFileName)
                                    if (onFixCropName) {
                                        onFixCropName(oneAOI, newFileName);

                                        const el = cropAreaRef.current?.resizableElement.current;
                                        el?.focus();
                                    }
                                }}
                                onBlur={(newFileName) => {
                                    if (onFixCropName) {
                                        onFixCropName(oneAOI, newFileName);
                                    }
                                }}
                                onCancel={() => {
                                    const el = cropAreaRef.current?.resizableElement.current;
                                    el?.focus();
                                }}

                                onEditModeChanged={handleChangeEditMode}

                            />
                        </div>

                        {!editMode &&
                            <>

                                {oneAOI.type === 'MC'
                                    &&
                                    <>
                                        <div className="quizShort">
                                            <div>
                                                Q:{oneAOI.quizOptionCount}
                                            </div>
                                            <div>
                                                A:{oneAOI.correctAnswer===0?"X":oneAOI.correctAnswer}
                                            </div>
                                            <QuizDetail oneAOI={oneAOI}
                                                onChangeOneAOI={onChangeOneAOI}
                                                pageIndex={pageIndex}
                                                areaIndex={areaIndex}
                                  
                                            />
                                        </div>
                                    </>
                                }

                                <div className="delCrop"
                                    onMouseDown={() => {
                                        // console.log("딜링트마우스다운")
                                        
                                        if (onDeleteAOI) {
                                            onDeleteAOI(oneAOI)
                                        }

                                    }}
                                >
                                    X
                                </div>
                            </>

                        }

                    </div>

                }

            </div>
        </Rnd>

    )
});

export default CropArea2;