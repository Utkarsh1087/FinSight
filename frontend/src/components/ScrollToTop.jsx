import React, { useEffect, useState } from "react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="scroll to top"
          className="back-to-top flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#001b50] hover:bg-primary text-white shadow-xl shadow-blue-900/20 transition duration-300 ease-in-out hover:scale-105 active:scale-95"
        >
          <span className="mt-[4px] h-2.5 w-2.5 rotate-45 border-l-2 border-t-2 border-white"></span>
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;
