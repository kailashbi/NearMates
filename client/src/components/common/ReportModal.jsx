import React, { useState } from 'react';
import { api } from '../../services/api';
import { Flag, X, AlertCircle, CheckCircle2, Shield, Send } from 'lucide-react';

const REPORT_CATEGORIES = [
  { id: 'fake_profile', label: 'Fake Profile', desc: 'Impersonation, stolen identity, or bot account' },
  { id: 'harassment', label: 'Harassment', desc: 'Bullying, stalking, threats, or hate speech' },
  { id: 'spam', label: 'Spam Account', desc: 'Promoting products, unsolicited links, or crypto scams' },
  { id: 'inappropriate_photo', label: 'Inappropriate Profile Picture', desc: 'Explicit, offensive, or infringing imagery' },
  { id: 'suspicious_activity', label: 'Suspicious Activity', desc: 'Unsafe, fraudulent, paid fees, or deceptive meetup' },
  { id: 'abusive_message', label: 'Abusive Messages', desc: 'Vulgar language, inappropriate private chat messages' },
  { id: 'other', label: 'Other Violation', desc: 'Any other safety or community guideline issue' }
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType = 'user', // 'user' | 'activity' | 'message'
  targetId = null,
  targetName = '',
  defaultCategory = null
}) {
  const [category, setCategory] = useState(defaultCategory || (targetType === 'activity' ? 'suspicious_activity' : 'fake_profile'));
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a brief reason for this report.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        category,
        reason: reason.trim(),
        description: description.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        evidenceText: evidenceText.trim() || undefined
      };

      if (targetType === 'user') {
        payload.reportedProfileId = targetId;
      } else if (targetType === 'activity') {
        payload.activityId = targetId;
      } else if (targetType === 'message') {
        payload.reportedProfileId = targetId;
      }

      await api.post('/reports', payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setReason('');
        setDescription('');
        setEvidenceUrl('');
        setEvidenceText('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-card border border-slate-border max-w-lg w-full p-6 shadow-dropdown relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-navy rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-navy tracking-tight">
              Report {targetType === 'activity' ? 'Activity' : targetType === 'message' ? 'Message' : 'Member'}
            </h3>
            <p className="text-xs text-slate-500">
              {targetName ? `Reporting: ${targetName}` : 'Help us maintain a safe, welcoming community'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-btn text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-navy">Report Submitted</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for keeping NearMates safe. Our moderation team has received your report and will investigate promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Violation Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`text-left p-2.5 rounded-btn border text-xs transition-all ${
                      category === cat.id
                        ? 'border-primary bg-primary-light/50 font-bold text-primary shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Short Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Account using stolen photos / scam links in chat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Details & Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description & Context
              </label>
              <textarea
                rows={3}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, dates, what was said, or why this violates community safety..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Evidence Text / Quote */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Evidence Details or Chat Excerpt (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder="Paste message text, links, or specific quotes as evidence..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Evidence URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Evidence Screenshot / External Link (Optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://imgur.com/... or https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-btn text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Notice */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-btn border border-slate-100">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span>All reports are strictly confidential and investigated by our safety team.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy rounded-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-btn text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

