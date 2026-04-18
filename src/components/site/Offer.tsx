import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_pln: number;
  duration_min: number;
}

export const Offer = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setServices(data as Service[]);
    });
  }, []);

  return (
    <section id="oferta" className="py-24 md:py-32 bg-background">
      <div className="container-x">
        <div className="text-center mb-16">
          <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">Cennik</p>
          <h2 className="font-display text-4xl md:text-6xl mb-6">Nasza oferta</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((s) => (
            <div
              key={s.id}
              className="group border border-border bg-card p-8 transition-smooth hover:border-gold hover:-translate-y-1"
            >
              <div className="flex items-baseline justify-between mb-3 gap-4">
                <h3 className="font-display text-2xl md:text-3xl">{s.name}</h3>
                <span className="font-display text-3xl text-gold whitespace-nowrap">{s.price_pln} zł</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-4 uppercase tracking-wider">
                Czas: ~{s.duration_min} min
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="gold" size="lg" asChild>
            <a href="#rezerwacja">Umów wizytę</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
