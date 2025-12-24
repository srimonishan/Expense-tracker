
import React, { useRef, useState } from 'react';

interface Props {
  onImageCaptured: (base64: string) => void;
}

const ReceiptProcessor: React.FC<Props> = ({ onImageCaptured }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("Error accessing camera: " + err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onImageCaptured(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageCaptured(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={startCamera}
          className="flex-1 max-w-xs flex flex-col items-center gap-2 p-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          <i className="fa-solid fa-camera text-2xl"></i>
          <span className="font-semibold">Take Snap</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 max-w-xs flex flex-col items-center gap-2 p-6 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <i className="fa-solid fa-upload text-2xl"></i>
          <span className="font-semibold">Upload Photo</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md h-auto rounded-lg"
          />
          <div className="mt-8 flex gap-6">
            <button
              onClick={takePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-xl active:scale-90"
            >
              <div className="w-12 h-12 border-4 border-indigo-600 rounded-full"></div>
            </button>
            <button
              onClick={stopCamera}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default ReceiptProcessor;
