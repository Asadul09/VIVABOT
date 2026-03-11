import React, { useState, useRef, useEffect } from 'react';
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import Timer from './Timer.jsx';
import { motion, AnimatePresence } from 'motion/react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { BsArrowRight, BsChatDots, BsQuestionCircle } from 'react-icons/bs';
import axios from 'axios';
import { ServerURL } from '../App.jsx';

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState(true);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  /** ---------- Voice Setup ---------- **/
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); return; }

      const maleVoice = voices.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      );

      if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); return; }

      setSelectedVoice(voices[0]); setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => setMicPermission(true))
      .catch(() => setMicPermission(false));
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /** ---------- Speak Text ---------- **/
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) return resolve();
      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ...");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 1;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => { setIsAIPlaying(true); stopMic(); videoRef.current?.play().catch(console.error); };
      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        if (isMicOn && !isIntroPhase && !feedback) setTimeout(startMic, 300);
        setTimeout(() => { setSubtitle(""); resolve(); }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  /** ---------- Intro & Question Flow ---------- **/
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally and take your time. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 500));
        if (currentIndex === questions.length - 1) await speakText("Alright, this one might be a bit more challenging.");
        await speakText(currentQuestion.question);
        if (isMicOn) setTimeout(startMic, 500);
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  /** ---------- Timer ---------- **/
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); if (!isSubmitting && !feedback) submitAnswer(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, feedback]);

  useEffect(() => { if (!isIntroPhase && currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60); }, [currentIndex]);

  /** ---------- Mic Setup ---------- **/
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) { console.error("Browser does not support SpeechRecognition!"); return; }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e) => {
      console.error("Recognition error:", e);
      setIsRecording(false);
      if (e.error === 'not-allowed') { setMicPermission(false); setIsMicOn(false); }
    };
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      }
      if (finalTranscript) setAnswer(prev => (prev + ' ' + finalTranscript).trim());
    };

    recognitionRef.current = recognition;
    return () => { if (recognitionRef.current) { try { recognitionRef.current.stop(); recognitionRef.current.abort(); } catch {} } };
  }, []);

  const startMic = () => { if (!micPermission || isRecording || !recognitionRef.current) return; try { recognitionRef.current.start(); setIsRecording(true); } catch {} };
  const stopMic = () => { if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} } setIsRecording(false); };
  const toggleMic = () => { if (!micPermission) return alert('Please allow microphone access.'); if (isRecording) { stopMic(); setIsMicOn(false); } else { setIsMicOn(true); setTimeout(startMic, 200); } };

  /** ---------- Submit Answer ---------- **/
  const submitAnswer = async () => {
    if (isSubmitting || !answer.trim() || feedback) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(ServerURL + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: answer.trim(),
        timeTaken: currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true });

      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit answer.");
    } finally { setIsSubmitting(false); }
  };

  const handleNext = async () => {
    setAnswer(""); setFeedback("");
    if (currentIndex + 1 >= questions.length) { finishInterview(); return; }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
  };

  const finishInterview = async () => {
    stopMic(); setIsMicOn(false);
    try { const result = await axios.post(ServerURL + "/api/interview/finish", { interviewId }, { withCredentials: true }); onFinish(result.data); } 
    catch { alert("Failed to finish interview."); }
  };

  /** ---------- Auto Submit on Timer ---------- **/
  useEffect(() => { if (!isIntroPhase && currentQuestion && timeLeft === 0 && !isSubmitting && !feedback) submitAnswer(); }, [timeLeft]);

  /** ---------- Cleanup ---------- **/
  useEffect(() => { return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); recognitionRef.current.abort(); } catch {}; window.speechSynthesis.cancel(); }; }, []);

  /** ---------- Format Time ---------- **/
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2,'0')}`;

  /** ---------- Render ---------- **/
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4 sm:p-6'>
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-7xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'
      >
        {/* Left Panel */}
        <div className='w-full lg:w-[35%] bg-gray-50 flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <motion.div className='w-full max-w-md rounded-2xl overflow-hidden shadow-lg bg-black/5 relative group'>
            <video src={videoSource} key={videoSource} ref={videoRef} muted playsInline preload='auto' className='w-full h-auto object-cover rounded-2xl' />
            <AnimatePresence>
              {isAIPlaying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 flex items-end justify-center pb-4 rounded-2xl">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <span className="text-emerald-600 font-medium flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      AI is speaking...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {subtitle && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='w-full max-w-md bg-white/90 backdrop-blur-md border border-emerald-100 rounded-xl p-4 shadow-md'>
                <div className="flex items-start gap-2">
                  <BsChatDots className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                  <p className='text-gray-700 text-sm leading-relaxed'>{subtitle}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Timer Panel */}
          <motion.div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4'>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs font-medium text-gray-600">{isSubmitting ? 'Processing...' : 'Connected'}</span>
              </div>
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-medium text-red-500">Recording</span>
                </div>
              )}
            </div>
            <div className="h-px bg-gray-200/50" />
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">Time Remaining</span>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
              <span className="text-xs text-gray-400 mt-2">{formatTime(timeLeft)} / {formatTime(currentQuestion?.timeLimit || 60)}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className='flex-1 flex flex-col p-6 lg:p-8 bg-white'>
          <motion.div className="flex items-center justify-between mb-6">
            <div>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>AI Interview Session</h2>
              <p className="text-sm text-gray-500 mt-1">Speak naturally, take your time</p>
            </div>
          </motion.div>

          {!isIntroPhase && (
            <motion.div className='mb-6 p-6 rounded-2xl border border-gray-200 shadow-sm bg-gray-50 relative'>
              <div className="absolute -right-4 -top-4 text-5xl text-gray-200"><BsQuestionCircle /></div>
              <p className='text-xs text-emerald-600 font-medium mb-2 flex items-center gap-2'>
                <span className="bg-emerald-100 px-2 py-0.5 rounded-full">Question {currentIndex + 1} of {questions.length}</span>
              </p>
              <p className='text-base sm:text-lg font-medium text-gray-800 leading-relaxed'>{currentQuestion?.question}</p>
            </motion.div>
          )}

          <motion.div className="flex-1 relative mb-6">
            <textarea
              placeholder={isIntroPhase ? "Getting ready..." : "Your answer will appear here as you speak. You can also type..."}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isIntroPhase || !!feedback}
              className='w-full h-full min-h-[200px] sm:min-h-[250px] bg-gray-50 p-4 rounded-2xl resize-none outline-none border-2 border-gray-200 focus:border-emerald-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div className="flex items-center gap-4">
                <motion.button onClick={toggleMic} className={`relative w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${isRecording ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                  {isRecording ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                </motion.button>
                <motion.button onClick={submitAnswer} className={`flex-1 py-3 rounded-2xl font-semibold shadow-lg ${answer.trim() && !isSubmitting ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                  {isSubmitting ? <><FaSpinner className="animate-spin mr-2" /> Submitting...</> : <>Submit Answer <BsArrowRight className="ml-2 text-sm" /></>}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div className="bg-white border border-emerald-200 p-6 rounded-2xl shadow-md">
                <div className="flex items-center gap-2 mb-3"><FaCheckCircle className="text-emerald-600" size={20} /><h3 className="font-semibold text-emerald-800">AI Feedback</h3></div>
                <p className="text-gray-700 mb-5 leading-relaxed">{feedback}</p>
                <button onClick={handleNext} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md">Next Question</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default Step2Interview;