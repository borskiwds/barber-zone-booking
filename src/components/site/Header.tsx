import { Scissors } from "lucide-react";
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
        <Link to="/admin" className="text-muted-foreground hover:text-gold transition-smooth text-xs">
          Panel
        </Link>
      </nav>
      <a href="#rezerwacja" className="md:hidden text-gold text-sm uppercase tracking-wider">Rezerwuj</a>
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
