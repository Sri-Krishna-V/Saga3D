import { useCallback, useEffect, useRef } from 'react';
import { useViewport } from '../contexts/ViewportContext';

export function useViewportControls() {
  const { state, dispatch, zoomIn, zoomOut, pan } = useViewport();
  const isDraggedRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

  // Handle wheel events for zooming
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const rect = (event.target as Element).getBoundingClientRect();
    const centerX = event.clientX - rect.left;
    const centerY = event.clientY - rect.top;
    
    dispatch({ 
      type: 'ZOOM', 
      payload: { 
        delta: -event.deltaY, 
        centerX, 
        centerY 
      } 
    });
  }, [dispatch]);

  // Handle mouse events for panning
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button !== 1 && event.button !== 0) return; // Only left and middle mouse
    
    event.preventDefault();
    isDraggedRef.current = false;
    lastPanPointRef.current = { x: event.clientX, y: event.clientY };
    dispatch({ type: 'SET_DRAGGING', payload: true });
  }, [dispatch]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!state.isDragging || !lastPanPointRef.current) return;
    
    event.preventDefault();
    isDraggedRef.current = true;
    
    const deltaX = event.clientX - lastPanPointRef.current.x;
    const deltaY = event.clientY - lastPanPointRef.current.y;
    
    pan(deltaX, deltaY);
    lastPanPointRef.current = { x: event.clientX, y: event.clientY };
  }, [state.isDragging, pan]);

  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false });
    lastPanPointRef.current = null;
    
    // Small delay to prevent click events after drag
    setTimeout(() => {
      isDraggedRef.current = false;
    }, 0);
  }, [dispatch]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      // Single touch - start panning
      const touch = event.touches[0];
      lastPanPointRef.current = { x: touch.clientX, y: touch.clientY };
      dispatch({ type: 'SET_DRAGGING', payload: true });
    } else if (event.touches.length === 2) {
      // Two finger touch - start pinch zoom
      dispatch({ type: 'SET_ZOOMING', payload: true });
      event.preventDefault();
    }
  }, [dispatch]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1 && state.isDragging && lastPanPointRef.current) {
      // Single touch pan
      event.preventDefault();
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastPanPointRef.current.x;
      const deltaY = touch.clientY - lastPanPointRef.current.y;
      
      pan(deltaX, deltaY);
      lastPanPointRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2 && state.isZooming) {
      // Pinch zoom
      event.preventDefault();
      // Implement pinch zoom logic here if needed
    }
  }, [state.isDragging, state.isZooming, pan]);

  const handleTouchEnd = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false });
    dispatch({ type: 'SET_ZOOMING', payload: false });
    lastPanPointRef.current = null;
  }, [dispatch]);

  // Keyboard shortcuts for zoom
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          dispatch({ type: 'RESET_VIEWPORT' });
          break;
      }
    }
  }, [zoomIn, zoomOut, dispatch]);

  // Set up event listeners
  useEffect(() => {
    const element = document.getElementById('viewport-container');
    if (!element) return;

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  ]);

  return {
    transform: state.transform,
    isDragging: state.isDragging,
    isZooming: state.isZooming,
    wasDragged: () => isDraggedRef.current,
  };
}

// Hook for getting viewport transform CSS
export function useViewportTransform() {
  const { state } = useViewport();
  
  const getTransformCSS = useCallback(() => {
    const { x, y, scale } = state.transform;
    return `translate(${x}px, ${y}px) scale(${scale})`;
  }, [state.transform]);

  const getInverseTransformCSS = useCallback(() => {
    const { x, y, scale } = state.transform;
    return `scale(${1/scale}) translate(${-x/scale}px, ${-y/scale}px)`;
  }, [state.transform]);

  return {
    transform: state.transform,
    transformCSS: getTransformCSS(),
    inverseTransformCSS: getInverseTransformCSS(),
  };
}
