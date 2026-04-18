import { Scissors, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => (
  <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
    <div className="container-x flex items-center justify-between h-16">
      <a href="#hero" className="flex items-center gap-2">
        <Scissors className="w-5 h-5 text-gold" />
        <span className="font-display text-xl tracking-wider">BARBER ZONE</span>
      </a>
      <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider">
        <a href="#o-nas" className="hover:text-gold transition-smooth">O nas</a>
        <a href="#oferta" className="hover:text-gold transition-smooth">Oferta</a>
        <a href="#rezerwacja" className="hover:text-gold transition-smooth">Rezerwacja</a>
        <a href="#kontakt" className="hover:text-gold transition-smooth">Kontakt</a>
      </nav>
      <div className="flex items-center gap-3">
        <a href="#rezerwacja" className="md:hidden text-gold text-sm uppercase tracking-wider">Rezerwuj</a>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 border border-gold/40 text-gold hover:bg-gold hover:text-background transition-smooth px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
          Panel
        </Link>
      </div>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="border-t border-border py-10 bg-background">
    <div className="container-x text-center text-muted-foreground text-sm">
      <p className="font-display text-2xl text-gold tracking-wider mb-2">BARBER ZONE RYBNIK</p>
      <p>© {new Date().getFullYear()} Wszystkie prawa zastrzeżone.</p>
    </div>
  </footer>
);
