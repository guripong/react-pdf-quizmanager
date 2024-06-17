import { useRef } from 'react';

const useElapsedTime = () => {
    const startTimeRef = useRef<number>(Date.now());

    const getElapsedTime = () => {
        const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
        return parseFloat(elapsedTime.toFixed(2));
    };

    return getElapsedTime;
};

export default useElapsedTime;
