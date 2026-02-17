import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, ClerkLoaded, ClerkLoading, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

// Redirect URLs for Clerk - ensure sign-in redirects back to our app
const signInFallbackRedirectUrl = `${window.location.origin}/`
const signUpFallbackRedirectUrl = `${window.location.origin}/`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
    >
      <ClerkLoading>
        <div className="flex min-h-screen bg-[#1a1612] items-center justify-center">
          <div className="text-[#c4b5a0] animate-pulse">Loading...</div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  </StrictMode>,
)
