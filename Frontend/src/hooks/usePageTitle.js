import { useEffect } from "react";

/** Sets a per-page <title> (single-page apps otherwise show the same title everywhere). */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ProRental` : "ProRental: Find rental homes & properties";
  }, [title]);
}
