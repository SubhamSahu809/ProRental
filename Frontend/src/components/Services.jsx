// RealEstateSolutions.jsx
import React, { useState } from "react";


const services = [
  {
    id: 1,
    title: "Luxury Residences",
    description:
      "Experience unparalleled elegance in our luxury residences, featuring exquisite design, premium amenities, and prime locations for the most discerning tastes.",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" height="28" width="28">
        <path d="M3 9.5V21h6v-6h6v6h6V9.5L12 3Zm13 6.5h-4v-5h-4v5H5V10.207l7-5.833 7 5.833Z" />
      </svg>
    ),
    imgSrc: "/images/luxury.png", // You can replace this with your uploaded image path
    altText:
      "Modern luxury residence with concrete and glass architecture surrounded by a small yard and pool",
  },
  {
    id: 2,
    title: "Eco Green Buildings",
    description:
      "Innovative sustainable buildings designed with green technologies to reduce carbon footprint while maintaining luxury and comfort.",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" height="28" width="28">
        <path d="M12 2C8.5 7 4 10.5 4 15a8 8 0 0 0 16 0c0-4.5-4.5-8-8-13Zm-.5 2c1.5 2.7 4.5 3.6 5.5 7a6 6 0 0 1-11 0c.7-2.8 3.8-4.1 5.5-7Z" />
      </svg>
    ),
    imgSrc: "/images/green.png",
    altText: "Eco green building exterior featuring plants and modern design",
  },
  {
    id: 3,
    title: "Unique Vacation Homes",
    description:
      "Exclusive vacation homes in unique locations, combining privacy and breathtaking designs for unforgettable stays.",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" height="28" width="28">
        <path d="M12 3l9 7-3 11H6L3 10l9-7zm0 2.18L6.14 9h11.72L12 5.18zM5.5 12 4 19.27h16L18.5 12H5.5z" />
      </svg>
    ),
    imgSrc: "/images/vacation.png",
    altText: "Unique vacation home with an ocean view and open layout",
  },
];

export default function RealEstateSolutions() {
  const [selected, setSelected] = useState(0);
  const service = services[selected];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-12 font-sans text-gray-900">
      <span className="inline-block bg-gray-200 rounded-full px-4 py-1 text-sm font-medium text-gray-700 mb-3 select-none">
        What We Offer
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3 max-w-3xl">
        COMPREHENSIVE REAL ESTATE SOLUTIONS
      </h2>
      <p className="max-w-3xl text-gray-700 mb-10 text-lg">
        Our comprehensive services encompass luxury property sales, sustainable
        green building investments, and premium vacation rentals.
      </p>

      <div className="flex flex-col lg:flex-row items-center gap-10 relative">
        {/* Text Content */}
        <div className="flex flex-col space-y-6 flex-1 max-w-lg">
          <div className="flex items-center space-x-3">
            <div className="text-gray-900">{service.icon}</div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{service.description}</p>
        </div>

        {/* Image & Vertical Tabs */}
        <div className="relative flex-1 max-w-xl w-full">
          <img
            src={service.imgSrc}
            alt={service.altText}
            className="rounded-3xl w-full block object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Image+Not+Available";
            }}
          />

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-baseline space-x-2 shadow-md select-none">
            <span className="text-4xl font-light">{`0${service.id}`}</span>
            <span className="font-semibold">{service.title}</span>
          </div>

          {/* Vertical Navigation */}
          <div className="hidden lg:flex flex-col absolute right-[-5rem] top-6 h-[260px] justify-between border-l border-gray-300 pl-6 select-none">
            {services.map(({ id, title }) => (
              <button
                key={id}
                onClick={() => setSelected(id - 1)}
                className={`transform -rotate-90 origin-left tracking-widest font-extrabold text-lg cursor-pointer transition-colors duration-300 ${
                  selected === id - 1
                    ? "text-gray-900 pointer-events-none"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {id.toString().padStart(2, "0")} {title.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
