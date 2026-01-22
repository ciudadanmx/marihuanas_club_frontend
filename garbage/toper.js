import React, { useState, useEffect } from 'react';
//este componente va a iniciar oculto y una vez que se haga tantio scroll hacia abajo va a aparecer, lleva hasta el top de la pagina cuando se presiona
const TopScroller = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolling down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            cursor: 'pointer',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px'
          }}
        >
          ↑
        </button>
      )}
    </>
  );
};

export default TopScroller;