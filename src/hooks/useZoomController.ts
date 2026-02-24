import { useEffect, useRef, useState } from "react";

const useZoomController = (targetWidth = 1920, targetHeight = 1200) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [targetWidth, targetHeight]);

  return { scale, containerRef };
};

export default useZoomController;
