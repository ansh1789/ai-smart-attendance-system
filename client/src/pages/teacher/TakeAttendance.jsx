import { useState, useEffect, useRef, useCallback } from 'react';
import { subjectAPI, attendanceAPI, aiAPI, studentAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineStopCircle, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCpuChip, HiOutlineUserPlus } from 'react-icons/hi2';

const TakeAttendance = () => {
  const { darkMode } = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [session, setSession] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [aiStatus, setAiStatus] = useState({ faceDetected: false, recognized: false, processing: false });
  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [recentRecognitions, setRecentRecognitions] = useState([]);
  const [markedStudents, setMarkedStudents] = useState(new Set());
  const [showManualModal, setShowManualModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subjectAPI.getAll().then(res => setSubjects(res.data.data)).catch(() => {});
    studentAPI.getAll().then(res => setStudents(res.data.data)).catch(() => {});
    return () => { stopCamera(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') toast.error('Camera permission denied. Please allow camera access.');
      else toast.error('Failed to access camera: ' + err.message);
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

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const recognizeFace = useCallback(async () => {
    if (aiStatus.processing || !session) return;
    const imageData = captureFrame();
    if (!imageData) return;

    setAiStatus(prev => ({ ...prev, processing: true }));
    try {
      const res = await aiAPI.recognizeFace({ imageData, sessionId: session._id });
      const result = res.data.data;

      if (result.faceDetected) {
        setAiStatus(prev => ({ ...prev, faceDetected: true }));
        if (result.recognized && result.student) {
          setAiStatus(prev => ({ ...prev, recognized: true }));
          setRecognizedStudent({ ...result.student, confidence: result.confidence });

          // Auto-mark attendance if not already marked
          if (!markedStudents.has(result.student._id)) {
            try {
              await attendanceAPI.mark({
                studentId: result.student._id,
                sessionId: session._id,
                status: 'present',
                recognitionConfidence: result.confidence,
                attendanceMethod: 'ai'
              });
              setMarkedStudents(prev => new Set([...prev, result.student._id]));
              setRecentRecognitions(prev => [{
                name: result.student.name,
                userId: result.student.userId,
                status: 'present',
                confidence: result.confidence,
                time: new Date().toLocaleTimeString()
              }, ...prev.slice(0, 19)]);
              toast.success(`${result.student.name} marked present!`);
            } catch (err) {
              if (err.response?.data?.message?.includes('already marked')) {
                // Already marked, just show recognition
              } else {
                toast.error('Failed to mark attendance');
              }
            }
          }
        } else {
          setAiStatus(prev => ({ ...prev, recognized: false }));
          setRecognizedStudent(null);
        }
      } else {
        setAiStatus(prev => ({ ...prev, faceDetected: false, recognized: false }));
        setRecognizedStudent(null);
      }
    } catch (err) {
      console.error('Recognition error:', err);
    } finally {
      setAiStatus(prev => ({ ...prev, processing: false }));
    }
  }, [session, markedStudents, captureFrame, aiStatus.processing]);

  const startAttendance = async () => {
    if (!selectedSubject) { toast.error('Please select a subject'); return; }
    setLoading(true);
    try {
      const res = await attendanceAPI.startSession({ subjectId: selectedSubject });
      setSession(res.data.data);
      await startCamera();
      // Start periodic face recognition
      intervalRef.current = setInterval(() => { recognizeFace(); }, 3000);
      toast.success('Attendance session started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally { setLoading(false); }
  };

  const stopAttendance = async () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    stopCamera();
    if (session) {
      try {
        await attendanceAPI.endSession(session._id);
        toast.success(`Session completed! ${markedStudents.size} students marked present.`);
      } catch { toast.error('Failed to end session'); }
    }
    setSession(null);
    setMarkedStudents(new Set());
    setRecognizedStudent(null);
    setAiStatus({ faceDetected: false, recognized: false, processing: false });
  };

  // Manual attendance
  const markManual = async (studentId) => {
    if (!session) return;
    try {
      const student = students.find(s => s._id === studentId);
      await attendanceAPI.mark({ studentId, sessionId: session._id, status: 'present', recognitionConfidence: 0, attendanceMethod: 'manual' });
      setMarkedStudents(prev => new Set([...prev, studentId]));
      setRecentRecognitions(prev => [{ name: student?.name || 'Unknown', userId: student?.userId, status: 'present', confidence: 0, time: new Date().toLocaleTimeString(), method: 'manual' }, ...prev]);
      toast.success(`${student?.name} marked present (manual)`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  // Update the recognition interval when recognizeFace changes
  useEffect(() => {
    if (session && cameraActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => { recognizeFace(); }, 3000);
    }
    return () => { if (intervalRef.current && !session) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [recognizeFace, session, cameraActive]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <HiOutlineCpuChip className="w-4 h-4" /> AI-Powered Attendance
        </div>
        <h1 className="text-3xl font-bold">AI Smart Attendance</h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Capture and recognize student faces automatically</p>
      </div>

      {!session ? (
        /* Subject Selection */
        <div className={`max-w-lg mx-auto rounded-2xl p-8 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Select Subject to Start</h3>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} border`}>
            <option value="">Choose a subject...</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName} (Sem {s.semester} Sec {s.section})</option>)}
          </select>
          <button onClick={startAttendance} disabled={!selectedSubject || loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <HiOutlineCamera className="w-5 h-5" />
            {loading ? 'Starting...' : 'Start Attendance Session'}
          </button>
        </div>
      ) : (
        /* Camera + Recognition Interface */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* AI overlay */}
                {aiStatus.processing && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-cyan-400">Scanning...</span>
                  </div>
                )}

                {/* Face detected indicator */}
                {aiStatus.faceDetected && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur rounded-lg border border-emerald-500/30">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Face Detected</span>
                  </div>
                )}

                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Camera initializing...</p>
                  </div>
                )}
              </div>

              {/* Session info bar */}
              <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div>
                  <p className="text-sm font-medium">{session.subject?.subjectName}</p>
                  <p className="text-xs text-gray-500">{session.subject?.subjectCode} | Students marked: {markedStudents.size}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowManualModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                    <HiOutlineUserPlus className="w-4 h-4" /> Manual
                  </button>
                  <button onClick={stopAttendance}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                    <HiOutlineStopCircle className="w-4 h-4" /> Stop Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* AI Status */}
            <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><HiOutlineCpuChip className="w-4 h-4 text-cyan-400" /> AI Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {aiStatus.faceDetected ? <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" /> : <HiOutlineXCircle className="w-4 h-4 text-gray-600" />}
                  <span className={`text-sm ${aiStatus.faceDetected ? 'text-emerald-400' : 'text-gray-500'}`}>Face Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  {aiStatus.recognized ? <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" /> : <HiOutlineXCircle className="w-4 h-4 text-gray-600" />}
                  <span className={`text-sm ${aiStatus.recognized ? 'text-emerald-400' : 'text-gray-500'}`}>Student Recognized</span>
                </div>
              </div>
            </div>

            {/* Recognized Student */}
            {recognizedStudent && (
              <div className={`rounded-2xl p-5 border-2 border-emerald-500/30 ${darkMode ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                <h3 className="font-semibold text-sm mb-3 text-emerald-400">✓ Recognized Student</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                    {recognizedStudent.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{recognizedStudent.name}</p>
                    <p className="text-xs text-gray-500">{recognizedStudent.userId}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <span className="text-sm font-bold text-emerald-400">{Math.round(recognizedStudent.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${recognizedStudent.confidence * 100}%` }} />
                </div>
              </div>
            )}

            {/* Recent Recognitions */}
            <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h3 className="font-semibold text-sm mb-3">Recent Recognitions</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentRecognitions.length === 0 ? (
                  <p className="text-xs text-gray-500">No students recognized yet. Stand in front of the camera.</p>
                ) : recentRecognitions.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${r.status === 'present' ? 'bg-emerald-600' : 'bg-gray-600'}`}>{r.name?.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-medium">{r.name}</p>
                        <p className="text-[10px] text-gray-500">{r.time}{r.method === 'manual' ? ' (manual)' : ''}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${r.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mark Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Manual Attendance</h2>
              <button onClick={() => setShowManualModal(false)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400">✕</button>
            </div>
            <div className="space-y-2">
              {students.filter(s => !markedStudents.has(s._id)).map(s => (
                <div key={s._id} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-500">{s.userId}</p></div>
                  <button onClick={() => { markManual(s._id); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">Mark Present</button>
                </div>
              ))}
              {students.filter(s => !markedStudents.has(s._id)).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">All students have been marked!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TakeAttendance;
