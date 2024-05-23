import React, { useRef, useState, useEffect ,forwardRef,useImperativeHandle,createRef} from 'react';
import shortid from 'shortid';
import "./MultipleCropDiv.scss";
import CropArea from './CropArea';
import { Coordinate, CropAreaInstance, MultipleCropDivInstance, MultipleCropDivProps } from 'lib/PDF_Quiz_Types';
// import _ from "lodash";
//https://github.com/beizhedenglong/react-multi-crops/blob/master/src/components/Crop.js


const MultipleCropDiv = forwardRef<MultipleCropDivInstance, MultipleCropDivProps>((props, ref) => {
  const { AOI_mode, coordinates, pageIndex , onDelete } = props;
  const drawingIndexRef = useRef(-1);
  const pointARef = useRef<null | { x: number; y: number; xr: number; yr: number }>(null);
  const isMouseDown = useRef<boolean | null>(null);
  const isMouseMove = useRef<boolean | null>(null);

  const idRef = useRef(shortid.generate());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerInform, set_containerInform] = useState<{ width: number; height: number } | undefined>();

  // const cropAreaRefArr = useRef([]);
  // const cropAreaRefArr = useRef(Array.from({ length: coordinates.length }, () => createRef()));
  const cropAreaRefArr = useRef<Array<React.RefObject<CropAreaInstance>>>(Array.from({ length: coordinates.length }, () => createRef()));



  useImperativeHandle(ref, () => ({
    set_focusArea(AreaNumber) {
        if(cropAreaRefArr.current&&cropAreaRefArr.current[AreaNumber-1]
          &&cropAreaRefArr.current[AreaNumber-1]?.current){
          cropAreaRefArr.current[AreaNumber-1]?.current?.set_focusArea();
        }
    },
  }), []);


  const getCursorPosition = (e:React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = containerRef.current!.getBoundingClientRect();
    const containerWidth = containerRef.current!.offsetWidth;
    const containerHeight = containerRef.current!.offsetHeight;
    const x = e.clientX - left;
    const y = e.clientY - top;
    return {
      x: x,
      y: y,
      xr: x / containerWidth,
      yr: y / containerHeight,

    };
  };

  const handleMouseDown = (e:React.MouseEvent<HTMLDivElement>) => {
    const { coordinates } = props;
    if (e.target === containerRef.current) {
      const pointA = getCursorPosition(e);
      // console.log("마우스다운위치", pointA)
      drawingIndexRef.current = coordinates.length;
      pointARef.current = pointA;

      isMouseDown.current=true;
      idRef.current = shortid.generate();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { onChange, coordinates } = props;
    const pointA = pointARef.current;
    if (!pointA) return;
    if (!AOI_mode) return;

    if (pointA) {
      // console.log("pointA", pointA)
      const pointB = getCursorPosition(e);
      isMouseMove.current=true;
      let type="";
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
      const tempCoordinate:Coordinate = {
        x: Math.min(pointA.x, pointB.x),
        y: Math.min(pointA.y, pointB.y),
        widthr: Math.abs(pointA.xr - pointB.xr),
        heightr: Math.abs(pointA.yr - pointB.yr),
        xr: Math.min(pointA.xr, pointB.xr),
        yr: Math.min(pointA.yr, pointB.yr),
        id: idRef.current,
        type: type,
        name: `임시영역(${pageIndex + 1}-${coordinates.length})`
      };

      if(type==='quiz'){
        tempCoordinate.quizOptionCount=4;
        tempCoordinate.correctAnswer=1;
        tempCoordinate.shouldSolveQuestion=false;
      }
      

      // console.log("coordinates",coordinates)
      const nextCoordinates = [...coordinates];
      nextCoordinates[drawingIndexRef.current] = tempCoordinate;

      // if (typeof onDraw === 'function') {
      //   console.log("드로")
      //   onDraw(tempCoordinate, drawingIndexRef.current, nextCoordinates);
      // }

      if (typeof onChange === 'function') {
        onChange(tempCoordinate, drawingIndexRef.current, nextCoordinates);
      }
    }
  }

  const handleMouseUp = () => {
    pointARef.current = null;
    if(!coordinates.length)return;
    if (!AOI_mode) return;
    if(!isMouseDown.current){
      return;
    }
    if(!isMouseMove.current){
      return;
    }
    // console.log("@@@@@@@@@@@@@@@마우스업")
    isMouseMove.current=false;
    isMouseDown.current=false;
    // const coordinate = coordinates[]
    // console.log("coordinates",coordinates)
    const lastcoordinate=coordinates[coordinates.length-1];
    //#@!
    if(onDelete&& (lastcoordinate.widthr<0.05 || lastcoordinate.heightr<0.05)){

        onDelete(lastcoordinate)
        isMouseMove.current=false;
        isMouseDown.current=false;
        return;
    }

    // console.log("cropAreaRefArr.current",cropAreaRefArr.current[cropAreaRefArr.current.length-1])
    if(cropAreaRefArr.current&&cropAreaRefArr.current.length){
      cropAreaRefArr.current[cropAreaRefArr.current.length-1]?.current?.set_focusArea();
      // setTimeout(function(){
      cropAreaRefArr.current[cropAreaRefArr.current.length-1]?.current?.set_textEditMode(true);
    }

    // },100);

    // console.log("lastcoordinate",lastcoordinate)
    // if(cropAreaRefArr.current&&cropAreaRefArr.current[AreaNumber-1]&&cropAreaRefArr.current[AreaNumber-1].current){
    //   cropAreaRefArr.current[AreaNumber-1].current.set_focusArea();
    // }

    //lastcoordinate의 name fix 모드로..

    //onDelete
    //onDelete(coordinate)

  };

  const handleMouserLeave = () => {

    pointARef.current = null;
    if(!coordinates.length)return;
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
    // const coordinate = coordinates[]
    // console.log("coordinates",coordinates)
    const lastcoordinate=coordinates[coordinates.length-1];
    //#@!
    if(onDelete&& (lastcoordinate.widthr<0.05 || lastcoordinate.heightr<0.05)){
        onDelete(lastcoordinate)
    
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
    // const debouncedResetContainerInform = _.debounce((arg) => {
    //   resetContainerInform(arg)
    // }, 10);

    const resizeObserver = new ResizeObserver(entries => {
      // 크기 변경시 실행할 작업을 여기에 작성합니다.
      entries.forEach(() => {
        // console.log('@@@@@@@@@@@@@@@@PDFDocument 껍데기의 크기가 변경되었습니다!', entry.contentRect.width, entry.contentRect.height);
        // set_renderWidth(entry.contentRect.width * viewPercent / 100);
        // const contentWidth = wrapEl.offsetWidth;
        // const contentHeight = wrapEl.offsetHeight;
        // debouncedResetContainerInform();
        resetContainerInform();
      });
    });
    resizeObserver.observe(wrapEl);
    return () => {
      resizeObserver.disconnect();
    }

  }, []);


  return (<div className="Cropcontainer no-drag"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouserLeave}
    onMouseUp={handleMouseUp}
    ref={containerRef}
  >

    {containerInform && coordinates && coordinates.map((coordinate, index) => {
      // console.log("coordinate",coordinate)
      return (
        <CropArea
          {...props}
          ref={cropAreaRefArr.current[index]}
          key={coordinate.id || index}
          areaIndex={index}
          pageIndex={pageIndex}
          containerInform={containerInform}
          coordinate={coordinate}
    
        />
      )
    })}


  </div>)
});



export default MultipleCropDiv;