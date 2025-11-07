import { useEffect, useState } from "react";

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia("(orientation: landscape)").matches
  );

  useEffect(() => {
    const listener = (e) => {
      setIsLandscape(e.matches);
    };
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", listener);

    return () => mq.removeEventListener("change", listener);
  }, []);

  return isLandscape;
}
