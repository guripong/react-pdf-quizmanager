import React, { useCallback } from "react";

import NumberOnlyInput from "./components/NumberOnlyInput";
import PercentageInput from "./components/PercentageInput";
import TextInput from "./components/TextInput";
import HamburgerSvg from "./svg/Hamburger_icon.svg";
// import MinusSvg from "./svg/Minus_symbol.svg";
import MinusSvg from "./svg/minus-sign-of-a-line-in-horizontal-position-svgrepo-com.svg";

import PlusSvg from "./svg/plus-large-svgrepo-com.svg";
import { PDFTopBarProps } from "./PDF_Quiz_Types";


const PDFTopBar: React.FC<PDFTopBarProps> = (props) => {
    const { dynamicAllPageRef, set_leftPreviewShow, handleChangeNowPage, viewPercent,
         set_viewPercent, maxPageNumber, nowPage
        , set_AOI_mode, AOI_mode, fileName, set_fileName } = props;

    const handleDecreasePercent = useCallback(() => {
        set_viewPercent(v => parseInt(v) - 1 > 25 ? (parseInt(v) - 1) + '%' : v);
        if (dynamicAllPageRef && dynamicAllPageRef.current) {
            dynamicAllPageRef.current.moveTothePrevScroll();
        }
    },[dynamicAllPageRef,set_viewPercent]);

    const handleSetPercent = useCallback((v:string) => {
        // console.log("handleSetPercent호출");

        set_viewPercent(v);
        if (dynamicAllPageRef && dynamicAllPageRef.current) {
            // console.log("호출~~")
            dynamicAllPageRef.current.moveTothePrevScroll();
        }
    },[dynamicAllPageRef,set_viewPercent]);

    const handleIncreasePercent = useCallback(() => {
        set_viewPercent(v => parseInt(v) + 1 <= 100 ? (parseInt(v) + 1) + '%' : v);
        if (dynamicAllPageRef && dynamicAllPageRef.current) {
            dynamicAllPageRef.current.moveTothePrevScroll();
        }
    },[dynamicAllPageRef,set_viewPercent]);

    const handleToggleAOI = (num:number)=>{    
            if(AOI_mode===num){
                set_AOI_mode(0);
            }
            else{
                
                set_AOI_mode(num);
            }

    }

    return (<div className="PDFTopBar no-drag">
        <div className="oneTab flexstart">
            <div className="btnWrap" onClick={() => {
                if (set_leftPreviewShow) {
                    set_leftPreviewShow(v => !v);
                }
            }}>
                <img src={HamburgerSvg} alt="" />
            </div>
            <div style={{ marginLeft: 15 }}>
                <TextInput
                    value={fileName}
                    onChange={(newFileName:string) => {
                        set_fileName(newFileName)
                    }}
                    onBlur={(newFileName)=>{
                        set_fileName(newFileName)
                    }}
                />
            </div>
        </div>

        <div className="oneTab">
                <button className={`AOI_mode_btn Quiz ${AOI_mode===1?'selected':''}`}onClick={()=>handleToggleAOI(1)}>Quiz</button>
                <button className={`AOI_mode_btn Pic ${AOI_mode===2?'selected':''}`}  onClick={()=>handleToggleAOI(2)}>Pic</button>
                <button className={`AOI_mode_btn Text ${AOI_mode===3?'selected':''}`} onClick={()=>handleToggleAOI(3)}>Text</button>
        </div>


        <div className="oneTab">
            <NumberOnlyInput
                style={{ width: '25px' }}
                value={nowPage}
                onChange={(val:number) => {
                    if (handleChangeNowPage) {
                        handleChangeNowPage(val);
                        if (dynamicAllPageRef && dynamicAllPageRef.current) {
                            // console.log(dynamicAllPageRef.current);
                            dynamicAllPageRef.current.set_scrollMoveToPage(val);
                        }
                    }

                }}
                min={1}
                max={maxPageNumber}
            // onBlur={() => {

            // }}
            />
            <div style={{ marginBottom: 2 }}>
                &nbsp;&nbsp;/&nbsp;{maxPageNumber}&nbsp;&nbsp;
            </div>
            <div className="grayBar" />
            <div className="btnWrap" onClick={handleDecreasePercent}>
                <img alt="" src={MinusSvg} />
            </div>

            <PercentageInput
                className="viewPercentInput"
                value={viewPercent}
                onChange={handleSetPercent}
            />
            <div className="btnWrap" onClick={handleIncreasePercent}>
                <img alt="" src={PlusSvg} />
            </div>
            <div className="grayBar" />
        </div>


  

        <div className="oneTab">
            aaa
        </div>
    </div>)
}
export default PDFTopBar;