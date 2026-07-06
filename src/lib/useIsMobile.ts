import { useEffect, useState } from "react";

/** Reactive `max-width` media query hook for mobile-specific UI. */
export function useIsMobile(maxWidth = 720): boolean {
  const query = `(max-width:${maxWidth}px)`;
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
