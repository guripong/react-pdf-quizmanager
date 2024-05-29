
import React,{ useState, useEffect, useRef, MouseEventHandler } from "react";
import quiz_detail from "../svg/quiz_detail2.svg";
import { QuizDetailProps } from "lib/PDF_Quiz_Types";

const QuizDetail: React.FC<QuizDetailProps> = ({ oneAOI, onQuizDetailChanged, handleQuizDetailCancel }) => {
    // console.log("oneAOI",oneAOI)
    const [showQuizDetail, set_showQuizDetail] = useState<boolean>(false);
    const [quizOptionCount, set_quizOptionCount] = useState<number | undefined>(oneAOI.quizOptionCount);
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

    const handleAdjust: MouseEventHandler<HTMLButtonElement> = () => {
        if (onQuizDetailChanged) {
            onQuizDetailChanged(showQuizDetail);
        }
        set_showQuizDetail(false);
    };

    const handleCancel: MouseEventHandler<HTMLButtonElement> = () => {
        if (handleQuizDetailCancel) {
            handleQuizDetailCancel(showQuizDetail);
        }
        set_showQuizDetail(false);
    };


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
                            value={quizOptionCount}
                            onChange={(e) => set_quizOptionCount(Number(e.target.value))}
                        >
                            {[...Array(10).keys()].map((value) => (
                                <option key={value + 1} value={value + 1}>
                                    {value + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="qd_row">
                        correctAnswer:{correctAnswer}<br />
                    </div>

                    <div className="qd_row">
                        <button onMouseDown={handleAdjust}>적용</button>
                        <button onMouseDown={handleCancel}>취소</button>
                    </div>
                </div>
                <div className="dropDown_triangle" />
            </>

        }


    </div>)
}
export default QuizDetail;