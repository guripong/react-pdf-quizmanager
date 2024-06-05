
import React, { useMemo, useRef, useState } from 'react';
import { useCallback } from 'react';

import "./App.scss"
import type { Coordinate, PDFPlayQuizProps } from './lib/PDF_Quiz_Types';
import { PDFEnrollQuiz, PDFPlayQuiz } from './lib';
// import { PDFEnrollQuiz, PDFPlayQuiz } from 'react-pdf-quizmanager';
// import type { Coordinate, PDFPlayQuizProps } from 'react-pdf-quizmanager';



function App() {


  const [tempAOI, setTempAOI] = useState<Coordinate[][]>([
    [{
      x: 6,
      y: 32,
      width: 33,
      height: 10,
      id: '1234',
      type: "MC", // 객관식 Multiple Choice
      name: "객관식(1-1)",
      quizOptionCount: 3, //(1~10 선택가능)
      correctAnswer: 1, //1번이 정답    0번은 정답없음

    }, {
      x: 6,
      y: 43,
      width: 42,
      height: 14,
      id: '5678',
      type: "SJ", //주관식 Subject
      name: "주관식(1-2)",
      correctAnswer: "",
    }], //1번페이지  없는페이지는 자동생성
  ])




  const [file, set_file] = useState<File | null>(null);

  const [pdfURL, set_pdfURL] = useState<string>("");


  const handleDocumentLoadCallback = useCallback((pages: number) => {
    console.log("콜백옴 page수", pages);
    // set_maxPageNumber(pages);
  }, []);




  const option = useMemo(() => {
    //pdf 고유의 사이즈를 무시, 현제의 width기준으로 랜더
    return {
      pageViewOption: {
        initViewPercent: '50%',
      },
      previewOption: {
        initLeftPreviewshow: true,
        pageMargin: 40, //preview 의 작은 PDF의 pagemargin
        wrapperStyle: { //PDF preview의 껍데기 width입니다
          width: 200,
          // outline:"5px solid red"
        }
      }

    };
  }, [])



  const [pdfName, set_pdfName] = useState<string>("이것은PDF파일이름");

  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleOpenPreview = () => {
    if (!file) return;
    const logoURL = window.URL.createObjectURL(file);
    set_pdfURL(prev => {
      if (prev) {
        console.log("메모리해제");
        window.URL.revokeObjectURL(prev);
        console.log("메모리끝");
      }
      return logoURL
    });
  }

  const [playOption, set_playOption] = useState<PDFPlayQuizProps | null>(null);

  // console.log("tempAOI",tempAOI)
  return (<div className="app" style={{ background: "#eee" }} >
    <div>
      {pdfURL}
      <br />
      {file && <> {`임시파일이름 : ${file.name}`} <button className="deletefilebtn" onClick={() => set_file(null)}>삭제</button></>}
      <input ref={fileRef} style={{ display: 'none' }}
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
        (제작)파일열기
      </button>
      <button onClick={() => { set_pdfURL("https://readerseye-quiz.s3.ap-northeast-2.amazonaws.com/published/3_1716436060677.pdf") }}>
        (제작)임시url열기
      </button>
    </div>
    <br />
    <div>
      (테스트)파일열기
      <br />
      <button onClick={() => set_playOption({
        path: "https://readerseye-quiz.s3.ap-northeast-2.amazonaws.com/published/3_1716436060677.pdf",
        AOI: tempAOI
      })}>play urlAOI적용</button>
    </div>






    {pdfURL &&
      <div style={{ marginLeft: "5%", width: '90%', height: '700px', display: "flex", background: "#fff" }}>
        {/* // <div style={{  width: '100%', height: '100%',left:0,top:0,position:"fixed", display: "flex", background: "#fff" }}> */}
        <PDFEnrollQuiz
          path={pdfURL}
          AOI={tempAOI}
          option={option}
          pdfInform={{
            fileName: pdfName
          }}

          PDFDocumentOnLoadCallback={handleDocumentLoadCallback}


          onCloseCallback={() => {
            set_pdfURL(prev => {
              if (prev) {
                console.log("메모리해제");
                window.URL.revokeObjectURL(prev);
                console.log("메모리해제끝");
              }
              return ""
            });
          }}

          onSaveCallback={(newAOI: Coordinate[][], newFileName: string) => {
            setTempAOI(newAOI);
            set_pdfName(newFileName);
          }}

        />

      </div>
    }


    {playOption &&
      <div style={{ width: '100%', height: '100%', left: 0, top: 0, position: "fixed", display: "flex", background: "#fff" }}>
        <PDFPlayQuiz

          path={playOption.path}
          AOI={playOption.AOI}

          PDFDocumentOnLoadCallback={() => {

          }}
          onCloseCallback={() => {
            set_playOption((prev: PDFPlayQuizProps | null) => {
              if (prev) {
                console.log("메모리해제");
                window.URL.revokeObjectURL(prev.path);
                console.log("메모리해제끝");
              }
              return null
            });
          }}

          onSaveCallback={(newAOI: Coordinate[][]) => {
            // setTempAOI(newAOI);
            console.log("저장할newAOI", newAOI)
          }}

        />

      </div>

    }

  </div>)
}

export default App;
