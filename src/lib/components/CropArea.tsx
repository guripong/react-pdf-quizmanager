import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle, CSSProperties } from 'react';
import interact from 'interactjs';
import TextInput from './TextInput';
import QuizDetail from './QuizDetail';
import { CropAreaInstance, CropAreaProps } from 'lib/PDF_Quiz_Types';
import { ResizeEvent } from '@interactjs/types';

interface TextInputInstance {
    set_textEditMode: (value: boolean) => void
}


const CropArea = forwardRef<CropAreaInstance, CropAreaProps>((props, ref) => {
    const { onFixCropName, set_selAOI, onMove, 
        onResize, pageIndex, areaIndex,
        coordinate, containerInform, onDelete } = props;
        const [isFocused, setIsFocused] = useState(false);
        const cropAreaRef = useRef<HTMLDivElement>(null);
        const textInputRef = useRef<TextInputInstance>(null);
        const [editMode, set_editMode] = useState<boolean>(false);

    // const [showQuizDetail, set_showQuizDetail] = useState(false);

    useImperativeHandle(ref, () => ({
        set_focusArea() {
            // console.log("포커스아래아")
            setIsFocused(true);
            cropAreaRef.current?.scrollIntoView({ block: 'center' });
        },
        set_textEditMode(val) {
            // console.log("CropArea의 set_textEditMode 호출")
            set_editMode(val);
        }
    }), []);

    
    useEffect(() => {
        if (editMode && textInputRef.current) {
            // console.log("하 다시")
            textInputRef.current?.set_textEditMode(true);
            // console.log("editMode",editMode)
            // console.log("textInputRef.current",textInputRef.current)
        }
    }, [editMode])

    const cropStyle = useCallback((): CSSProperties  => {
        if (!containerInform) return {};
        const { xr, yr, widthr, heightr, type } = coordinate;
        const containerWidth = containerInform.width;
        const containerHeight = containerInform.height;
        // console.log("containerWidth",containerWidth)
        let backgroundColor;
        if (type === 'quiz') {
            backgroundColor = 'rgba(255,0,0,.3)';
        }
        else if (type === 'pic') {
            backgroundColor = "rgba(0,255,0,.3)"
        }
        else if (type === 'text') {
            backgroundColor = "rgba(0,0,255,.3)";
        }


        return {
            display: 'inline-block',
            position: 'absolute',
            width: containerWidth * widthr,
            height: containerHeight * heightr,
            top: containerHeight * yr,
            left: containerWidth * xr,
            //   boxShadow: '0 0 6px #000',
            //   background: '#8c8c8c',
            background: backgroundColor|| "transparent", // 기본값 설정,
            // opacity: 0.3,
        };
    }, [coordinate, containerInform]);

    useEffect(() => {
        if (!isFocused) {
            // console.log("포커스풀림", pageIndex, areaIndex)
            set_selAOI(null);

        }
        else {
            // console.log("asfasf")
        }

    }, [isFocused, set_selAOI]);

    useEffect(() => {
        if (!containerInform) return;
        if(!cropAreaRef.current) return;

        // console.log("coordinate",coordinate);
        console.log("@@@@@@@@@@이벤트등록")
        const interactInstance = interact(cropAreaRef.current);
        const handleResizeMove = (e:ResizeEvent) => {
            if (onResize) {
                onResize(pageIndex, areaIndex, e, containerInform);
            }
        };
        
        const handleDragMove = (e:Interact.InteractEvent) => {
            if (onMove) {
                onMove(pageIndex, areaIndex, e, containerInform);
            }
        };
        // console.log("containerInform",containerInform)

        interactInstance.draggable({
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent',

                }),
            ],
            autoScroll: true
        }).resizable({
            edges: {
                left: true, right: true, bottom: true, top: true,
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: {
                        width: containerInform.width * 0.05,
                        height: containerInform.height * 0.05
                    }
                })
            ],
        }).on('dragmove', handleDragMove).on('resizemove', handleResizeMove);

        // interactInstance.on('dragmove', handleDragMove);
        // interactInstance.on('resizemove', handleResizeMove);

        return () => {
            // Clean up the interact instance when the component unmounts
            console.log(
                "클린업"
            )
            interactInstance.unset();
        };
    }, [containerInform, pageIndex, areaIndex, onResize, onMove]);



    // const handleFocus = () => {
    //     console.log("포커스")
    //     setIsFocused(true);
    //     if (set_selAOI) {
    //         set_selAOI({
    //             pageNumber: pageIndex + 1,
    //             AOINumber: areaIndex + 1
    //         });
    //     }
    // };


    useEffect(()=>{
        // console.log("isFocused",isFocused);
        if(isFocused){
            set_selAOI({
                pageNumber: pageIndex + 1,
                AOINumber: areaIndex + 1
            });
        }
    },[isFocused,pageIndex,areaIndex,set_selAOI])

    useEffect(()=>{
        const handleClickOutside = (e:MouseEvent) => {
            e.stopPropagation();
            if (cropAreaRef.current && !cropAreaRef.current.contains(e.target as Node)) {
                // quizDetailRef 외부를 클릭했을 때
                setIsFocused(false);
            }
            else{
                setIsFocused(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    },[])
    


    const handleQuizDetailUpdate = () => {
        //불리언 리턴
        console.log("handleQuizDetailUpdate");
        //업뎃하면댐
    }
    const handleQuizDetailCancel = () => {
        //불리언리턴
        
        console.log("handleQuizDetailCancel");
        //취소하면댐
    }


    const handleChangeEditMode=useCallback((editMode:boolean) => {
        // console.log("editMode바뀜", editMode)
        set_editMode(editMode);
    },[]);

    return (<div className="CropArea" ref={cropAreaRef} style={cropStyle()}
        // onFocus={handleFocus}
   
    >
        <div className={`CropAreaWrapper ${isFocused ? 'active-animatioon' : ''}`}>
            {isFocused &&
                <div className="topAOIBar" style={{ opacity: 1 }}>

                    <div className="fixCropName">
                        <TextInput
                            ref={textInputRef}
                            value={coordinate.name}
                            onChange={(newFileName) => {
                                // set_fileName(newFileName)
                                if (onFixCropName) {
                                    onFixCropName(coordinate, newFileName);
                               

                                    cropAreaRef.current?.focus();
                                }
                            }}
                            onBlur={(newFileName) => {
                                if (onFixCropName) {
                                    onFixCropName(coordinate, newFileName);
                                }
                            }}
                            onCancel={() => {
                                cropAreaRef.current?.focus();
                            }}

                            onEditModeChanged={handleChangeEditMode}

                        />
                    </div>

                    {!editMode &&
                        <>
                            {coordinate.type === 'quiz'
                                && <QuizDetail coordinate={coordinate}
                                    onQuizDetailChanged={handleQuizDetailUpdate}
                                    handleQuizDetailCancel={handleQuizDetailCancel}
                                />}

                            <div className="delCrop"
                                onMouseDown={() => {
                                    // console.log("딜링트마우스다운")
                                    if(onDelete){
                                        onDelete(coordinate)
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

    </div>)
});

export default CropArea;