import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Proporties from "./Proporties";
import Contact from "./Contact";

function Home() {
  return (
    <div className="w-full mx-auto">
      <Navbar />
      <Hero />
      <Proporties />
      <Contact />
      <Footer />
    </div>
  );
}
export default Home;
