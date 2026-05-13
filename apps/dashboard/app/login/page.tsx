import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-2">AniMood</h1>
        <p className="text-muted mb-8 text-sm">Review dashboard — sign in to continue.</p>
        <LoginForm />
      </div>
    </main>
  );
}
