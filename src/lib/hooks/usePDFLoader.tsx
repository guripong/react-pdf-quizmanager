import { useState, useEffect, useMemo } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from "pdfjs-dist/types/display/api";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;


interface UsePDFLoaderReturn {
  pages: PDFPageProxy[] | null;
  maxPageNumber:number;
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
            const page: PDFPageProxy= await pdf.getPage(i);
            loadedPages.push(page);
          }
          
          setPages(loadedPages);
          if(PDFDocumentOnLoadCallback){
            PDFDocumentOnLoadCallback(pdfPageNumbers);
          }

        } catch (error) {
          // 오류 처리
          console.error("PDF 로드 중 오류 발생:", error);
        }
      }
  
      getPDFdocumentByPath();
    }, [path,PDFDocumentOnLoadCallback]);
    const maxPageNumber = useMemo(() => {
      if (pages) {
          return pages.length;
      }
      else {
          return 0;
      }
  }, [pages])
    // console.log("usePDFLoader~~~")
    return { pages,maxPageNumber };
  }

  export default usePDFLoader;