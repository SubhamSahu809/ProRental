import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const { pathname, hash } = useLocation();

  // Scroll to top on page change (or to the #section in the URL)
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {/* Home ends with the contact photo, which blends into the footer; other pages need breathing room */}
      <main className={`flex-1 ${pathname === "/" ? "" : "pb-16"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
