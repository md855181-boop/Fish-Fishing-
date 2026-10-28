import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Privacy Policy</h3>
              <p className="text-[11px] text-slate-400">Fish Fishing AdMob Utility • Updated 2026</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" /> 1. Overview & Purpose
            </h4>
            <p>
              The "Fish Fishing" application is a specialized developer and publisher utility tool designed to test, inspect, and verify Google AdMob SDK integrations, ad unit identifiers, impression delivery, and network parameters.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> 2. Information Handled
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>AdMob IDs:</strong> Account ID, APP ID, and Ad Unit IDs entered by the user are stored strictly on your local device (in localStorage) and are not transmitted to any external third-party database.</li>
              <li><strong>IP & Network Info:</strong> Diagnostic IP address and coarse geolocation indicators are used purely for local diagnostic verification of ad geotargeting.</li>
              <li><strong>Advertising Identifiers:</strong> In test mode, Google AdMob test IDs are used to avoid policy violations or invalid traffic flags.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-cyan-400" /> 3. Google AdMob Compliance
            </h4>
            <p>
              This utility adheres to Google AdMob and Google Play Developer Program policies. Simulated ad impressions are conducted under standardized test parameters to protect publisher accounts from invalid click or impression penalties.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">4. Data Deletion & Reset</h4>
            <p>
              You can instantly purge all locally cached identifiers and impression statistics at any time using the "Reset" button or by clearing your browser site data.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
