import { useRef, useEffect, useState } from 'react';
import { Box, IconButton, useMediaQuery } from '@mui/material';
import CategoriaCard from './CategoriaCard.jsx';
import '../../styles/CategoriasSlider.css';

const CategoriasSlider = ({ categorias }) => {
  const scrollRef = useRef();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const el = scrollRef.current;
      if (el) {
        setShowArrows(el.scrollWidth > el.clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categorias]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    const amount = 150;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <Box className="slider-container">
      {isDesktop && showArrows && (
        <IconButton className="slider-arrow left" onClick={() => scroll('left')}>
          <i className="material-icons">chevron_left</i>
        </IconButton>
      )}

      <Box
        className={`slider-scroll ${!showArrows ? 'centered' : ''}`}
        ref={scrollRef}
      >
        {categorias.map((cat, idx) => (
          <Box key={idx} className="slider-item">
            <CategoriaCard 
              nombre={cat.nombre} 
              imagen={cat.imagen} 
              slug={cat.slug} 
            />
          </Box>
        ))}
      </Box>

      {isDesktop && showArrows && (
        <IconButton className="slider-arrow right" onClick={() => scroll('right')}>
          <i className="material-icons">chevron_right</i>
        </IconButton>
      )}
    </Box>
  );
};

export default CategoriasSlider;
