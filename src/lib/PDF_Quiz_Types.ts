import { PDFPageProxy } from "pdfjs-dist/types/display/api";
import { RefObject } from "react";
interface previewOption{
    initLeftPreviewshow?: boolean;
    pageMargin?: number;
    wrapperStyle?: {
        position?: string;
        left?: number;
        width?: number;
    };
};

interface AOIProps{
    pageNumber:number;
    AOINumber:number;
}


interface PDF_Enroll_QuizProps {
    className?: string;

    path: string;

    AOI: Coordinate[][];

    option?: {
        pageViewOption?:{
            initViewPercent?: string;
        },
        previewOption?:previewOption;
    };

    // previewOption?: previewOption;

    pdfInform?: {
        fileName: string;
    };

    PDFDocumentOnLoadCallback?: (pages: number) => void;
    
    onCloseCallback?: ()=>void;
    onSaveCallback?: (newAOI:Coordinate[][],newFileName:string)=>void;
    //onCloseCallback
    //onPreviewCallback


}
// Define the prepared page type

// Define the percent page data type
interface PercentPageDataType {
    pageNumber: number;
    bluredCanvas: HTMLCanvasElement;
    bluredCanvasSize: {
        width: number;
        height: number;
    };
    width: number;
    height: number;
    marginHeight: number;
    viewMinScrollHeight: number;
    viewMaxScrollHeight: number;
}

interface Coordinate {
    width: number;
    height: number;
    x: number;
    y: number;
    id: string;
    type: string;
    name: string;
    quizOptionCount?: number;
    correctAnswer?: number;
}

interface PreRenderedPDFPage {
    valid:boolean;
    canvas: HTMLCanvasElement;
    pageNumber: number;
    originScale: number;
    PDForiginSize: {
        width: number;
        height: number;
    };
    canvasSize: {
        width: number;
        height: number;
    };
    wrapperSize: {
        resizeRatio: number;
        width: number;
        height: number;
    };
}


interface PDFPreviewProps {
    preparedPreviewPages: PreRenderedPDFPage[];
    handlePreviewChange: (pageNumber: number) => void;
    previewOption: previewOption; // Define proper type for previewOption
    leftPreviewShow: boolean;
    nowPage: number;
    dynamicAllPageRef: React.RefObject<any>; // Define proper type for dynamicAllPageRef
    tempAOI: any[]; // Define proper type for tempAOI
    selAOI: AOIProps|null; // Define proper type for selAOI
    set_selAOI: React.Dispatch<React.SetStateAction<AOIProps|null>>; // Define proper type for set_selAOI
    hideAOIPageListArr: boolean[]; // Define proper type for hideAOIPageListArr
    set_hideAOIPageListArr: React.Dispatch<React.SetStateAction<boolean[]>>; // Define proper type for set_hideAOIPageListArr
    foldAOIList: boolean; // Define proper type for foldAOIList
    set_foldAOIList: React.Dispatch<React.SetStateAction<boolean>>; // Define proper type for set_foldAOIList
}

interface PDFTopBarProps {
    handleOnSave?: ()=>void;
    onCloseCallback?:()=>void;

    dynamicAllPageRef: RefObject<any>;
    set_leftPreviewShow: React.Dispatch<React.SetStateAction<boolean>>;
    handleChangeNowPage: (page: number) => void;
    viewPercent: string;
    set_viewPercent: React.Dispatch<React.SetStateAction<string>>;
    maxPageNumber: number;
    nowPage: number;
    set_AOI_mode: React.Dispatch<React.SetStateAction<number>>;
    AOI_mode: number;
    fileName: string;
    set_fileName: React.Dispatch<React.SetStateAction<string>>;
}

interface QuizDetailProps {
    oneAOI: Coordinate;
    onQuizDetailChanged?: (showQuizDetail: boolean) => void;
    handleQuizDetailCancel?: (showQuizDetail: boolean) => void;
}

interface MultipleCropDivProps {
    AOI_mode: number;
    pageIndex: number;
    pageAOIArr: Coordinate[];

    onFixCropName?: (coordinate: Coordinate, newName: string) => void;

    set_selAOI: React.Dispatch<React.SetStateAction<AOIProps|null>>;


    onDeleteAOI?: (targetDeleteAOI: Coordinate) => void;
    onChangeAOI?: ( pageAOIArr: Coordinate[]) => void;
    onChangeOneAOI: (oneAOI: Coordinate,pageIndex:number,areaIndex:number)=>void
}


interface CropAreaProps {
    containerRef:React.RefObject<any>//#@!#@!
    onFixCropName?: (coordinate: Coordinate, newName: string) => void;
    set_selAOI: React.Dispatch<React.SetStateAction<AOIProps|null>>;
    // set_selAOI?: (selectedAOI: { pageNumber: number; AOINumber: number } | null) => void
    onDeleteAOI?: (targetDeleteAOI: Coordinate) => void;
    pageIndex: number;
    areaIndex: number;
    oneAOI: Coordinate;
    containerInform?: { width: number; height: number };
    onChangeOneAOI:(targetChangeAOI:Coordinate,pageIndex:number,areaIndex:number)=>void
}
interface CropAreaInstance {
    set_focusArea(): void;
    set_textEditMode(val: boolean): void;
    get_oneAOI(): Coordinate;
    // 다른 CropArea 컴포넌트의 메서드나 속성을 여기에 추가할 수 있습니다.
}
interface MultipleCropDivInstance {
    set_focusArea(AreaNumber: number): void;
}
type preparePage = (page: PDFPageProxy,
    pageNumber: number,
    specificSize: number)
    => Promise<PreRenderedPDFPage>;

interface PDFdynamicAllPageProps {
    set_selAOI: React.Dispatch<React.SetStateAction<AOIProps|null>>;
    set_tempAOI: React.Dispatch<React.SetStateAction<Coordinate[][]>>;
    tempAOI: Coordinate[][];
    AOI_mode: number;
    set_nowPage: React.Dispatch<React.SetStateAction<number>>;
    preparePage: preparePage;
    pages: PDFPageProxy[] | null;
    percentPagesData: PercentPageDataType[];
    leftPreviewShow: boolean;
    previewOption:previewOption;
    // coordinates: Coordinate[];
}

interface PercentPagesData {
    pageNumber: number;
    pageSize: { width: number; height: number };
    canvas?: HTMLCanvasElement;
}
interface PDFdynamicAllPageInstance {
    set_focusAOIArea: (pageNumber: number, AreaNumber: number) => void;
    set_scrollMoveToPage: (pageNumber: number) => void;
    moveTothePrevScroll: () => void;
}

export type { AOIProps,
    preparePage, PDFdynamicAllPageInstance,
    PercentPagesData, PDFdynamicAllPageProps,
    MultipleCropDivInstance, CropAreaInstance,
    CropAreaProps, MultipleCropDivProps,
    QuizDetailProps, PDFTopBarProps, Coordinate,
    PercentPageDataType, 
    PDF_Enroll_QuizProps, PreRenderedPDFPage,
    PDFPreviewProps
};