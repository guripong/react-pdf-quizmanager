
import React, { useMemo, useReducer, useRef, useState } from 'react';
import { useCallback
  // , useEffect, useMemo, useRef, useState 
} from 'react';
import {PDF_Enroll_Quiz} from './lib';

// import { GPtable, IndeterminateCheckbox } from './lib';
// import type { GPTableInstance, GPColumn, GPtableProps ,GPtableOption } from './lib';
import "./App.scss"
import type { Coordinate } from './lib/PDF_Quiz_Types';
// import { GPtable } from 'react-gptable';
// import type { GPColumn, GPTableInstance } from 'react-gptable';
// import "react-gptable/dist/style.css";

// ESM
// import { faker } from '@faker-js/faker';
// import { sample } from 'lodash';



// import { GPtable } from "./dist/index.es.js"; // 빌드된 파일의 경로로 변경해야 합니다.
// import type { GPprops } from "./dist";


//  import  { GPTableInstance, GPtable,IndeterminateCheckbox,
//   GPColumn}  from 'react-gptable'


function App() {
  const rerender = useReducer(() => ({}), {})[1];


  const tempAOI = useMemo<Coordinate[][]>(()=>{

    return [
      [{
        x: 10, 
        y: 10, 
        width: 10, 
        height: 10, 
        id: '1234',
        type: "quiz",
        name: "임시quiz1",
        quizOptionCount:4, //(1~10 선택가능)
        correctAnswer:1, //1번이 정답
        shouldSolveQuestion:false //문제를 풀어야만 이전과 다음페이지로 이동가능..
      }, {
        x: 40, 
        y: 40, 
        width: 10, 
        height: 10, 
        id: '5678',
        type: "quiz",
        name: "임시quiz2",
        quizOptionCount:4, //(1~10 선택가능)
        correctAnswer:1, //1번이 정답
        shouldSolveQuestion:false //문제를 풀어야만 이전과 다음페이지로 이동가능..
      }], //1번페이지
      [

      ],//2페이지
    ]
  },[])

  const [file, set_file] = useState<File | null>(null);
  const [previewURL, set_previewURL] = useState<string>("");
  // const [nowPage, set_nowPage] = useState<number>(1);
  // const [maxPageNumber, set_maxPageNumber] = useState<number>();

  const handleDocumentLoadCallback = useCallback((pages:number) => {
    console.log("콜백옴 page수", pages);
    // set_maxPageNumber(pages);
  }, []);



  const handleOpenPreview = () => {
    if (!file) return;
    const logoURL = window.URL.createObjectURL(file);
    set_previewURL(prev=>{
      if (prev) {
        console.log("메모리해제");
        window.URL.revokeObjectURL(prev);
        console.log("메모리끝");
      }
      return logoURL
    });
  }


  const previewOption = useMemo(() => {
    return {
      initLeftPreviewshow: true,
      // specifySize:400,
      pageMargin: 40,
      wrapperStyle: {
        position: "absolute",
        left: 0,
        width: 150,
      }
    }
  }, [])


  
  const option = useMemo(() => {
    //pdf 고유의 사이즈를 무시, 현제의 width기준으로 랜더
    return {
      mode: 2, //지금페이지만 랜더 3, 전체preload 2 , 지금페이지 앞뒤 preload 1
      drawing: true,
      canvasResolution: 1,
      initViewPercent: '100%',
      // canvasWidth:200, //값을 안넣어주면 계속 리랜더함 
      //만약 전체 페이지 mode가 2번인상태로 값을 안넣어주면 전체페이지를 매번 리랜더.. viewpercent 바뀔때마다
    };
  }, [])



  const handleAddFile = (e) => {
    // console.log(e.target.files[0]);
    //if (!e.target.files[0]) return;
    if (e.target.files[0].type !== 'application/pdf') {
      // Swal.fire("지원하지 않는 확장자 입니다");
      return;
    }

 

    const tmpfile = e.target.files[0];
    set_file(tmpfile);
  }
  const fileRef = useRef<HTMLInputElement>(null);

  return (<div className="app" style={{ background: "#eee" }} >
    <div>
    {file && <> {`임시파일이름 : ${file.name}`} <button className="deletefilebtn" onClick={() => set_file(null)}>삭제</button></>}
        <input ref={fileRef} style={{ display: 'none' }}

          // accept=".pdf"
          accept="application/pdf"

          type="file" onChange={handleAddFile} />
        <br />
        <button
          className="btn"
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.value = "";
              fileRef.current.click();
            }


          }}>내컴퓨터에서 찾기</button>
        <button onClick={handleOpenPreview}>
           파일로드
        </button>

      <button onClick={()=>{
        rerender();
      }}>리랜더</button>
    </div>
    <br />

    <div style={{ marginLeft:"5%",width: '90%',height:'700px', display: "flex", background: "#fff" }}>
      <PDF_Enroll_Quiz

        AOI={tempAOI}
        pageInform={[
          {
            showPrevButton:false,
            showNextButton:false,
            showFinishButton:false,
            minShouldViewSec:1,
          }
        ]}
        path={previewURL}
        option={option}
        previewOption={previewOption}
        pdfInform={{
          fileName: "이것은PDF파일이름"
        }}


        PDFDocumentOnLoadCallback={handleDocumentLoadCallback}

      />
      
    </div>
  </div>)
}

export default App;
