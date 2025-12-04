import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, RefreshCw, X, Video, Aperture, Settings2, Keyboard, Search, ArrowRight } from 'lucide-react';
import { analyzeQRCodeImage, analyzeString } from '../services/geminiService';
import { RiskLevel, ScanResult } from '../types';

const Scanner: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Manual Input State
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (deviceId?: string) => {
    stopCameraStream();
    setIsManualMode(false);
    setIsCameraOpen(true);
    setResult(null);
    setPreview(null);

    try {
      // Request initial permission or specific device
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Enumerate devices for the selector
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = allDevices.filter(d => d.kind === 'videoinput');
      setVideoDevices(cameras);

      // Set current device ID
      if (!deviceId && cameras.length > 0) {
        // Try to find the active device from the stream tracks
        const track = stream.getVideoTracks()[0];
        const activeDevice = cameras.find(c => c.label === track.label);
        setSelectedDeviceId(activeDevice ? activeDevice.deviceId : cameras[0].deviceId);
      } else if (deviceId) {
        setSelectedDeviceId(deviceId);
      }

    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please ensure permissions are granted and your external camera is connected.");
      setIsCameraOpen(false);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    startCamera(newId);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64String = canvas.toDataURL('image/jpeg');
        
        // Stop camera and process
        stopCameraStream();
        setIsCameraOpen(false);
        processImage(base64String);
      }
    }
  };

  const closeCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
  };

  const processImage = async (base64String: string) => {
    setPreview(base64String);
    setResult(null);
    setIsAnalyzing(true);

    // Strip prefix for API
    const base64Data = base64String.split(',')[1];
    
    try {
      const analysis = await analyzeQRCodeImage(base64Data);
      setResult(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processManualInput = async () => {
    if (!manualText.trim()) return;
    
    setPreview("MANUAL_INPUT_PLACEHOLDER"); // Dummy to trigger result view structure
    setResult(null);
    setIsAnalyzing(true);
    setIsManualMode(false);

    try {
      const analysis = await analyzeString(manualText);
      setResult(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      processImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const getStatusColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/50';
      case RiskLevel.WARNING: return 'text-amber-400 bg-amber-400/10 border-amber-500/50';
      case RiskLevel.DANGER: return 'text-rose-500 bg-rose-500/10 border-rose-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return <ShieldCheck className="w-16 h-16 mb-4 text-emerald-400" />;
      case RiskLevel.WARNING: return <AlertTriangle className="w-16 h-16 mb-4 text-amber-400" />;
      case RiskLevel.DANGER: return <ShieldAlert className="w-16 h-16 mb-4 text-rose-500" />;
      default: return <RefreshCw className="w-16 h-16 mb-4 text-slate-400" />;
    }
  };

  const resetScanner = () => {
    setPreview(null);
    setResult(null);
    setManualText('');
    setIsManualMode(false);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 max-w-md mx-auto w-full">
      {!isCameraOpen && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Smart Scan
          </h2>
          <p className="text-slate-400 text-sm">Detect threats in QR codes instantly.</p>
        </div>
      )}

      {/* Main Action Area */}
      {!preview && !isCameraOpen && !isManualMode && (
        <div className="flex-1 flex flex-col space-y-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* File Upload */}
          <div 
            onClick={triggerUpload}
            className="flex-1 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group min-h-[160px]"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="text-center px-6">
              <p className="font-semibold text-slate-200">Upload Image</p>
              <p className="text-xs text-slate-500 mt-1">Select from Gallery</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-slate-600 text-xs uppercase font-bold tracking-widest">
            <span>OR</span>
          </div>

          {/* Live Camera Button */}
          <button 
            onClick={() => startCamera()}
            className="h-24 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/30 rounded-2xl flex items-center justify-center space-x-4 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20">
              <Video className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-200">Live Camera</p>
              <p className="text-xs text-slate-500">Supports External Cams</p>
            </div>
          </button>

          {/* Manual Input Button */}
          <button 
            onClick={() => setIsManualMode(true)}
            className="h-16 bg-transparent hover:bg-slate-800/50 border border-slate-800 hover:border-purple-500/30 rounded-xl flex items-center justify-center space-x-3 transition-all group"
          >
            <Keyboard className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-purple-300">Enter Link Manually</span>
          </button>
        </div>
      )}

      {/* Manual Input Mode */}
      {isManualMode && (
        <div className="flex-1 flex flex-col justify-center animate-in zoom-in-95 duration-200">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center">
                    <Search className="w-5 h-5 mr-2 text-purple-400" />
                    Manual Analysis
                 </h3>
                 <button onClick={() => setIsManualMode(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                <textarea 
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste URL or suspect text here..."
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm font-mono"
                />
                <button 
                  onClick={processManualInput}
                  disabled={!manualText.trim()}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center"
                >
                  Analyze Security Risk <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Live Camera View */}
      {isCameraOpen && (
        <div className="flex-1 flex flex-col relative bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover" 
          />
          
          {/* Camera Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
             <button 
               onClick={closeCamera}
               className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
             
             {videoDevices.length > 0 && (
               <div className="relative max-w-[200px]">
                 <div className="absolute left-2 top-2 pointer-events-none text-cyan-400">
                    <Settings2 className="w-4 h-4" />
                 </div>
                 <select 
                   value={selectedDeviceId}
                   onChange={handleCameraChange}
                   className="w-full pl-8 pr-4 py-1.5 bg-black/60 backdrop-blur-md border border-slate-600 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none truncate"
                 >
                   {videoDevices.map((device, idx) => (
                     <option key={device.deviceId} value={device.deviceId}>
                       {device.label || `Camera ${idx + 1}`}
                     </option>
                   ))}
                 </select>
               </div>
             )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/90 to-transparent">
             <button 
               onClick={captureImage}
               className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95 shadow-lg shadow-black/50"
             >
               <div className="w-12 h-12 bg-white rounded-full" />
             </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Analysis View */}
      {preview && !isCameraOpen && (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Only show image preview if it's a real image, skip for manual text */}
           {preview !== "MANUAL_INPUT_PLACEHOLDER" && (
             <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <img src={preview} alt="QR Preview" className="w-full h-full object-contain opacity-80" />
                <button 
                  onClick={resetScanner}
                  className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
             </div>
           )}

           {isAnalyzing ? (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
               <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
               <p className="text-cyan-400/80 font-mono text-sm animate-pulse">Running AI Security Diagnostics...</p>
             </div>
           ) : result ? (
             <div className={`flex-1 flex flex-col rounded-2xl p-6 border ${getStatusColor(result.riskLevel)}`}>
               {/* Close/Reset Button for Result View */}
               <div className="flex justify-end -mt-2 -mr-2 mb-2">
                 <button onClick={resetScanner} className="p-2 rounded-full hover:bg-black/20 text-current opacity-70 hover:opacity-100">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="flex flex-col items-center text-center">
                 {getStatusIcon(result.riskLevel)}
                 <h3 className="text-xl font-bold uppercase tracking-wider mb-1">{result.riskLevel}</h3>
                 <p className="text-lg font-medium mb-6">{result.summary}</p>
                 
                 <div className="w-full text-left space-y-4">
                   <div className="bg-black/20 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Content Analysis</p>
                      <p className="font-mono text-xs break-all text-slate-200">{result.content}</p>
                   </div>

                   <div>
                     <p className="text-sm font-semibold text-slate-300 mb-2">Analysis:</p>
                     <ul className="space-y-2">
                       {result.reasoning.map((r, i) => (
                         <li key={i} className="flex items-start text-sm text-slate-400">
                           <span className="mr-2 text-cyan-500">•</span> {r}
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-semibold text-slate-300 mb-2">Recommendation:</p>
                      <ul className="space-y-2">
                        {result.safetyTips.map((tip, i) => (
                          <li key={i} className="flex items-start text-sm font-medium text-slate-200">
                            <span className="mr-2 text-cyan-500">✓</span> {tip}
                          </li>
                        ))}
                      </ul>
                   </div>
                 </div>
               </div>
             </div>
           ) : null}
        </div>
      )}
    </div>
  );
};

export default Scanner;