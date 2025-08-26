'use client';

import { useCallback, useRef, useState } from 'react';

interface GestureState {
  isPressed: boolean;
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  timestamp: number;
}

interface GestureCallbacks {
  onTap?: (event: TouchEvent | MouseEvent) => void;
  onDoubleTap?: (event: TouchEvent | MouseEvent) => void;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  onSwipeLeft?: (event: TouchEvent | MouseEvent) => void;
  onSwipeRight?: (event: TouchEvent | MouseEvent) => void;
  onSwipeUp?: (event: TouchEvent | MouseEvent) => void;
  onSwipeDown?: (event: TouchEvent | MouseEvent) => void;
  onPinch?: (scale: number, event: TouchEvent) => void;
  onDragStart?: (gesture: GestureState) => void;
  onDrag?: (gesture: GestureState) => void;
  onDragEnd?: (gesture: GestureState) => void;
}

interface GestureOptions {
  longPressDelay?: number;
  doubleTapDelay?: number;
  swipeThreshold?: number;
  velocityThreshold?: number;
  preventDefaultOnTouch?: boolean;
  enableHapticFeedback?: boolean;
}

const defaultOptions: Required<GestureOptions> = {
  longPressDelay: 500,
  doubleTapDelay: 300,
  swipeThreshold: 50,
  velocityThreshold: 0.5,
  preventDefaultOnTouch: true,
  enableHapticFeedback: true,
};

export function useGestures(callbacks: GestureCallbacks, options: GestureOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const gestureState = useRef<GestureState>({
    isPressed: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    timestamp: 0,
  });

  const [lastTapTime, setLastTapTime] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const lastScale = useRef(1);

  // Haptic feedback helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' = 'light') => {
    if (!opts.enableHapticFeedback) return;
    
    // Check if haptic feedback is available
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        selection: [5, 10],
        impact: [10, 50, 10],
      };
      navigator.vibrate(patterns[type]);
    }
  }, [opts.enableHapticFeedback]);

  const calculateVelocity = useCallback((deltaTime: number, deltaDistance: number) => {
    return deltaTime > 0 ? deltaDistance / deltaTime : 0;
  }, []);

  const getEventCoordinates = useCallback((event: TouchEvent | MouseEvent) => {
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }, []);

  const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
    const coords = getEventCoordinates(event);
    const now = Date.now();

    gestureState.current = {
      isPressed: true,
      isDragging: false,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      timestamp: now,
    };

    // Start long press timer
    if (callbacks.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (gestureState.current.isPressed && !gestureState.current.isDragging) {
          triggerHaptic('medium');
          callbacks.onLongPress?.(event);
        }
      }, opts.longPressDelay);
    }

    // Prevent default for touch events if specified
    if (opts.preventDefaultOnTouch && 'touches' in event) {
      event.preventDefault();
    }
  }, [callbacks.onLongPress, opts.longPressDelay, opts.preventDefaultOnTouch, getEventCoordinates, triggerHaptic]);

  const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isPressed) return;

    const coords = getEventCoordinates(event);
    const now = Date.now();
    const deltaTime = now - gestureState.current.timestamp;
    const deltaX = coords.x - gestureState.current.startX;
    const deltaY = coords.y - gestureState.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Update gesture state
    gestureState.current = {
      ...gestureState.current,
      currentX: coords.x,
      currentY: coords.y,
      deltaX,
      deltaY,
      velocity: calculateVelocity(deltaTime, distance),
    };

    // Start dragging if threshold exceeded
    if (!gestureState.current.isDragging && distance > 10) {
      gestureState.current.isDragging = true;
      clearTimeout(longPressTimer.current);
      callbacks.onDragStart?.(gestureState.current);
    }

    // Continue dragging
    if (gestureState.current.isDragging) {
      callbacks.onDrag?.(gestureState.current);
    }

    if (opts.preventDefaultOnTouch && 'touches' in event) {
      event.preventDefault();
    }
  }, [callbacks.onDragStart, callbacks.onDrag, opts.preventDefaultOnTouch, getEventCoordinates, calculateVelocity]);

  const handleEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isPressed) return;

    clearTimeout(longPressTimer.current);

    const now = Date.now();
    const { deltaX, deltaY, isDragging, velocity } = gestureState.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle drag end
    if (isDragging) {
      callbacks.onDragEnd?.(gestureState.current);
    } else {
      // Handle swipes (only if not dragging and meets threshold/velocity)
      if ((absDeltaX > opts.swipeThreshold || absDeltaY > opts.swipeThreshold) && velocity > opts.velocityThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            triggerHaptic('light');
            callbacks.onSwipeRight?.(event);
          } else {
            triggerHaptic('light');
            callbacks.onSwipeLeft?.(event);
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            triggerHaptic('light');
            callbacks.onSwipeDown?.(event);
          } else {
            triggerHaptic('light');
            callbacks.onSwipeUp?.(event);
          }
        }
      } else {
        // Handle taps (no significant movement)
        if (absDeltaX < 10 && absDeltaY < 10) {
          const timeSinceLastTap = now - lastTapTime;
          
          if (timeSinceLastTap < opts.doubleTapDelay && callbacks.onDoubleTap) {
            triggerHaptic('selection');
            callbacks.onDoubleTap(event);
            setLastTapTime(0); // Reset to prevent triple-tap
          } else {
            triggerHaptic('light');
            callbacks.onTap?.(event);
            setLastTapTime(now);
          }
        }
      }
    }

    // Reset gesture state
    gestureState.current.isPressed = false;
    gestureState.current.isDragging = false;
  }, [
    callbacks.onDragEnd, 
    callbacks.onSwipeRight, 
    callbacks.onSwipeLeft, 
    callbacks.onSwipeUp, 
    callbacks.onSwipeDown, 
    callbacks.onDoubleTap, 
    callbacks.onTap,
    opts.swipeThreshold,
    opts.velocityThreshold,
    opts.doubleTapDelay,
    lastTapTime,
    triggerHaptic
  ]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    // Handle pinch gestures
    if (event.touches.length === 2 && callbacks.onPinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const initialDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastScale.current = initialDistance;
      return;
    }
    
    handleStart(event);
  }, [handleStart, callbacks.onPinch]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Handle pinch gestures
    if (event.touches.length === 2 && callbacks.onPinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = currentDistance / lastScale.current;
      callbacks.onPinch(scale, event);
      return;
    }

    handleMove(event);
  }, [handleMove, callbacks.onPinch]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    handleEnd(event);
  }, [handleEnd]);

  // Mouse event handlers (for desktop compatibility)
  const handleMouseDown = useCallback((event: MouseEvent) => {
    handleStart(event);
  }, [handleStart]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    handleMove(event);
  }, [handleMove]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    handleEnd(event);
  }, [handleEnd]);

  // Return event handlers and current gesture state
  return {
    // Touch event handlers
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    
    // Mouse event handlers (for desktop)
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    
    // Current gesture state (readonly)
    gestureState: gestureState.current,
    
    // Helper functions
    triggerHaptic,
  };
}

export default useGestures;