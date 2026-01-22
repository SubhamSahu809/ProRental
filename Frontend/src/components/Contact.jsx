import React from 'react'
import bgImg from '../../public/images/contact-bg.jpg';

function Contact() {
  return (
    
    <section
      id="contact"
      className="bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImg})`,
      }}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center px-4 py-12">
        <button className="mb-6 px-4 py-1 rounded-full bg-white text-gray-700 text-xs font-medium shadow hover:bg-gray-100 transition">
          Get in Touch
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 leading-tight">
          LET’S MAKE YOUR PROPERTY JOURNEY <br className="hidden sm:block" /> EFFORTLESS
        </h2>
        <p className="text-white text-center text-sm sm:text-base mb-8 max-w-lg">
          Have questions or ready to take the next step? Whether you’re looking to buy, rent, or invest, our team is here to guide you every step of the way. Let’s turn your property goals into reality.
        </p>
        <form className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="flex-1 border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="flex-1 border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm"
            />
            <input
              type="tel"
              placeholder="Phone"
              className="flex-1 border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm"
            />
          </div>
          <textarea
            placeholder="What Can We Help You?"
            rows={2}
            className="border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm resize-none"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-black text-white rounded-full py-3 font-semibold text-base shadow hover:bg-gray-900 transition"
          >
            Book a Call
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact