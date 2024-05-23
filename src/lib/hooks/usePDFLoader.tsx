import { useState, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
interface PDFPage {
  getViewport: (params: { scale: number }) => any;
  render: (params: any) => any;
}

interface UsePDFLoaderReturn {
  pages: PDFPage[];
}


function usePDFLoader(path: string, PDFDocumentOnLoadCallback?: (numPages: number) => void): UsePDFLoaderReturn {
  const [pages, setPages] = useState<PDFPage[]>([]);


    useEffect(() => {
      if (!path) return;
  
      async function getPDFdocumentByPath() {
        try {
          const loadingTask = await pdfjsLib.getDocument(path);
          const pdf = await loadingTask.promise;
  
          const pdfInfo = pdf._pdfInfo;
          const pdfPageNumbers = pdfInfo.numPages;
          const loadedPages = [];
  
          for (let i = 1; i <= pdfPageNumbers; i++) {
            const page = await pdf.getPage(i);
            loadedPages.push(page);
          }
          
          setPages(loadedPages);
          // if(PDFDocumentOnLoadCallback){
          //   PDFDocumentOnLoadCallback(pdfPageNumbers);
          // }

        } catch (error) {
          // 오류 처리
          console.error("PDF 로드 중 오류 발생:", error);
        }
      }
  
      getPDFdocumentByPath();
    }, [path]);
    
    console.log("usePDFLoader~~~")
    return { pages };
  }

  export default usePDFLoader;