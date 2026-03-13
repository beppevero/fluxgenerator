
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from "sonner";

const AuthContext = createContext({
  user: null as any,
  loading: true,
  login: async (_email: any, _password: any): Promise<any> => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // MODIFIED START
        toast("Benvenuto in Quoty!", {
          description: "Login effettuato con successo.",
          icon: (
            <svg
              width="32" height="32"
              viewBox="0 0 32 32"
              style={{ animation: 'satellite-bob 3s ease-in-out infinite' }}
            >
              <g fill="none" strokeWidth="1.5">
                <path stroke="#3B82F6" d="M10.7,19.5c-3.9-1.8-6.1-5.9-5.2-9.9C6.4,5.7,10,3,14.2,3c4.6,0,8.6,3.3,9.5,7.7c0.8,3.9-1.2,7.6-4.6,9.5" />
                <path stroke="#3B82F6" d="M12,18l-4,4l-2,2" />
                <path stroke="#3B82F6" d="M2,18h4" />
                <path stroke="#F97316" d="M23,10c2.8,0,5,2.2,5,5s-2.2,5-5,5" style={{ animation: 'radio-waves 1.5s infinite', animationDelay: '0s' }} />
                <path stroke="#F97316" d="M23,12c1.7,0,3,1.3,3,3s-1.3,3-3,3" style={{ animation: 'radio-waves 1.5s infinite', animationDelay: '0.2s' }} />
                <path stroke="#F97316" d="M23,14a1,1,0,0,1,0,2" style={{ animation: 'radio-waves 1.5s infinite', animationDelay: '0.4s' }} />
              </g>
            </svg>
          )
        });
        // MODIFIED END
      }
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
