import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Viewport transformation interface
export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface ViewportBounds {
  minScale: number;
  maxScale: number;
  panBounds?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

interface ViewportState {
  transform: ViewportTransform;
  bounds: ViewportBounds;
  isDragging: boolean;
  isZooming: boolean;
}

type ViewportAction =
  | { type: 'SET_TRANSFORM'; payload: ViewportTransform }
  | { type: 'ZOOM'; payload: { delta: number; centerX: number; centerY: number } }
  | { type: 'PAN'; payload: { deltaX: number; deltaY: number } }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_ZOOMING'; payload: boolean }
  | { type: 'RESET_VIEWPORT' }
  | { type: 'FIT_TO_VIEW'; payload: { width: number; height: number } };

const initialState: ViewportState = {
  transform: { x: 0, y: 0, scale: 1 },
  bounds: {
    minScale: 0.1,
    maxScale: 5.0,
  },
  isDragging: false,
  isZooming: false,
};

function viewportReducer(state: ViewportState, action: ViewportAction): ViewportState {
  switch (action.type) {
    case 'SET_TRANSFORM':
      return {
        ...state,
        transform: constrainTransform(action.payload, state.bounds),
      };

    case 'ZOOM': {
      const { delta, centerX, centerY } = action.payload;
      const scaleFactor = delta > 0 ? 1.1 : 0.9;
      const newScale = Math.max(
        state.bounds.minScale,
        Math.min(state.bounds.maxScale, state.transform.scale * scaleFactor)
      );

      // Zoom towards the center point
      const scaleRatio = newScale / state.transform.scale;
      const newX = centerX - (centerX - state.transform.x) * scaleRatio;
      const newY = centerY - (centerY - state.transform.y) * scaleRatio;

      return {
        ...state,
        transform: constrainTransform({ x: newX, y: newY, scale: newScale }, state.bounds),
      };
    }

    case 'PAN': {
      const { deltaX, deltaY } = action.payload;
      const newTransform = {
        ...state.transform,
        x: state.transform.x + deltaX,
        y: state.transform.y + deltaY,
      };

      return {
        ...state,
        transform: constrainTransform(newTransform, state.bounds),
      };
    }

    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };

    case 'SET_ZOOMING':
      return { ...state, isZooming: action.payload };

    case 'RESET_VIEWPORT':
      return {
        ...state,
        transform: { x: 0, y: 0, scale: 1 },
        isDragging: false,
        isZooming: false,
      };

    case 'FIT_TO_VIEW': {
      const { width, height } = action.payload;
      // Calculate scale to fit content with some padding
      const padding = 50;
      const scaleX = (window.innerWidth - padding * 2) / width;
      const scaleY = (window.innerHeight - padding * 2) / height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1:1

      const centerX = (window.innerWidth - width * scale) / 2;
      const centerY = (window.innerHeight - height * scale) / 2;

      return {
        ...state,
        transform: constrainTransform({ x: centerX, y: centerY, scale }, state.bounds),
      };
    }

    default:
      return state;
  }
}

function constrainTransform(transform: ViewportTransform, bounds: ViewportBounds): ViewportTransform {
  let { x, y, scale } = transform;

  // Constrain scale
  scale = Math.max(bounds.minScale, Math.min(bounds.maxScale, scale));

  // Constrain pan bounds if specified
  if (bounds.panBounds) {
    x = Math.max(bounds.panBounds.left, Math.min(bounds.panBounds.right, x));
    y = Math.max(bounds.panBounds.top, Math.min(bounds.panBounds.bottom, y));
  }

  return { x, y, scale };
}

interface ViewportContextType {
  state: ViewportState;
  dispatch: React.Dispatch<ViewportAction>;
  zoomIn: (centerX?: number, centerY?: number) => void;
  zoomOut: (centerX?: number, centerY?: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  resetViewport: () => void;
  fitToView: (width: number, height: number) => void;
  setTransform: (transform: ViewportTransform) => void;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(viewportReducer, initialState);

  const zoomIn = (centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) => {
    dispatch({ type: 'ZOOM', payload: { delta: 1, centerX, centerY } });
  };

  const zoomOut = (centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) => {
    dispatch({ type: 'ZOOM', payload: { delta: -1, centerX, centerY } });
  };

  const pan = (deltaX: number, deltaY: number) => {
    dispatch({ type: 'PAN', payload: { deltaX, deltaY } });
  };

  const resetViewport = () => {
    dispatch({ type: 'RESET_VIEWPORT' });
  };

  const fitToView = (width: number, height: number) => {
    dispatch({ type: 'FIT_TO_VIEW', payload: { width, height } });
  };

  const setTransform = (transform: ViewportTransform) => {
    dispatch({ type: 'SET_TRANSFORM', payload: transform });
  };

  const value = {
    state,
    dispatch,
    zoomIn,
    zoomOut,
    pan,
    resetViewport,
    fitToView,
    setTransform,
  };

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  return context;
}
