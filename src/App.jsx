import BerseriApp from './BerseriApp';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BerseriApp />
    </AuthProvider>
  );
}
