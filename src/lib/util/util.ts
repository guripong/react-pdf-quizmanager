import { PercentPagesData } from "lib/PDF_Quiz_Types";

export const arraysAreEqual = (arr1: PercentPagesData[], arr2: PercentPagesData[]): boolean => {
    if (!arr1 || !arr2) {
        return false;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].pageNumber !== arr2[i].pageNumber) {
            return false;
        }
        if (arr1[i].pageSize.width !== arr2[i].pageSize.width) {
            return false;
        }
    }

    return true;
};

export const findMaxIndex = (arr: number[]): number => {
    let max = -Infinity;
    let maxIndex = -1;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            maxIndex = i;
        }
    }

    return maxIndex;
};