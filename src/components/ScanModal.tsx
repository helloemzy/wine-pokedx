'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Mic, MicOff, Square, Play } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScanModal({ isOpen, onClose }: ScanModalProps) {
  const [scanStep, setScanStep] = useState<'camera' | 'analyzing' | 'details' | 'tasting'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      // Stop camera
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      // Simulate analysis
      setScanStep('analyzing');
      setTimeout(() => {
        setScanStep('details');
      }, 3000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasAudio(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen && scanStep === 'camera') {
      startCamera();
    }
    
    return () => {
      // Clean up camera stream when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, scanStep]);

  const resetModal = () => {
    setScanStep('camera');
    setIsRecording(false);
    setRecordingTime(0);
    setHasAudio(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-blue-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {scanStep === 'camera' && 'Scan Wine Bottle'}
                  {scanStep === 'analyzing' && 'Analyzing...'}
                  {scanStep === 'details' && 'Wine Details'}
                  {scanStep === 'tasting' && 'Tasting Notes'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Camera Step */}
              {scanStep === 'camera' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6 aspect-video relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-4 border-dashed border-white/30 m-8 rounded-lg"></div>
                    <div className="absolute inset-x-0 bottom-4 text-white text-sm bg-black/50 backdrop-blur-sm mx-4 py-2 px-4 rounded-lg">
                      Position wine label in the frame
                    </div>
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={captureImage}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera size={20} />
                      Capture
                    </motion.button>
                    
                    <motion.button
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload size={20} />
                      Upload
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Analyzing Step */}
              {scanStep === 'analyzing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6 pokeball-spin"></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Wine Label...</h3>
                  <p className="text-gray-600">Using AI to extract wine information</p>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Reading wine name and vintage
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Identifying region and producer
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Matching grape varieties...
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Details Step */}
              {scanStep === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-2xl p-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Château Margaux 2015</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Region:</span>
                        <div className="font-semibold">Bordeaux, France</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <div className="font-semibold">Red Wine</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Grape:</span>
                        <div className="font-semibold">Cabernet Sauvignon</div>
                      </div>
                      <div>
                        <span className="text-gray-600">ABV:</span>
                        <div className="font-semibold">13.5%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-6">Ready to add tasting notes?</p>
                    <div className="flex gap-4 justify-center">
                      <motion.button
                        onClick={() => setScanStep('tasting')}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Notes
                      </motion.button>
                      
                      <motion.button
                        onClick={handleClose}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save to Collection
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tasting Notes Step */}
              {scanStep === 'tasting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-6">
                    {/* Voice Recording */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold mb-3">Voice Notes</h4>
                      <div className="flex items-center gap-4">
                        {!isRecording && !hasAudio && (
                          <motion.button
                            onClick={startRecording}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Mic size={16} />
                            Start Recording
                          </motion.button>
                        )}
                        
                        {isRecording && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-red-600">
                              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                              <span className="font-mono">{formatTime(recordingTime)}</span>
                            </div>
                            <motion.button
                              onClick={stopRecording}
                              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Square size={16} />
                              Stop
                            </motion.button>
                          </div>
                        )}
                        
                        {hasAudio && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-green-600">
                              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                              <span>Recording saved</span>
                            </div>
                            <button className="text-blue-500 hover:text-blue-600">
                              <Play size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* WSET Structure */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold mb-3">WSET Level 3 Structure</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="block font-medium mb-1">Appearance</label>
                          <select className="w-full p-2 border rounded-lg">
                            <option>Select intensity...</option>
                            <option>Pale</option>
                            <option>Medium</option>
                            <option>Deep</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block font-medium mb-1">Nose Intensity</label>
                          <select className="w-full p-2 border rounded-lg">
                            <option>Select intensity...</option>
                            <option>Light</option>
                            <option>Medium(-)</option>
                            <option>Medium</option>
                            <option>Medium(+)</option>
                            <option>Pronounced</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block font-medium mb-1">Primary Aromas</label>
                          <textarea 
                            className="w-full p-2 border rounded-lg resize-none" 
                            rows={2}
                            placeholder="e.g., blackcurrant, cedar, graphite..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <motion.button
                        onClick={handleClose}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Wine Card
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}