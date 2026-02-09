import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Chrome, Sparkles, Shield, MessageCircleHeart } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-accent">Ink</span>
              <span className="text-text">lude</span>
            </h1>
            <p className="text-text-muted text-sm mt-2 font-medium">
              AI-powered inclusive language intelligence
            </p>
          </div>

          {/* Description */}
          <div className="bg-surface-2 rounded-xl p-5 mb-8 border border-border/50">
            <div className="space-y-3 text-sm text-text-muted leading-relaxed">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-accent mt-0.5 shrink-0" />
                <p>
                  Analyze any text for gendered language, misgendering, and
                  non-inclusive phrasing with advanced NLP.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircleHeart size={16} className="text-accent mt-0.5 shrink-0" />
                <p>
                  Store pronoun preferences and identity profiles so your
                  organization always gets it right.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-accent mt-0.5 shrink-0" />
                <p>
                  Get contextual, tone-aware suggestions — gentle, direct, or
                  research-backed — to make every message welcoming.
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98] cursor-pointer"
          >
            <Chrome size={20} />
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="my-6 border-t border-border" />

          {/* Footer */}
          <p className="text-center text-xs text-text-muted">
            Powered by <span className="text-accent/80 font-medium">NLP</span>
          </p>
        </div>
      </div>
    </div>
  );
}
