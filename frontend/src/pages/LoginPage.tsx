import { SignIn, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Sparkles, Shield, MessageCircleHeart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <motion.div
          className="text-text-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Card */}
        <motion.div
          className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/40"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-8 h-8 text-accent fill-accent/20" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight font-display">
              <span className="bg-gradient-to-r from-accent via-secondary to-tertiary bg-clip-text text-transparent">
                Inklude
              </span>
            </h1>
            <p className="text-text-muted text-sm mt-2 font-medium">
              AI-powered inclusive language intelligence
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            className="bg-surface-2/50 backdrop-blur rounded-2xl p-5 mb-8 border border-border/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="space-y-3 text-sm text-text-muted leading-relaxed">
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles size={16} className="text-accent mt-0.5 shrink-0" />
                <p>
                  Analyze any text for gendered language, misgendering, and
                  non-inclusive phrasing with advanced AI.
                </p>
              </motion.div>
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircleHeart size={16} className="text-secondary mt-0.5 shrink-0" />
                <p>
                  Store pronoun preferences and identity profiles so your
                  organization always gets it right.
                </p>
              </motion.div>
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Shield size={16} className="text-tertiary mt-0.5 shrink-0" />
                <p>
                  Get contextual, tone-aware suggestions — gentle, direct, or
                  research-backed — to make every message welcoming.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Clerk Sign In */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-center"
          >
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-accent hover:bg-accent-light text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 border-0",
                  socialButtonsBlockButtonText: "font-semibold",
                  dividerLine: "bg-border",
                  dividerText: "text-text-muted",
                  formFieldInput: "bg-surface-2 border-border text-text rounded-xl focus:ring-accent focus:border-accent",
                  formButtonPrimary: "bg-accent hover:bg-accent-light rounded-xl",
                  footerActionLink: "text-accent hover:text-accent-light",
                  identityPreviewEditButton: "text-accent",
                  formFieldLabel: "text-text-muted",
                  footer: "hidden",
                }
              }}
              routing="path"
              path="/login"
              signUpUrl="/signup"
              afterSignInUrl="/"
            />
          </motion.div>

          {/* Divider */}
          <motion.div
            className="my-6 border-t border-border/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          />

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Powered by <span className="text-accent/80 font-medium">Gemini AI</span> & <span className="text-secondary/80 font-medium">Convex</span>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
