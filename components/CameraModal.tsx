
import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback
      try {
           const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
           setStream(fallbackStream);
           if (videoRef.current) videoRef.current.srcObject = fallbackStream;
      } catch (e) {
          alert("Could not access camera.");
          onClose();
      }
    }
  };

  useEffect(() => {
    if (isOpen) startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        onCapture(data);
        onClose();
      }
    }
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full">
            <X className="w-6 h-6" />
        </button>
        
        <button onClick={toggleCamera} className="absolute top-4 left-4 text-white p-2 bg-black/50 rounded-full">
            <RefreshCw className="w-6 h-6" />
        </button>
      </div>
      
      <div className="h-24 bg-black flex items-center justify-center pb-8 pt-4">
         <button 
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white transition"
         >
             <div className="w-12 h-12 bg-white rounded-full"></div>
         </button>
      </div>
    </div>
  );
};
