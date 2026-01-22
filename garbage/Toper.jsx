import React, { useState, useEffect } from 'react';

const Toper = ({ targetId = "marihuanasclub-app" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const toggleVisibility = () => {
      setIsVisible(el.scrollTop > 300);
    };

    el.addEventListener('scroll', toggleVisibility);

    return () => {
      el.removeEventListener('scroll', toggleVisibility);
    };
  }, [targetId]);

  const scrollToTop = () => {
    const el = document.getElementById(targetId);
    if (!el) return;

    el.scrollTo({
      top: 0,
      behavior: 'smooth',
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
            fontSize: '20px',
          }}
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Toper;
