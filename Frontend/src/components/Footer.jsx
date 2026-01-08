import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="mx-auto w-full px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7 mb-4 md:mb-0">
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-white text-neutral-900 mr-2">🏠</span>
              <span className="font-bold text-2xl">VISTAHAVEN</span>
            </div>

            <p className="mb-2">+1-800-555-1234</p>
            <p className="mb-2">info@vistahaven.com</p>
            <p className="mb-0">123 Serenity Boulevard, Greenwood Heights, NY 11222, United States</p>
          </div>

          <div className="col-span-12 md:col-span-5 flex flex-col justify-between md:items-end md:text-right">
            <div className="flex mb-4 gap-3">
              <a
                href="https://www.facebook.com/vistahaven"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-600 text-white flex justify-center items-center w-10 h-10"
                aria-label="Facebook Profile"
              >
                <span className="text-sm">f</span>
              </a>

              <a
                href="https://www.linkedin.com/company/vistahaven"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-600 text-white flex justify-center items-center w-10 h-10"
                aria-label="LinkedIn Profile"
              >
                <span className="text-sm">in</span>
              </a>

              <a
                href="https://www.youtube.com/vistahaven"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-600 text-white flex justify-center items-center w-10 h-10"
                aria-label="YouTube Channel"
              >
                <span className="text-sm">▶</span>
              </a>
            </div>

            <p className="mb-0">&copy; Copyright {currentYear}. All Rights Reserved by oldshen</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;