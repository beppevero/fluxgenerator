
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { SatelliteAnimation } from '../components/ui/SatelliteAnimation';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'La password è obbligatoria' }),
});

// Lista di nomi femminili comuni in azienda
const femaleNames = ['addolorata', 'giulia', 'antonella', 'roberta', 'cinzia', 'angelica', 'anna'];

const LoginPage = () => {
  const { user, loading, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const getWelcomeMessage = (name: string) => {
    const lowerCaseName = name.toLowerCase();
    if (femaleNames.includes(lowerCaseName)) {
      return `Benvenuta, ${name.charAt(0).toUpperCase() + name.slice(1)}!`;
    } else if (name.toLowerCase().endsWith('a')) {
        return `Benvenuta, ${name.charAt(0).toUpperCase() + name.slice(1)}!`;
    }
    return `Benvenuto, ${name.charAt(0).toUpperCase() + name.slice(1)}!`;
  };

  const onSubmit = async (values) => {
    setAuthError(null);
    try {
      await login(values.email, values.password);
      const firstName = values.email.split('.')[0];
      const welcomeMessage = getWelcomeMessage(firstName);
      toast({
        description: (
          <div className="flex items-center gap-2">
            <SatelliteAnimation />
            <span className="text-white">{welcomeMessage}</span>
          </div>
        ),
        className: "bg-slate-900 border-transparent",
      });
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Credenziali non valide. Riprova.');
      } else {
        setAuthError('Si è verificato un errore imprevisto.');
      }
    }
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <AnimatedBackground />
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white/10 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">QUOTY</h1>
          <p className="text-gray-400">Accedi per generare i tuoi preventivi</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mario.rossi@macnil.it"
                      {...field}
                      className="bg-transparent text-white border-gray-600 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        className="bg-transparent text-white border-gray-600 focus:ring-sky-500 focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button type="submit" className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 rounded-md" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
        </Form>
        <div className="flex justify-between text-sm text-gray-400">
          <a
            href={`mailto:admin@quoty.it?subject=Recupero Password Quoty - ${form.getValues('email')}`}
            className="hover:text-white"
          >
            Hai dimenticato la password?
          </a>
          <a
            href="mailto:admin@quoty.it?subject=Richiesta Accesso Quoty"
            className="hover:text-white"
          >
            Richiedi accesso
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
