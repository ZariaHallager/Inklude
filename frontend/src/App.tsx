import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import IdentitiesPage from './pages/IdentitiesPage';
import MyProfilePage from './pages/MyProfilePage';
import NeoPronounsPage from './pages/NeoPronounsPage';
import TemplatesPage from './pages/TemplatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPoliciesPage from './pages/AdminPoliciesPage';
import AdminCustomPronounsPage from './pages/AdminCustomPronounsPage';

// Sign Up Page wrapper
function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40",
              headerTitle: "text-text font-display",
              headerSubtitle: "text-text-muted",
              socialButtonsBlockButton: "bg-accent hover:bg-accent-light text-white font-semibold rounded-xl border-0",
              formFieldInput: "bg-surface-2 border-border text-text rounded-xl focus:ring-accent",
              formButtonPrimary: "bg-accent hover:bg-accent-light rounded-xl",
              footerActionLink: "text-accent hover:text-accent-light",
            }
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />

        {/* Authenticated layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/identities" element={<IdentitiesPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/neo-pronouns" element={<NeoPronounsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/policies" element={<AdminPoliciesPage />} />
          <Route path="/admin/custom-pronouns" element={<AdminCustomPronounsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
