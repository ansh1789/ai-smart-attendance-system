import { useState, useRef, useCallback } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineCheckCircle, HiOutlineUserCircle } from 'react-icons/hi2';

const FaceRegistration = () => {
  const { user, login } = useAuth(); // Need login to refresh user data if needed, or we just reload
  const { darkMode } = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(user?.faceRegistered);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const captureAndRegister = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      await aiAPI.registerFace({ imageData, studentId: user._id });
      toast.success('Face registered successfully!');
      setRegistered(true);
      stopCamera();
      // In a real app, you might want to refresh the user profile context here
      if (typeof window !== 'undefined') {
          setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register face');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Face Registration</h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Register your face to enable automatic AI attendance marking
        </p>
      </div>

      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        {registered ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-emerald-500 mb-2">Face Registered Successfully</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Your face has been securely registered in the system. You can now use AI attendance in your classes.
            </p>
            <button 
              onClick={() => { setRegistered(false); startCamera(); }}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-all"
            >
              Re-register Face
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                  <HiOutlineUserCircle className="w-16 h-16 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-sm">Camera is inactive</p>
                </div>
              )}

              {/* Face Guide Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 border-2 border-dashed border-violet-500 rounded-full opacity-50"></div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!cameraActive ? (
                <button 
                  onClick={startCamera}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/25"
                >
                  <HiOutlineCamera className="w-5 h-5" /> Start Camera
                </button>
              ) : (
                <>
                  <button 
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={captureAndRegister}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Capture & Register'}
                  </button>
                </>
              )}
            </div>
            
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
              <h4 className="font-semibold text-sm mb-1">Tips for good registration:</h4>
              <ul className="text-xs list-disc pl-5 space-y-1">
                <li>Ensure you are in a well-lit area</li>
                <li>Look directly at the camera</li>
                <li>Remove sunglasses or masks</li>
                <li>Keep your face within the guide</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceRegistration;
