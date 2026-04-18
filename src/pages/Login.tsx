import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Scissors } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Nieprawidłowy email lub hasło");
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md border border-border bg-card p-10 space-y-6">
        <div className="text-center mb-4">
          <Scissors className="w-8 h-8 text-gold mx-auto mb-3" />
          <h1 className="font-display text-3xl">Panel właściciela</h1>
          <p className="text-muted-foreground text-sm mt-2">Zaloguj się, aby zarządzać wizytami</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logowanie...</> : "Zaloguj się"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
