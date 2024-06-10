import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './GPScroll.scss';

interface GPScrollProps {
    children: React.ReactNode;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
    className?: string;
}

const GPScroll = forwardRef<HTMLDivElement, GPScrollProps>(({ children, onScroll, style, className }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
 
    // const beforeThumbTopRatio = useRef<number>(0);

    useImperativeHandle(ref, () => wrapperRef.current!);



    
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const thumb = thumbRef.current;
        if (!wrapper || !thumb) return;

        const updateThumPositionAndSize = () => {
            const { scrollHeight, clientHeight, scrollTop } = wrapper;
            const thumbHeight = Math.max((clientHeight* clientHeight / scrollHeight), 20);
            const viewport = scrollHeight - clientHeight;
            const scrollRatio = scrollTop / viewport;

            const thumbTop = scrollRatio * (scrollHeight - thumbHeight);
            // beforeThumbTopRatio.current= thumbTop/(scrollHeight-thumbHeight);

            thumb.style.height = thumbHeight + 'px';
            thumb.style.top = thumbTop + 'px';

        };

        wrapper.addEventListener('scroll', updateThumPositionAndSize);
        return () => {
            wrapper.removeEventListener('scroll', updateThumPositionAndSize);
        }
    }, []);


    ///이상없음
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const thumb = thumbRef.current;
        if (!wrapper || !thumb) return;

        let isMouseDown = false;
        const handleMouseDown = (event: MouseEvent) => {
            isMouseDown = true;
            // setIsMouseDown(true);
        };

        const handleMouseUp = (event: MouseEvent) => {
            isMouseDown = false;
            // setIsMouseDown(false);
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isMouseDown) return;

            if (!wrapper) return;

            const { scrollHeight, clientHeight } = wrapper;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
            const clickY = event.pageY - wrapper.getBoundingClientRect().top;
            const thumbTop = clickY - thumbHeight / 2;

            wrapper.scrollTop = thumbTop / (clientHeight - thumbHeight) * (scrollHeight - clientHeight);
        };

        thumb.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {

            thumb.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [])

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;
        console.log("children 변경")
        const resizeObserver = new ResizeObserver(() => {
            // Resize 이벤트 시 스크롤 위치 재조정

            const wrapper = wrapperRef.current;
            const thumb = thumbRef.current;
           
            if (!wrapper || !thumb ) return;
   
            const { scrollHeight, clientHeight,scrollTop } = wrapper;
      
            // console.log("scrollHeight",scrollHeight)
            const viewport2 = content.clientHeight - clientHeight;

            const thumbHeight =clientHeight * clientHeight / content.clientHeight;
            // console.log("thumbHeight",thumbHeight)
            const adjustedScrollTop = Math.min(scrollTop, viewport2);
            const scrollRatio = adjustedScrollTop / viewport2;
       
            //beforeThumbTopRatio.current= thumbTop/(scrollHeight-thumbHeight);
            // 이 부분을 변경하여 두 가지 방법을 모두 시도해 봅니다.

            const beforeThumTop = scrollRatio * (scrollHeight - thumbHeight);
            if(beforeThumTop>(content.clientHeight-thumbHeight)){
                // content.clientHeight
                // console.log("강제조정 1111")
                if(content.clientHeight<clientHeight){
                    // console.log("너무작은경우컨텐츠가 스크롤바가 없어야함")
                    wrapper.scrollTop=0;
                    thumb.style.height = clientHeight + 'px';
                    thumb.style.top = 0 + 'px';
                    thumb.style.display="none";
                }
                else{
                    const thumbTop = content.clientHeight-thumbHeight;
                    thumb.style.height = thumbHeight + 'px';
                    thumb.style.top = thumbTop + 'px';
                    wrapper.scrollTop = thumbTop;
                    thumb.style.display="";
                }

            }
            else{
                // console.log("222222222")
                const thumbTop = scrollRatio * (scrollHeight - thumbHeight);
                thumb.style.height = thumbHeight + 'px';
                thumb.style.top = thumbTop + 'px';
                thumb.style.display="";
                // wrapper.scrollTop = scrollTop;
            }
        
        });

        resizeObserver.observe(content);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);




    return (
        <div
            className={`gp-scroll-wrapper${className?` ${className}`:""}`}
            ref={wrapperRef}
            onScroll={onScroll}
            style={style}
        >
            <div className="gp-scroll-content" ref={contentRef}>
                {children}
   
            </div>
      
            <div
                className="gp-scroll-thumb"
                ref={thumbRef}
            />
        </div>
    );
});

export default GPScroll;
