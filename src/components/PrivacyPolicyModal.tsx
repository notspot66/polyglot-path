import React, { useState } from 'react';
import { X, Shield, Lock, Eye, Mic, Database, UserCheck, Mail, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      icon: <Eye className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="mb-2">
            When you register, log in, or practice on Lingoverse, we collect minimal information necessary to deliver personalized language education:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li><strong>Account Data:</strong> Email address, display name, and optional avatar image when you register via Email or Google Sign-In.</li>
            <li><strong>Learning Metrics:</strong> Lessons completed, XP earned, gems balance, streak counter, hearts, and milestone badges across your 500+ chosen languages.</li>
            <li><strong>Living World AI Context:</strong> Conversation history and learned vocabulary memory with interactive characters in the Living World to personalize ongoing storylines.</li>
            <li><strong>Device & Preferences:</strong> Dark/light mode theme selection, audio and pronunciation playback settings.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'voice',
      title: '2. Microphone & Audio Recognition Privacy',
      icon: <Mic className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="mb-2">
            Lingoverse features interactive speaking exercises and AI conversation practice. Here is how your audio data is protected:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li><strong>Ephemeral Voice Processing:</strong> Your microphone input is converted to text solely to grade your pronunciation and evaluate responses.</li>
            <li><strong>No Voice Biometric Profiling:</strong> We do not create biometric voiceprints or retain raw voice recordings on permanent surveillance storage.</li>
            <li><strong>Permission Control:</strong> You can deny microphone access at any time through your browser settings or use text typing mode as a complete alternative.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'usage',
      title: '3. How We Use Your Information',
      icon: <Sparkles className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="mb-2">We utilize your information strictly to support your learning journey:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li>Syncing your progress securely across all your devices via Google Firebase Firestore.</li>
            <li>Dynamically calibrating exercise difficulty (CEFR levels A1 through C2).</li>
            <li>Displaying friendly rankings in the Ruby League leaderboards.</li>
            <li>Preventing cheating and protecting our community from automated abuse.</li>
            <li><strong>Never Sold:</strong> We never sell, rent, or trade your personal data or contact details to third-party data brokers or advertisers.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'security',
      title: '4. Data Protection & Security',
      icon: <Lock className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="mb-2">
            Your data is safeguarded using industry standard physical and electronic security safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li><strong>Encrypted in Transit & at Rest:</strong> All web traffic is strictly encrypted over TLS 1.3 / HTTPS. Firestore documents use enterprise-grade AES-256 server-side encryption.</li>
            <li><strong>Attribute-Based Access Control (ABAC):</strong> Strict Firestore security rules ensure only you can view or modify your private profile data.</li>
            <li><strong>OAuth 2.0 Identity Standards:</strong> Google Sign-In authenticates directly through Google without Lingoverse ever viewing or storing your Google account password.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'children',
      title: '5. Student & Children’s Privacy',
      icon: <Shield className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="text-slate-600 text-sm">
            Lingoverse is built as a positive, educational language platform suitable for learners of all ages. We adhere to the Children's Online Privacy Protection Act (COPPA) and international educational privacy standards. We do not knowingly harvest personal marketing identifiers from young learners.
          </p>
        </>
      ),
    },
    {
      id: 'rights',
      title: '6. Your Rights & Data Portability',
      icon: <UserCheck className="w-5 h-5 text-teal-600" />,
      content: (
        <>
          <p className="mb-2 text-slate-600 text-sm">
            You retain complete control over your educational data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li><strong>Access & Export:</strong> View all your statistics, earned crowns, and vocabulary words at any time.</li>
            <li><strong>Rectification:</strong> Update your username, password, or current target language in seconds.</li>
            <li><strong>Right to Deletion:</strong> You can request account deletion, wiping your records from our Firestore cloud database.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'contact',
      title: '7. Contact & Inquiries',
      icon: <Mail className="w-5 h-5 text-teal-600" />,
      content: (
        <div className="text-slate-600 text-sm space-y-1">
          <p>If you have any questions, feedback, or data requests regarding this Privacy Policy, please reach out to our team:</p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
            <p className="font-bold text-slate-800">Lingoverse Privacy & Compliance Team</p>
            <p className="text-teal-700 font-medium">privacy@lingoverse.app</p>
            <p className="text-xs text-slate-500 mt-1">Last Updated: November 2026</p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((s) => {
    if (activeSection !== 'all' && s.id !== activeSection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => {
        sound.playClick();
        onClose();
      }}
    >
      <div
        className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Lingoverse Privacy Policy</h2>
              <p className="text-xs text-teal-100 font-semibold">Your privacy & data security are our top priority</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters / Quick navigation */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeSection === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveSection('voice')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeSection === 'voice'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Microphone & Audio
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeSection === 'security'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Security
            </button>
          </div>
          <input
            type="text"
            placeholder="Search policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500 w-36 sm:w-44 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm leading-relaxed">
          {filteredSections.map((sec) => (
            <div key={sec.id} className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                  {sec.icon}
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{sec.title}</h3>
              </div>
              <div className="pl-1 text-slate-600">{sec.content}</div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="font-bold text-sm">No matching privacy sections found.</p>
              <button
                onClick={() => {
                  setActiveSection('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-teal-600 font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            GDPR & COPPA Compliant Privacy Standards
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
