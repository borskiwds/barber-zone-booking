import heroImg from "@/assets/hero-barbershop.jpg";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Wnętrze barber shopu Barber Zone Rybnik"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="container-x relative z-10 py-32 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <Scissors className="w-5 h-5 text-gold" />
          <span className="text-gold tracking-[0.3em] text-xs uppercase">Rybnik · Est. 2020</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] max-w-4xl">
          Barber Zone Rybnik
          <span className="block text-gold mt-2">profesjonalny barber dla wymagających</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Zarezerwuj wizytę online w 30 sekund i zadbaj o swój wygląd.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" variant="gold" asChild>
            <a href="#rezerwacja">Umów wizytę</a>
          </Button>
          <Button size="lg" variant="outlineGold" asChild>
            <a href="#oferta">Zobacz cennik</a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground text-xs tracking-[0.3em] uppercase animate-fade-in">
        Przewiń ↓
      </div>
    </section>
  );
};
