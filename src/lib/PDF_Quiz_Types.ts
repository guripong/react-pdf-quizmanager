import { ResizeEvent } from "@interactjs/types";
import { PDFPageProxy } from "pdfjs-dist/types/display/api";
import { RefObject } from "react";

interface PDF_Enroll_QuizProps {
    className?: string;

    AOI: Coordinate[][];

    pageInform?: Array<{
        showPrevButton?: boolean;
        showNextButton?: boolean;
        showFinishButton?: boolean;
        minShouldViewSec?: number;
    }>;

    PDFDocumentOnLoadCallback?: (pages: number) => void;
    path: string;
    option: {
        initViewPercent?: string;
    };
    previewOption?: {
        initLeftPreviewshow?: boolean;
        pageMargin: number;
        wrapperStyle?: {
            position: string;
            left: number;
            width: number;
        };
    };
    pdfInform?: {
        fileName: string;
    };
}
// Define the prepared page type
interface PreparedPageType {
    valid: boolean;
    canvas: HTMLCanvasElement;
    canvasSize: {
        width: number;
        height: number;
    };
}
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
    x?: number;
    y?: number;
    widthr: number;
    heightr: number;
    xr: number;
    yr: number;
    id: string;
    type: string;
    name: string;
    quizOptionCount?: number;
    correctAnswer?: number;
    shouldSolveQuestion?: boolean;
}

interface PreviewPage {
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
    preparedPreviewPages: PreviewPage[];
    handlePreviewChange: (pageNumber: number) => void;
    previewOption: any; // Define proper type for previewOption
    leftPreviewShow: boolean;
    nowPage: number;
    dynamicAllPageRef: React.RefObject<any>; // Define proper type for dynamicAllPageRef
    tempAOI: any[]; // Define proper type for tempAOI
    selAOI: any; // Define proper type for selAOI
    set_selAOI: React.Dispatch<React.SetStateAction<any>>; // Define proper type for set_selAOI
    hideAOIPageListArr: boolean[]; // Define proper type for hideAOIPageListArr
    set_hideAOIPageListArr: React.Dispatch<React.SetStateAction<boolean[]>>; // Define proper type for set_hideAOIPageListArr
    foldAOIList: boolean; // Define proper type for foldAOIList
    set_foldAOIList: React.Dispatch<React.SetStateAction<boolean>>; // Define proper type for set_foldAOIList
}

interface PDFTopBarProps {
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
    coordinate: Coordinate;
    onQuizDetailChanged?: (showQuizDetail: boolean) => void;
    handleQuizDetailCancel?: (showQuizDetail: boolean) => void;
}

interface MultipleCropDivProps {
    onFixCropName?: (coordinate: Coordinate, newName: string) => void;
    AOI_mode: number;
    set_selAOI: React.Dispatch<React.SetStateAction<any>>;
    coordinates: Coordinate[];
    pageIndex: number;
    onDelete?: (coordinate: Coordinate) => void;
    onChange?: (coordinate: Coordinate, index: number, coordinates: Coordinate[]) => void;
    onResize: any;
    onMove: any;
}


interface CropAreaProps {
    onFixCropName?: (coordinate: Coordinate, newName: string) => void;
    set_selAOI: React.Dispatch<React.SetStateAction<any>>;
    // set_selAOI?: (selectedAOI: { pageNumber: number; AOINumber: number } | null) => void;
    onMove?: (pageIndex: number, areaIndex: number, e: Interact.InteractEvent, containerInform: { width: number; height: number }) => void;
    onResize?: (pageIndex: number, areaIndex: number, e: ResizeEvent, containerInform: { width: number; height: number }) => void;
    onDelete?: (coordinate: Coordinate) => void;
    pageIndex: number;
    areaIndex: number;
    coordinate: Coordinate;
    containerInform?: { width: number; height: number };
}
interface CropAreaInstance {
    set_focusArea(): void;
    set_textEditMode(val: boolean): void;
    // 다른 CropArea 컴포넌트의 메서드나 속성을 여기에 추가할 수 있습니다.
}
interface MultipleCropDivInstance {
    set_focusArea(AreaNumber: number): void;
}
type preparePage = (page: any,
    pageNumber: number,
    width: number, height: number)
    => Promise<{
        valid: boolean; canvas: HTMLCanvasElement,
        canvasSize: {
            width: number,
            height: number
        }

    }>;

interface PDFdynamicAllPageProps {
    set_selAOI: (aoi: Coordinate) => void;
    set_tempAOI: React.Dispatch<React.SetStateAction<Coordinate[][]>>;
    tempAOI: Coordinate[][];
    AOI_mode: number;
    set_nowPage: React.Dispatch<React.SetStateAction<number>>;
    preparePage: preparePage;
    pages: PDFPageProxy[] | null;
    percentPagesData: PercentPageDataType[];
    leftPreviewShow: boolean;
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

export type {
    preparePage, PDFdynamicAllPageInstance,
    PercentPagesData, PDFdynamicAllPageProps,
    MultipleCropDivInstance, CropAreaInstance,
    CropAreaProps, MultipleCropDivProps,
    QuizDetailProps, PDFTopBarProps, Coordinate,
    PercentPageDataType, PreparedPageType,
    PDF_Enroll_QuizProps, PreviewPage,
    PDFPreviewProps
};