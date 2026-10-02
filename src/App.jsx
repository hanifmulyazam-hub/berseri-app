import { AuthenticateWithRedirectCallback } from "@clerk/react";
import BerseriApp from "./BerseriApp";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  // Clerk mengembalikan Google OAuth ke endpoint ini.
  // Komponen ini menyelesaikan proses OAuth dan mengaktifkan session.
  if (window.location.pathname === "/sso-callback") {
    return <AuthenticateWithRedirectCallback />;
  }

  return (
    <AuthProvider>
      <BerseriApp />
    </AuthProvider>
  );
}