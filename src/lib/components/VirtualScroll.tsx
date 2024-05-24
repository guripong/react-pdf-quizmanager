import React from "react";
import { useWindowScroll, useWindowSize } from "react-use";

type Props = {
  children: JSX.Element[];
  itemHeight: number;
  rowGap?: number;
  columnGap?: number;
  renderAhead?: number;
};

const VirtualScroll = ({
  children,
  itemHeight,
  columnGap = 0,
  renderAhead = 0
}: Props) => {
  const { height } = useWindowSize();
  const { y } = useWindowScroll();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [viewportY, setViewportY] = React.useState<number>(0);
  const relativeY = y - viewportY;
  React.useEffect(() => {
    const viewportY = scrollRef.current?.getBoundingClientRect().y ?? 0;
    setViewportY(viewportY);
  }, []);
  // console.log(y, relativeY);

  const containerHeight = (itemHeight + columnGap) * children.length;

  const startIndex = Math.max(
    Math.floor(relativeY / (itemHeight + columnGap)) - renderAhead,
    0
  );

  const endIndex = Math.min(
    Math.ceil(height / (itemHeight + columnGap) + startIndex) + renderAhead,
    children.length
  );

  const visibleItem = children.slice(
    Math.max(startIndex, 0),
    Math.min(endIndex + 1, children.length)
  );

  const translateY = Math.max((itemHeight + columnGap) * startIndex, columnGap);

  return (
    <div
      className="will-change-transform"
      style={{
        height: `${containerHeight}px`
      }}
      ref={scrollRef}
    >
      <div style={{ transform: `translateY(${translateY}px)` }}>
        {visibleItem}
      </div>
    </div>
  );
};

export default VirtualScroll;
