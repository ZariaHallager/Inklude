import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect } from 'react';

export interface CurrentUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: 'user' | 'admin' | 'super_admin';
}

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  // Sync user mutation
  const syncUser = useMutation(api.auth.syncClerkUser);

  // Query current user from Convex
  const convexUser = useQuery(
    api.auth.getCurrentUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  // Sync Clerk user to Convex on sign in
  useEffect(() => {
    if (clerkLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (email) {
        syncUser({
          clerkId: clerkUser.id,
          email,
          name: clerkUser.fullName || undefined,
          picture: clerkUser.imageUrl || undefined,
        }).catch(console.error);
      }
    }
  }, [clerkLoaded, isSignedIn, clerkUser, syncUser]);

  // Build the user object
  const user: CurrentUser | null = convexUser ? {
    id: convexUser._id,
    clerkId: convexUser.clerkId,
    email: convexUser.email,
    name: convexUser.name || null,
    picture: convexUser.picture || null,
    role: convexUser.role,
  } : null;

  // Only wait for Clerk to load - don't block on Convex user sync.
  // This prevents being stuck on "Loading..." if Convex is slow or the sync
  // hasn't completed yet. We use clerkUser as fallback until convexUser arrives.
  const loading = !clerkLoaded;

  return {
    user,
    loading,
    isSignedIn: isSignedIn ?? false,
    signOut,
    clerkUser,
  };
}

// Legacy compatibility hook - maps to old useAuth interface
export function useAuth() {
  const { user, loading, isSignedIn, signOut, clerkUser } = useCurrentUser();

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      display_name: user.name || user.email,
      role: user.role,
      avatar_url: user.picture,
      identity_id: null,
    } : null,
    loading,
    login: () => {
      // Redirect to sign-in page
      window.location.href = '/login';
    },
    logout: () => {
      signOut();
    },
  };
}
