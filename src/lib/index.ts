import PDFEnrollQuiz from "./PDFEnrollQuiz";
import PDFPlayQuiz from "./pdfplayquiz/PDFPlayQuiz";
// import { GPTableInstance, GPtableProps ,GPColumn,GPtableOption} from "./GPTableTypes"; // GPprops를 정의한 파일로의 경로를 사용해야 합니다.
// import DebouncedInput from "./components/DebouncedInput/DebouncedInput";
// import IndeterminateCheckbox from "./components/IndeterminateCheckbox/IndeterminateCheckbox";


// Main library exports - these are packaged in your distributable
const isOdd = (n: number): boolean => {
  return !!(n & 1);
};

export { PDFEnrollQuiz, isOdd ,PDFPlayQuiz };
// export type { GPTableInstance, GPtableProps ,GPColumn,GPtableOption};