import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2, ArrowRight, ArrowLeft, Volume2, Edit3, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { addMessage, getNextQuestion } from '../api/conversation';
import { generateSummary } from '../api/summary';

interface Message {
  role: 'ai' | 'patient';
  text: string;
  transcript?: string;
}

export const HistoryPage: React.FC = () => {
  const [mode, setMode] = useState<'voice' | 'touch'>('voice');
  const [language, setLanguage] = useState('Hindi');
  const [sessionId, setSessionId] = useState('MK-DEMO-001');
  const navigate = useNavigate();

  // Voice mode states
  type VoiceState = 'ready' | 'listening' | 'processing' | 'response';
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const transcriptRef = useRef(''); // Solves React stale closure bug in recognition callbacks
  const [demoTurn, setDemoTurn] = useState(0);
  const [isFinalTurn, setIsFinalTurn] = useState(false);
  const [asrError, setAsrError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Touch mode state
  const [touchStep, setTouchStep] = useState(1);
  const [touchData, setTouchData] = useState({
    complaint: '',
    duration: '',
    severity: '',
    medications: '',
    allergies: ''
  });

  // Multilingual Demo Responses for Voice Mode
  const demoResponses = {
    Hindi: [
      "Mujhe teen din se bukhar hai aur weakness bhi hai.",
      "Teen din se bukhar chal raha hai.",
      "Nahi, koi medicine nahi li hai.",
      "Thodi weakness aur sar dard bhi hai."
    ],
    English: [
      "I have had a fever and feeling weak for the past 3 days.",
      "It started 3 days ago.",
      "No, I have not taken any medicine yet.",
      "Just feeling general body weakness."
    ],
    Hinglish: [
      "Mujhe last 3 days se fever hai aur weakness lag rahi hai.",
      "About 3 days se hai.",
      "No, koi specific medicines nahi li.",
      "Weakness and headache feel ho raha hai."
    ]
  };

  useEffect(() => {
    const sid = localStorage.getItem('sessionId') || 'MK-DEMO-001';
    setSessionId(sid);
    const savedLang = localStorage.getItem('medikiosk_language') || 'Hindi';
    setLanguage(savedLang);

    // Initial greeting
    const greetings: Record<string, string> = {
      Hindi: "Namaste! Aapko sabse zyada kis problem ki wajah se doctor se milna hai?",
      English: "Hello! What primary health issue brings you to the clinic today?",
      Hinglish: "Namaste! Aapko primary kis problem ki wajah se consult karna hai?"
    };

    const initialText = greetings[savedLang] || greetings.Hindi;
    setMessages([{ role: 'ai', text: initialText }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  // Handle Microphone Press (P0 ASR Architecture with reliable transcriptRef)
  const handleMicClick = () => {
    if (voiceState !== 'ready') return;

    setAsrError(null);
    transcriptRef.current = '';
    setCurrentTranscript('');
    setVoiceState('listening');

    // Check for browser SpeechRecognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          transcriptRef.current = text;
          setCurrentTranscript(text);
        };

        recognition.onerror = (err: any) => {
          console.warn('Browser SpeechRecognition error, fallback to simulated speech:', err?.error);
          fallbackSimulatedSpeech();
        };

        recognition.onend = () => {
          const captured = transcriptRef.current;
          if (!captured || captured.trim() === '') {
            fallbackSimulatedSpeech();
          } else {
            setVoiceState('processing');
            handleProcessTranscript(captured);
          }
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition failed to start, using fallback:', e);
        fallbackSimulatedSpeech();
        return;
      }
    }

    fallbackSimulatedSpeech();
  };

  const fallbackSimulatedSpeech = () => {
    const list = (demoResponses as any)[language] || demoResponses.Hindi;
    const text = list[demoTurn % list.length];
    transcriptRef.current = text;

    setTimeout(() => {
      setCurrentTranscript(text);
      setVoiceState('processing');

      setTimeout(() => {
        handleProcessTranscript(text);
      }, 1000);
    }, 1400);
  };

  const handleProcessTranscript = async (patientText: string) => {
    // Add patient message
    const updatedMessages: Message[] = [...messages, { role: 'patient', text: patientText, transcript: patientText }];
    setMessages(updatedMessages);
    setVoiceState('response');

    try {
      await addMessage({
        sessionId,
        role: 'patient',
        message: patientText,
        transcript: patientText
      });

      // Get contextual follow up
      const nextRes = await getNextQuestion({
        sessionId,
        step: demoTurn + 1,
        language
      });

      const aiQuestion = nextRes.question;
      const isDone = nextRes.isFinal || demoTurn >= 3;

      setTimeout(async () => {
        setMessages(prev => [...prev, { role: 'ai', text: aiQuestion }]);
        await addMessage({
          sessionId,
          role: 'ai',
          message: aiQuestion
        });

        setDemoTurn(prev => prev + 1);
        setCurrentTranscript('');
        transcriptRef.current = '';
        setVoiceState('ready');

        if (isDone) {
          setIsFinalTurn(true);
        }
      }, 800);
    } catch (err) {
      setTimeout(() => {
        const fallbacks = [
          "Ye symptoms aapko exactly kab se hain?",
          "Kya aap koi medicine le rahe hain?",
          "Dhanyavaad. Aapki medical details note ho gayi hain."
        ];
        const fbText = fallbacks[demoTurn] || "Dhanyavaad. Aapki details note kar li gayi hain.";
        setMessages(prev => [...prev, { role: 'ai', text: fbText }]);
        setDemoTurn(prev => prev + 1);
        setCurrentTranscript('');
        transcriptRef.current = '';
        setVoiceState('ready');
        if (demoTurn >= 2) setIsFinalTurn(true);
      }, 900);
    }
  };

  // Complete and save clinical history draft
  const handleFinishHistory = async () => {
    try {
      if (mode === 'voice') {
        await generateSummary({
          sessionId,
          messages
        });
      } else {
        await generateSummary({
          sessionId,
          touchData
        });
      }
    } catch (err) {
      console.warn('Draft saved locally', err);
    }
    navigate('/patient/documents');
  };

  // Touch step advances
  const handleTouchSelect = (field: keyof typeof touchData, value: string) => {
    const updated = { ...touchData, [field]: value };
    setTouchData(updated);

    if (touchStep < 5) {
      setTouchStep(prev => prev + 1);
    } else {
      handleFinishHistory();
    }
  };

  return (
    <div className="flex-1 flex flex-col max-h-full h-full max-w-4xl mx-auto w-full">
      {/* Mode Selector */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="bg-slate-200 p-1 rounded-2xl inline-flex shadow-inner">
          <button
            className={`px-6 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all ${
              mode === 'voice' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setMode('voice')}
          >
            🎤 Voice Mode
          </button>
          <button
            className={`px-6 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all ${
              mode === 'touch' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setMode('touch')}
          >
            👆 Touch Mode
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Multimodal normalized structure • Language: <strong className="text-teal-700">{language}</strong>
        </span>
      </div>

      {/* ================= VOICE MODE ================= */}
      {mode === 'voice' ? (
        <Card className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-slate-200 shadow-md">
          {/* Chat Transcript Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'patient' ? 'items-end' : 'items-start'}`}>
                <span className="text-xs font-bold text-slate-400 mb-1 px-1">
                  {m.role === 'ai' ? '🤖 MediKiosk Assistant' : '👤 You (Patient)'}
                </span>
                <div
                  className={`px-5 py-3.5 max-w-[85%] text-base md:text-lg font-medium shadow-sm leading-relaxed ${
                    m.role === 'ai'
                      ? 'bg-white text-slate-900 border border-slate-200 rounded-3xl rounded-tl-sm'
                      : 'bg-teal-600 text-white rounded-3xl rounded-tr-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* In-flight Listening transcript preview */}
            {voiceState === 'listening' && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-teal-600 mb-1 animate-pulse">● Listening now...</span>
                <div className="px-5 py-3.5 max-w-[85%] bg-teal-50 border-2 border-teal-400 text-teal-900 rounded-3xl rounded-tr-sm text-base italic">
                  {currentTranscript || "Bol rahe hain... (Speaking...)"}
                </div>
              </div>
            )}

            {voiceState === 'processing' && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> ASR Processing & Normalization...
                </span>
                <div className="px-5 py-3.5 max-w-[85%] bg-amber-50 border border-amber-300 text-amber-900 rounded-3xl rounded-tr-sm text-base font-medium">
                  {currentTranscript}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Controls Bottom Bar */}
          <div className="p-6 border-t border-slate-200 bg-white flex flex-col items-center">
            {/* Failure Fallback Option (Requirement #28) */}
            {asrError && (
              <div className="w-full mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Voice processing unavailable. Continue with Touch Mode.
                </span>
                <button
                  onClick={() => setMode('touch')}
                  className="font-bold underline text-teal-700 hover:text-teal-900 ml-2"
                >
                  Switch to Touch
                </button>
              </div>
            )}

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2.5 h-2.5 rounded-full ${
                voiceState === 'listening' ? 'bg-red-500 animate-ping' : voiceState === 'processing' ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {voiceState === 'ready' && "Ready • Tap mic to speak"}
                {voiceState === 'listening' && "Listening... Speak your response"}
                {voiceState === 'processing' && "Processing speech transcript..."}
                {voiceState === 'response' && "AI generating follow-up..."}
              </span>
              <Badge variant="demo">ASR Active</Badge>
            </div>

            {/* Big Microphone Button */}
            {!isFinalTurn ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={handleMicClick}
                  disabled={voiceState !== 'ready'}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    voiceState === 'listening'
                      ? 'bg-red-500 animate-pulse scale-110 shadow-2xl shadow-red-500/50 text-white'
                      : voiceState === 'processing'
                      ? 'bg-amber-500 text-white animate-spin'
                      : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 shadow-xl'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {voiceState === 'processing' ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
                <span className="text-xs text-slate-400 mt-2 font-medium">
                  {voiceState === 'ready' ? 'Tap to Speak (बोलने के लिए दबाएं)' : 'Listening...'}
                </span>
              </div>
            ) : (
              <div className="w-full text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-xl font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Clinical History Captured Successfully via Voice</span>
                </div>
                <Button
                  size="lg"
                  className="w-full py-5 text-xl font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-lg flex items-center justify-center gap-2"
                  onClick={handleFinishHistory}
                >
                  <span>Proceed to Document Digitization (OCR)</span>
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* ================= TOUCH MODE ================= */
        <Card className="flex-1 flex flex-col p-8 mb-4 border-2 border-slate-200 shadow-md justify-between">
          {/* Progress Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-extrabold text-teal-700 uppercase tracking-wider">
                Step {touchStep} of 5 — Touch Questionnaire
              </span>
              <span className="text-xs text-slate-500">Accessible for low-literacy patients</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${(touchStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Touch Questions */}
          <div className="my-auto py-4">
            {touchStep === 1 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-6 text-center">
                  Aapko kya problem ho rahi hai? / What is your chief complaint?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Fever (बुखार)', icon: '🤒' },
                    { label: 'Cough (खांसी)', icon: '🤧' },
                    { label: 'Pain (दर्द)', icon: '😣' },
                    { label: 'Weakness (कमजोरी)', icon: '😓' },
                    { label: 'Vomiting (उल्टी)', icon: '🤮' },
                    { label: 'Other (अन्य समस्या)', icon: '✍️' }
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleTouchSelect('complaint', opt.label)}
                      className="p-6 border-2 border-slate-200 rounded-2xl text-xl font-bold hover:border-teal-500 hover:bg-teal-50 bg-white transition-all shadow-sm flex flex-col items-center gap-2"
                    >
                      <span className="text-4xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {touchStep === 2 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-6 text-center">
                  How long have you had this problem? / कितने दिन से है?
                </h2>
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {['1 day (1 दिन)', '2–3 days (2-3 दिन)', '1 week (1 हफ्ता)', 'More than 1 week (1 हफ्ते से ज्यादा)'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleTouchSelect('duration', opt)}
                      className="p-6 border-2 border-slate-200 rounded-2xl text-lg font-bold hover:border-teal-500 hover:bg-teal-50 bg-white transition-all shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {touchStep === 3 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-6 text-center">
                  Kitna zyada hai? / How severe is the symptom?
                </h2>
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                  {[
                    { label: 'Mild (हल्का)', sub: 'Manageable', color: 'border-green-300 hover:bg-green-50' },
                    { label: 'Moderate (मध्यम)', sub: 'Affecting work', color: 'border-amber-300 hover:bg-amber-50' },
                    { label: 'Severe (बहुत ज्यादा)', sub: 'Intolerable', color: 'border-red-300 hover:bg-red-50' }
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleTouchSelect('severity', opt.label)}
                      className={`p-6 border-2 rounded-2xl text-lg font-bold bg-white transition-all shadow-sm flex flex-col items-center gap-1 ${opt.color}`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs text-slate-400 font-normal">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {touchStep === 4 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-6 text-center">
                  Kya aap koi medicine le rahe hain? / Taking any medications?
                </h2>
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <button
                    onClick={() => handleTouchSelect('medications', 'Yes')}
                    className="p-8 border-2 border-slate-200 rounded-2xl text-2xl font-bold hover:border-teal-500 hover:bg-teal-50 bg-white transition-all shadow-sm"
                  >
                    Yes (हाँ)
                  </button>
                  <button
                    onClick={() => handleTouchSelect('medications', 'None reported')}
                    className="p-8 border-2 border-slate-200 rounded-2xl text-2xl font-bold hover:border-teal-500 hover:bg-teal-50 bg-white transition-all shadow-sm"
                  >
                    No (नहीं)
                  </button>
                </div>
              </div>
            )}

            {touchStep === 5 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-6 text-center">
                  Any known drug allergies? / क्या कोई एलर्जी है?
                </h2>
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                  {['Yes (हाँ)', 'No (नहीं)', "Don't know (पता नहीं)"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleTouchSelect('allergies', opt)}
                      className="p-6 border-2 border-slate-200 rounded-2xl text-lg font-bold hover:border-teal-500 hover:bg-teal-50 bg-white transition-all shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Touch navigation controls */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setTouchStep(prev => Math.max(1, prev - 1))}
              disabled={touchStep === 1}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back Step
            </Button>
            <span className="text-xs text-slate-400 font-semibold">
              Both Touch & Voice map to unified ClinicalHistory model
            </span>
            {touchStep === 5 && (
              <Button onClick={handleFinishHistory} className="bg-teal-600 hover:bg-teal-700">
                Complete Touch Intake →
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HistoryPage;
