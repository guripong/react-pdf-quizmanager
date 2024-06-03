
import React from "react";
import type { PDFPlayQuizProps } from "../PDF_Quiz_Types";

import "./PDFplayQuiz.scss";
import { ModalProvider } from "lib/hooks/useModal";
import CenterView from "./CenterView";


const PDFPlayQuiz: React.FC<PDFPlayQuizProps> = (props) => {

    return (<div className="PDFPlayQuiz" >
        <ModalProvider>
      
            <CenterView
                {...props}
            />

        </ModalProvider>
    </div>)

}
export default PDFPlayQuiz;