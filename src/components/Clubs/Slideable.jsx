import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Paper, IconButton, Typography, Collapse } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

/**
 * Slideable Component
 * Componente que muestra una barra horizontal pequeña inicialmente,
 * pero se puede deslizar hacia arriba para expandirse como en Didi, Uber, Facebook
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido que se muestra cuando está expandido
 * @param {React.ReactNode} props.collapsedContent - Contenido de la barra pequeña
 * @param {number} props.expandedHeight - Altura cuando está expandido (default: 400px)
 * @param {number} props.collapsedHeight - Altura cuando está colapsado (default: 60px)
 * @param {boolean} props.defaultExpanded - Si inicia expandido (default: false)
 * @param {function} props.onExpand - Callback cuando se expande
 * @param {function} props.onCollapse - Callback cuando se colapsa
 * @param {boolean} props.showHandle - Mostrar el indicador de deslizamiento (default: true)
 */
export default function Slideable({
  children,
  collapsedContent,
  expandedHeight = 400,
  collapsedHeight = 60,
  defaultExpanded = false,
  onExpand,
  onCollapse,
  showHandle = true,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Calcular la altura actual basada en el estado y el arrastre
  const getCurrentHeight = useCallback(() => {
    if (!isDragging) {
      return isExpanded ? expandedHeight : collapsedHeight;
    }

    // Durante el arrastre, calcular altura basada en la posición
    const dragDistance = startY - currentY;
    const progress = Math.max(0, Math.min(1, dragDistance / (expandedHeight - collapsedHeight)));

    if (isExpanded) {
      // Si está expandido, reducir altura
      return expandedHeight - (progress * (expandedHeight - collapsedHeight));
    } else {
      // Si está colapsado, aumentar altura
      return collapsedHeight + (progress * (expandedHeight - collapsedHeight));
    }
  }, [isDragging, isExpanded, startY, currentY, expandedHeight, collapsedHeight]);

  // Manejar inicio del toque/arrastre
  const handleStart = useCallback((clientY) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
  }, []);

  // Manejar movimiento del toque/arrastre
  const handleMove = useCallback((clientY) => {
    if (!isDragging) return;
    setCurrentY(clientY);
  }, [isDragging]);

  // Manejar fin del toque/arrastre
  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const dragDistance = startY - currentY;
    const threshold = 50; // Distancia mínima para cambiar estado

    if (isExpanded) {
      // Si está expandido, colapsar si se arrastró hacia abajo lo suficiente
      if (dragDistance < -threshold) {
        setIsExpanded(false);
        onCollapse?.();
      }
    } else {
      // Si está colapsado, expandir si se arrastró hacia arriba lo suficiente
      if (dragDistance > threshold) {
        setIsExpanded(true);
        onExpand?.();
      }
    }

    setIsDragging(false);
  }, [isDragging, startY, currentY, isExpanded, onExpand, onCollapse]);

  // Event listeners para mouse
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (containerRef.current?.contains(e.target)) {
        handleStart(e.clientY);
      }
    };

    const handleMouseMove = (e) => {
      handleMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleStart, handleMove, handleEnd]);

  // Event listeners para touch
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (containerRef.current?.contains(e.target)) {
        handleStart(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      handleMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  const currentHeight = getCurrentHeight();

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        ...props.sx
      }}
      {...props}
    >
      <Paper
        elevation={isExpanded ? 8 : 4}
        sx={{
          height: currentHeight,
          borderRadius: isExpanded ? '16px 16px 0 0' : '8px 8px 0 0',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Indicador de deslizamiento */}
        {showHandle && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 4,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              zIndex: 1,
            }}
          />
        )}

        {/* Contenido colapsado */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: collapsedHeight,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            zIndex: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {collapsedContent || (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Desliza hacia arriba para expandir
              </Typography>
            )}
          </Box>

          <IconButton
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded) {
                onExpand?.();
              } else {
                onCollapse?.();
              }
            }}
            sx={{ ml: 1 }}
          >
            {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          </IconButton>
        </Box>

        {/* Contenido expandido */}
        <Collapse in={isExpanded && !isDragging} timeout={300}>
          <Box
            ref={contentRef}
            sx={{
              position: 'absolute',
              top: collapsedHeight,
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
              overflowY: 'auto',
            }}
          >
            {children}
          </Box>
        </Collapse>

        {/* Overlay durante arrastre para mejor UX */}
        {isDragging && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(2px)',
              zIndex: 3,
            }}
          />
        )}
      </Paper>
    </Box>
  );
}