import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">Pilotez votre flotte,<br />vos chantiers et<br /><em className="not-italic text-lime">votre facturation.</em></h1>
          <p className="mt-5 max-w-md text-[#bdc9c4]">Un seul espace pour les réservations, le stock, les chantiers et les encaissements de 3B Trading.</p>
        </div>
        <small className="text-[#71827b]">© {new Date().getFullYear()} 3B Trading</small>
      </section>
      <section className="grid place-items-center bg-[#fbfcfa] p-6">
        <form onSubmit={submit} className="grid w-full max-w-sm gap-5">
          <div className="lg:hidden"><Logo dark /></div>
          <div><h2 className="font-display text-3xl font-bold">Connexion</h2><p className="mt-1 text-sm text-muted">Accès réservé à l'équipe 3B Trading.</p></div>
          <Field label="Email"><Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Mot de passe"><Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {error && <p className="border border-[#f1c9c4] bg-[#fdf1ef] p-3 text-sm text-[#a2433b]">{error}</p>}
          <Button type="submit" size="lg" loading={loading}>Se connecter</Button>
          <Link to="/" className="text-center text-xs text-muted hover:text-ink">← Retour au site public</Link>
        </form>
      </section>
    </main>
  );
}
