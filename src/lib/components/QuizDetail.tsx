
import React, { useState, useEffect, useRef } from "react";
import type { ChangeEventHandler, MouseEventHandler } from "react"
import quiz_detail from "../svg/quiz_detail2.svg";
import { Coordinate, QuizDetailProps } from "lib/PDF_Quiz_Types";

const QuizDetail: React.FC<QuizDetailProps> = (props) => {
    // console.log("oneAOI",oneAOI)
    const { oneAOI,  areaIndex, pageIndex, onChangeOneAOI } = props;

    const [showQuizDetail, set_showQuizDetail] = useState<boolean>(false);

    const [correctAnswer, set_correctAnswer] = useState<number | undefined>(oneAOI.correctAnswer);

    const quizDetailRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (quizDetailRef.current && !quizDetailRef.current.contains(e.target as Node)) {
                set_showQuizDetail(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
 




    const handleOnchangeQuizCount: ChangeEventHandler<HTMLSelectElement> | undefined = (e) => {

        const newAOI:Coordinate={
            ...oneAOI,
            quizOptionCount:Number(e.target.value)
        }
        onChangeOneAOI(newAOI,pageIndex,areaIndex);
    }

    const handleOnchangeCorrectAnswer: ChangeEventHandler<HTMLSelectElement> | undefined = (e) => {
        const newAOI:Coordinate={
            ...oneAOI,
            correctAnswer:Number(e.target.value)
        }
        onChangeOneAOI(newAOI,pageIndex,areaIndex);
    }


    return (<div className="QuizDetail"
        ref={quizDetailRef}
    >
        <div className="quiz_icon" onClick={(e) => {
            e.stopPropagation(); // Stop event bubbling
            // console.log("클릭");

            set_showQuizDetail(qd => !qd)
        }}>
            <img src={quiz_detail} alt="Quiz" />
        </div>
        {showQuizDetail &&
            <>
                <div className="dropDown_qd">
                    <div className="qd_row">
                        보기수
                        <select
                            className="normalSelect"
                            value={oneAOI.quizOptionCount}
                            onChange={handleOnchangeQuizCount}
                        >
                            {[...Array(10).keys()].map((value) => (
                                <option key={value + 1} value={value + 1}>
                                    {value + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="qd_row">
                         정답
                        <select
                            className="normalSelect"
                            value={oneAOI.correctAnswer}
                            onChange={handleOnchangeCorrectAnswer}
                        >
                            <option value={0}>정답없음</option>
                            {[...Array(10).keys()].map((value) => (
                                <option key={value + 1} value={value + 1}>
                                    {value + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="qd_row">
                        <button onMouseDown={()=>set_showQuizDetail(false)}>확인</button>
                    </div>
                </div>
                <div className="dropDown_triangle" />
            </>

        }


    </div>)
}
export default QuizDetail;