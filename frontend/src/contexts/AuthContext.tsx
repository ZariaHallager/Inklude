// Re-export from the new hook for backward compatibility
export { useAuth } from '../hooks/useCurrentUser';

// Legacy AuthProvider - no longer needed since Clerk handles auth
// Kept as a pass-through for components that might import it
import type { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Clerk and Convex providers are now in main.tsx
  // This is just a pass-through for backward compatibility
  return <>{children}</>;
}
