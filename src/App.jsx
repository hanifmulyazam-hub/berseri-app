import { AuthenticateWithRedirectCallback } from "@clerk/react";
import BerseriApp from "./BerseriApp";
import { AuthProvider } from "./context/AuthContext";
import { PrivacyPolicy } from "./features/legal/PrivacyPolicy";

export default function App() {
  // Clerk mengembalikan Google OAuth ke endpoint ini.
  // Komponen ini menyelesaikan proses OAuth dan mengaktifkan session.
  if (window.location.pathname === "/sso-callback") {
    return <AuthenticateWithRedirectCallback />;
  }

  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }

  return (
    <AuthProvider>
      <BerseriApp />
    </AuthProvider>
  );
}