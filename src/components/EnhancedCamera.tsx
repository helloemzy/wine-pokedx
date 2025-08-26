'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  FlashOn, 
  FlashOff, 
  CameraSwitch, 
  Zap, 
  ZapOff,
  Focus,
  Volume2,
  VolumeX,
  MapPin,
  Compass,
  X,
  Check,
  RotateCcw
} from 'lucide-react';

interface CameraConstraints {
  video: {
    width: { ideal: number; max: number };
    height: { ideal: number; max: number };
    facingMode: 'user' | 'environment';
    focusMode?: 'auto' | 'manual' | 'single-shot' | 'continuous';
    exposureMode?: 'none' | 'auto' | 'manual' | 'single-shot' | 'continuous';
    whiteBalanceMode?: 'none' | 'auto' | 'manual' | 'single-shot' | 'continuous';
  };
  audio: boolean;
}

interface EnhancedCameraProps {
  onCapture: (imageData: string, metadata?: CameraMetadata) => void;
  onClose: () => void;
  initialFacingMode?: 'user' | 'environment';
  enableGeolocation?: boolean;
  enableAudio?: boolean;
  autoFocus?: boolean;
  quality?: number;
  className?: string;
}

interface CameraMetadata {
  timestamp: Date;
  location?: GeolocationPosition;
  deviceInfo: {
    userAgent: string;
    platform: string;
    orientation: number;
  };
  cameraSettings: {
    facingMode: 'user' | 'environment';
    resolution: { width: number; height: number };
    flashEnabled: boolean;
  };
}

export default function EnhancedCamera({
  onCapture,
  onClose,
  initialFacingMode = 'environment',
  enableGeolocation = true,
  enableAudio = false,
  autoFocus = true,
  quality = 0.9,
  className = '',
}: EnhancedCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(enableAudio);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [supportedConstraints, setSupportedConstraints] = useState<any>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [orientation, setOrientation] = useState(0);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Get location if enabled
  useEffect(() => {
    if (enableGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.log('Location access denied:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [enableGeolocation]);

  // Handle device orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.screen?.orientation?.angle || 0);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  // Check supported camera constraints
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
      setSupportedConstraints(navigator.mediaDevices.getSupportedConstraints());
    }
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Define camera constraints
      const constraints: CameraConstraints = {
        video: {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          facingMode,
        },
        audio: audioEnabled,
      };

      // Add advanced constraints if supported
      if (supportedConstraints?.focusMode && autoFocus) {
        constraints.video.focusMode = 'continuous';
      }
      if (supportedConstraints?.exposureMode) {
        constraints.video.exposureMode = 'auto';
      }
      if (supportedConstraints?.whiteBalanceMode) {
        constraints.video.whiteBalanceMode = 'auto';
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        // Apply camera settings if supported
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          console.log('Camera capabilities:', capabilities);
          
          // Set flash/torch if supported
          if (capabilities.torch && flashEnabled) {
            await videoTrack.applyConstraints({
              advanced: [{ torch: true } as any]
            });
          }
        }
      }

      // Initialize audio context for sound effects
      if (audioEnabled && !audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply image enhancements
      if (flashEnabled) {
        // Simulate flash effect
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Convert to base64 with quality setting
      const imageData = canvas.toDataURL('image/jpeg', quality);

      // Create metadata
      const metadata: CameraMetadata = {
        timestamp: new Date(),
        location: location || undefined,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          orientation,
        },
        cameraSettings: {
          facingMode,
          resolution: { width: canvas.width, height: canvas.height },
          flashEnabled,
        },
      };

      // Play shutter sound
      playShutterSound();

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      onCapture(imageData, metadata);
    } catch (error) {
      console.error('Image capture failed:', error);
      setError('Failed to capture image');
    } finally {
      setIsCapturing(false);
    }
  }, [
    isCapturing,
    flashEnabled,
    quality,
    location,
    orientation,
    facingMode,
    onCapture
  ]);

  const playShutterSound = () => {
    if (audioEnabled && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    }
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.log('Flash toggle failed:', error);
        }
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleTapToFocus = async (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!streamRef.current || !autoFocus) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setFocusPoint({ x, y });

    // Apply focus constraint if supported
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.focusMode) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{
              focusMode: 'single-shot',
              pointsOfInterest: [{ x: x / 100, y: y / 100 }]
            } as any]
          });
        } catch (error) {
          console.log('Focus failed:', error);
        }
      }
    }

    // Clear focus point after animation
    setTimeout(() => setFocusPoint(null), 1000);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(1, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.zoom) {
        videoTrack.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        }).catch(console.error);
      }
    }
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white z-10 relative">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-2">
          {location && (
            <div className="flex items-center gap-1 bg-green-500 px-2 py-1 rounded-full text-xs">
              <MapPin size={12} />
              <span>Located</span>
            </div>
          )}
          
          <div className="bg-black/50 px-2 py-1 rounded-full text-xs">
            {facingMode === 'environment' ? 'Back' : 'Front'} Camera
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex-1 flex items-center justify-center text-white text-center p-8">
            <div>
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-bold mb-2">Camera Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <RotateCcw size={16} className="inline mr-2" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              onClick={handleTapToFocus}
              style={{
                transform: `scale(${zoomLevel}) ${orientation === 90 ? 'rotate(90deg)' : orientation === 270 ? 'rotate(-90deg)' : ''}`,
              }}
            />

            {/* Focus indicator */}
            <AnimatePresence>
              {focusPoint && (
                <motion.div
                  className="absolute w-16 h-16 border-2 border-white rounded-full pointer-events-none"
                  style={{
                    left: `${focusPoint.x}%`,
                    top: `${focusPoint.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Focus className="w-full h-full" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Zoom indicator */}
            {zoomLevel > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {zoomLevel.toFixed(1)}x
              </div>
            )}

            {/* Viewfinder grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Flash control */}
          <button
            onClick={toggleFlash}
            className={`p-4 rounded-full transition-colors ${
              flashEnabled 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            disabled={!supportedConstraints?.torch}
          >
            {flashEnabled ? <FlashOn size={24} /> : <FlashOff size={24} />}
          </button>

          {/* Capture button */}
          <motion.button
            onClick={captureImage}
            disabled={!isStreaming || isCapturing}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <AnimatePresence mode="wait">
              {isCapturing ? (
                <motion.div
                  key="capturing"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-green-500"
                >
                  <Check size={32} />
                </motion.div>
              ) : (
                <motion.div
                  key="camera"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-gray-800"
                >
                  <Camera size={32} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Capture animation ring */}
            <motion.div
              className="absolute inset-0 border-4 border-blue-500 rounded-full"
              initial={{ scale: 1, opacity: 0 }}
              animate={isCapturing ? { scale: 1.2, opacity: 1 } : { scale: 1, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* Camera switch */}
          <button
            onClick={switchCamera}
            className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <CameraSwitch size={24} />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
            <button
              onClick={() => handleZoom(-0.5)}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={zoomLevel <= 1}
            >
              <span className="text-xl font-bold">−</span>
            </button>
            
            <div className="w-20 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${((zoomLevel - 1) / 2) * 100}%` }}
              />
            </div>
            
            <button
              onClick={() => handleZoom(0.5)}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={zoomLevel >= 3}
            >
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}