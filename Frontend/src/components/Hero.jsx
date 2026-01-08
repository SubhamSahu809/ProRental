import React from "react";

const Hero = () => {
  return (
         <section className="relative w-[98%] sm:w-[95%] md:w-[90%] mt-2 sm:mt-4 md:mt-6  mx-auto rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden text-white bg-[url('/images/hero.jpg')] bg-cover bg-center min-h-[350px] sm:min-h-[400px] md:min-h-[470px] lg:min-h-[600px]">
       <div className="absolute inset-0 bg-black/45" />

               <div className="relative z-[2] p-4 sm:p-4 md:p-6 lg:p-8 max-w-[600px] min-h-[250px] sm:min-h-[300px] md:min-h-[370px] lg:min-h-[470px] flex flex-col justify-center">
         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-3 sm:mb-4 md:mb-6 lg:mb-8">
           FIND YOUR
           <br />
           PERFECT HOME
           <br />
           TODAY
         </h1>
         <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-3 sm:mb-4 md:mb-6">
           We provide tailored real estate solutions...
         </p>

         <a
           href="#properties"
           className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 my-3 sm:my-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-neutral-100 w-fit"
         >
           Explore Properties
           <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-black text-white text-xs sm:text-sm">
             ↗
           </span>
         </a>

         <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-8 lg:gap-12 mt-4 sm:mt-6 md:mt-8 lg:mt-12 font-medium">
           <div>
             <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">200+</div>
             <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-neutral-300">Projects</div>
           </div>
           <div>
             <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">70+</div>
             <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-neutral-300">Clients</div>
           </div>
           <div>
             <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">$10M+</div>
             <div className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-neutral-300">Value</div>
           </div>
         </div>
       </div>

             <div className="absolute right-0 bottom-0 z-[3] bg-white p-2 sm:p-3 md:p-4 rounded-tl-xl sm:rounded-tl-2xl md:rounded-tl-3xl flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
         <div className="flex items-center">
           <img
             src="/images/agent1.jpg"
             className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-[55px] xl:h-[55px] rounded-full border-2 border-white object-cover -ml-1 sm:-ml-1.5 md:-ml-2 first:ml-0"
             alt="Agent 1"
           />
           <img
             src="/images/agent2.jpg"
             className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-[55px] xl:h-[55px] rounded-full border-2 border-white object-cover -ml-1 sm:-ml-1.5 md:-ml-2"
             alt="Agent 2"
           />
           <img
             src="/images/agent3.avif"
             className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-[55px] xl:h-[55px] rounded-full border-2 border-white object-cover -ml-1 sm:-ml-1.5 md:-ml-2"
             alt="Agent 3"
           />
           <img
             src="/images/agent4.avif"
             className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-[55px] xl:h-[55px] rounded-full border-2 border-white object-cover -ml-1 sm:-ml-1.5 md:-ml-2"
             alt="Agent 4"
           />
         </div>
         <div className="flex flex-col leading-tight">
           <span className="text-xs sm:text-sm font-semibold text-neutral-900">
             10+ Featured Agents
           </span>
           <span className="text-xs sm:text-sm md:text-base lg:text-lg text-yellow-400">★★★★★ 5 / 5</span>
         </div>
       </div>
    </section>
  );
};

export default Hero;
