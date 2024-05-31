import { useState, useEffect, useMemo, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy, RenderParameters } from "pdfjs-dist/types/display/api";
import { preparePage } from "lib/PDF_Quiz_Types";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;


interface UsePDFLoaderReturn {
  pages: PDFPageProxy[] | null;
  maxPageNumber: number;
  preparePage: preparePage;
}


function usePDFLoader(path: string, PDFDocumentOnLoadCallback?: (numPages: number) => void): UsePDFLoaderReturn {
  const [pages, setPages] = useState<PDFPageProxy[] | null>(null);


  useEffect(() => {
    if (!path) return;

    async function getPDFdocumentByPath() {
      try {
        const loadingTask = await pdfjsLib.getDocument(path);
        const pdf = await loadingTask.promise;

        const pdfInfo = pdf._pdfInfo;
        const pdfPageNumbers = pdfInfo.numPages;
        const loadedPages: PDFPageProxy[] = [];


        for (let i = 1; i <= pdfPageNumbers; i++) {
          const page: PDFPageProxy = await pdf.getPage(i);
          loadedPages.push(page);
        }

        setPages(loadedPages);
        if (PDFDocumentOnLoadCallback) {
          PDFDocumentOnLoadCallback(pdfPageNumbers);
        }

      } catch (error) {
        // 오류 처리
        console.error("PDF 로드 중 오류 발생:", error);
      }
    }

    getPDFdocumentByPath();
  }, [path, PDFDocumentOnLoadCallback]);

  const maxPageNumber = useMemo(() => {
    if (pages) {
      return pages.length;
    }
    else {
      return 0;
    }
  }, [pages])

  const preparePage = useCallback<preparePage>((page, pageNumber, specificSize) => {
    return new Promise(function (resolve, reject) {
      const shouldPreparePage: PDFPageProxy = page;
      if (!shouldPreparePage) {
        reject({
          valid: false,
          msg: "해당 페이지가 존재하지 않음"
        })
        return;
      }

      //오리지날 PDF사이즈들
      const pageOriginWidth = shouldPreparePage.view[2];
      const pageOriginHeight = shouldPreparePage.view[3];



      let myscale = 1;
      if (specificSize) {
        myscale = specificSize / pageOriginWidth;
      }



      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const viewport = shouldPreparePage.getViewport({ scale: myscale }); // 원하는 스케일로 조정
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const renderContext: RenderParameters = {
        canvasContext: context || {},
        viewport: viewport,
      };
      // console.log("랜더컨택스 완료")
      const resizeRatio = specificSize / viewport.width;


      shouldPreparePage.render(renderContext).promise.then(() => {
        resolve({
          valid: true,
          canvas: canvas,
          pageNumber: pageNumber,
          originScale: myscale,
          PDForiginSize: {
            width: pageOriginWidth,
            height: pageOriginHeight
          },
          canvasSize: {
            width: viewport.width,
            height: viewport.height
          },
          wrapperSize: {
            resizeRatio: resizeRatio,
            width: specificSize,
            height: viewport.height * resizeRatio
          },
        })
      });



    });
  }, [])

  // console.log("usePDFLoader~~~")
  return { pages, maxPageNumber, preparePage };
}

export default usePDFLoader;