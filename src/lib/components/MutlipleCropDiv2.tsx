import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import shortid from 'shortid';
import "./MultipleCropDiv.scss";
import { Coordinate, CropAreaInstance, MultipleCropDivInstance, MultipleCropDivProps } from 'lib/PDF_Quiz_Types';
import CropArea2 from './CropArea2';


// import _ from "lodash";
//https://github.com/beizhedenglong/react-multi-crops/blob/master/src/components/Crop.js


const MultipleCropDiv2 = forwardRef<MultipleCropDivInstance, MultipleCropDivProps>((props, ref) => {
  const { AOI_mode, pageAOIArr, pageIndex, onDeleteAOI } = props;
  const drawingIndexRef = useRef(-1);
  const pointARef = useRef<null | { x: number; y: number; xr: number; yr: number }>(null);
  const isMouseDown = useRef<boolean | null>(null);
  const isMouseMove = useRef<boolean | null>(null);

  const idRef = useRef(shortid.generate());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerInform, set_containerInform] = useState<{ width: number; height: number } | undefined>();


  //여기에 하나의 PDF page안의 AOI들이 여기 들어있음
  const cropAreaRefArr = useRef<React.RefObject<CropAreaInstance>[]>([]);


  useImperativeHandle(ref, () => ({
    set_focusArea(AreaNumber) {
      if (cropAreaRefArr.current && cropAreaRefArr.current[AreaNumber - 1]
        && cropAreaRefArr.current[AreaNumber - 1]?.current) {
        cropAreaRefArr.current[AreaNumber - 1]?.current?.set_focusArea();
      }
    },
  }), []);


  const getCursorPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = containerRef.current!.getBoundingClientRect();
    const containerWidth = containerRef.current!.offsetWidth;
    const containerHeight = containerRef.current!.offsetHeight;
    const x = e.clientX - left;
    const y = e.clientY - top;
    return {
      x: x,
      y: y,
      xr: x / containerWidth*100, //0~100 퍼센트
      yr: y / containerHeight*100, // 0~100퍼센트

    };
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { pageAOIArr } = props;
    if (e.target === containerRef.current) {
      //컨테이너클릭시
      console.log("클릭!")
      const pointA = getCursorPosition(e);
      // console.log("마우스다운위치", pointA)
      drawingIndexRef.current = pageAOIArr.length;
      pointARef.current = pointA;

      isMouseDown.current = true;
      idRef.current = shortid.generate();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if(!containerRef.current) return;
    const { onChangeAOI, pageAOIArr } = props;
    const pointA = pointARef.current;
    if (!pointA) return;
    if (!AOI_mode) return;
    //AOI_mode 는 추가할때의 mode 입니다


    if (pointA) {
      // console.log("pointA", pointA)
      const pointB = getCursorPosition(e);
      isMouseMove.current = true;
      let type = "";
      if (AOI_mode === 1) {
        type = "quiz"
      }
      else if (AOI_mode === 2) {
        type = "pic"
      }
      else if (AOI_mode === 3) {
        type = "text"
      }


      // Get the drawing coordinate
      const tempCoordinate: Coordinate = {
        x: Math.min(pointA.x, pointB.x)/containerRef.current.offsetWidth*100,
        y: Math.min(pointA.y, pointB.y)/containerRef.current.offsetHeight*100,
        width: Math.abs(pointA.xr - pointB.xr),
        height: Math.abs(pointA.yr - pointB.yr),
        id: idRef.current,
        type: type,
        name: `임시영역(${pageIndex + 1}-${pageAOIArr.length})`
      };



      if (type === 'quiz') {
        tempCoordinate.quizOptionCount = 4;
        tempCoordinate.correctAnswer = 1;
        tempCoordinate.shouldSolveQuestion = false;
      }
      // console.log("tempCoordinate",tempCoordinate)
      // console.log("pointA",pointA)
      // console.log("pageAOIArr",pageAOIArr)
      const nextpageAOIArr = [...pageAOIArr];
      nextpageAOIArr[drawingIndexRef.current] = tempCoordinate;

      // if (typeof onDraw === 'function') {
      //   console.log("드로")
      //   onDraw(tempCoordinate, drawingIndexRef.current, nextpageAOIArr);
      // }

      if (typeof onChangeAOI === 'function') {
        onChangeAOI(nextpageAOIArr);
      }
    }
  }

  const handleMouseUp = () => {
    pointARef.current = null;
    if(!pageAOIArr.length)return;
    if (!AOI_mode) return;
    if(!isMouseDown.current){
      return;
    }
    if(!isMouseMove.current){
      return;
    }

    isMouseMove.current=false;
    isMouseDown.current=false;

    const lastcoordinate=pageAOIArr[pageAOIArr.length-1];

    if(onDeleteAOI&& (lastcoordinate.width<5 || lastcoordinate.height<5)){

        onDeleteAOI(lastcoordinate)
        cropAreaRefArr.current.pop(); // 삭제된 AOI에 해당하는 ref 제거
        isMouseMove.current=false;
        isMouseDown.current=false;
        return;
    }

    // console.log("cropAreaRefArr.current",cropAreaRefArr.current[cropAreaRefArr.current.length-1])
    if(cropAreaRefArr.current&&cropAreaRefArr.current.length>0){


      //해당 페이지의 맨 마지막임
      const lastCropAreaRef = cropAreaRefArr.current[cropAreaRefArr.current.length - 1];
      lastCropAreaRef.current?.set_focusArea();
      lastCropAreaRef.current?.set_textEditMode(true);
      

    }



  };

  const handleMouserLeave = () => {

    pointARef.current = null;
    if(!pageAOIArr.length)return;
    if (!AOI_mode) return;
    if(!isMouseDown.current){
      return;
    }
    if(!isMouseMove.current){
      return;
    }
    // console.log("@@@@@@@@@@@@@@@마우스리브")
    isMouseMove.current=false;
    isMouseDown.current=false;
    // const coordinate = pageAOIArr[]
    // console.log("pageAOIArr",pageAOIArr)
    const lastcoordinate=pageAOIArr[pageAOIArr.length-1];
    //#@!
    if(onDeleteAOI&& (lastcoordinate.width<5 || lastcoordinate.height<5)){
        onDeleteAOI(lastcoordinate)
        return;
    }

    if(cropAreaRefArr.current&&cropAreaRefArr.current.length){
      cropAreaRefArr.current[cropAreaRefArr.current.length-1]?.current?.set_focusArea();
      cropAreaRefArr.current[cropAreaRefArr.current.length-1]?.current?.set_textEditMode(true);
    }

    // console.log("lastcoordinate",lastcoordinate)

  };





  //리사이즈시 컨테이너사이즈재정의
  useEffect(() => {
    if (!containerRef.current) return;
    const wrapEl = containerRef.current;

    function resetContainerInform() {
      const containerWidth = wrapEl.offsetWidth;
      const containerHeight = wrapEl.offsetHeight;
      set_containerInform({
        width: containerWidth,
        height: containerHeight,

      })
    }

    const resizeObserver = new ResizeObserver(entries => {
      // 크기 변경시 실행할 작업을 여기에 작성합니다.
      entries.forEach(() => {
        // console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
        // set_renderWidth(entry.contentRect.width * viewPercent / 100);
        // const contentWidth = wrapEl.offsetWidth;
        // const contentHeight = wrapEl.offsetHeight;
        // debouncedResetContainerInform();
        resetContainerInform();
        // handleTestLoad();
      });
    });
    resizeObserver.observe(wrapEl);
    return () => {
      resizeObserver.disconnect();
    }

  }, []);


  // console.log("sample값확인", sample);


  const handleonDeleteAOI = (targetDeleteAOI:Coordinate)=>{
    if(onDeleteAOI){
      for(let i = 0 ; i <cropAreaRefArr.current.length ; i++){
        const findAOI=cropAreaRefArr.current[i].current?.get_oneAOI();
        if(findAOI&&targetDeleteAOI.id ===findAOI.id){
          // cropAreaRefArr.current 의 i번째를 삭제
          cropAreaRefArr.current.splice(i, 1); // cropAreaRefArr.current의 i번째 요소 제거
          break;
        }
      }
      onDeleteAOI(targetDeleteAOI);
    }
  }

  const handleChangeAOI = ()=>{
    const { onChangeOneAOI, pageAOIArr } = props;
    if (typeof onChangeOneAOI === 'function') {
      //console.log("pageAOIArr",pageAOIArr);

      // onChangeOneAOI();
    }

  }

  //한페이지당  여러 AOI가 이곳에 랜더
  return (<div className="Cropcontainer no-drag"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouserLeave}
    onMouseUp={handleMouseUp}
    ref={containerRef}
  >
    {containerInform && pageAOIArr && pageAOIArr.map((oneAOI, aoiIndex) => {
      // console.log("coordinate",coordinate)
      // console.log("cropAreaRefArr.current",cropAreaRefArr.current,"aoiIndex",aoiIndex)
      return (
        <CropArea2
          {...props}
          containerRef={containerRef}
          ref={(ref:CropAreaInstance | null) => {
             cropAreaRefArr.current[aoiIndex] = { current: ref };
          }}
          
          key={oneAOI.id || aoiIndex}
          areaIndex={aoiIndex}
          pageIndex={pageIndex}
          containerInform={containerInform}
          oneAOI={oneAOI}
          onDeleteAOI={handleonDeleteAOI}
          
        />
      )
    })}


  </div>)
});



export default MultipleCropDiv2;