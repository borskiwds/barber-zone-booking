import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";

const hours = [
  ["Poniedziałek – Piątek", "10:00 – 20:00"],
  ["Sobota", "9:00 – 15:00"],
  ["Niedziela", "Zamknięte"],
];

export const Contact = () => (
  <section id="kontakt" className="py-24 md:py-32 bg-background">
    <div className="container-x">
      <div className="text-center mb-16">
        <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">Kontakt</p>
        <h2 className="font-display text-4xl md:text-6xl mb-6">Odwiedź nas</h2>
        <div className="gold-divider" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="border border-border bg-card p-8 space-y-6">
          <h3 className="font-display text-2xl text-gold">Dane kontaktowe</h3>

          <a href="https://maps.google.com/?q=Kościuszki+12+Rybnik" target="_blank" rel="noreferrer" className="flex items-start gap-4 group">
            <MapPin className="w-5 h-5 text-gold mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Adres</p>
              <p className="group-hover:text-gold transition-smooth">ul. Kościuszki 12, 44-200 Rybnik</p>
            </div>
          </a>

          <a href="tel:531245678" className="flex items-start gap-4 group">
            <Phone className="w-5 h-5 text-gold mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Telefon</p>
              <p className="group-hover:text-gold transition-smooth">531 245 678</p>
            </div>
          </a>

          <a href="mailto:kontakt@barberzone.pl" className="flex items-start gap-4 group">
            <Mail className="w-5 h-5 text-gold mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="group-hover:text-gold transition-smooth">kontakt@barberzone.pl</p>
            </div>
          </a>

          <a href="https://instagram.com/barberzone_rybnik" target="_blank" rel="noreferrer" className="flex items-start gap-4 group">
            <Instagram className="w-5 h-5 text-gold mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Instagram</p>
              <p className="group-hover:text-gold transition-smooth">@barberzone_rybnik</p>
            </div>
          </a>
        </div>

        <div className="border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-gold" />
            <h3 className="font-display text-2xl text-gold">Godziny otwarcia</h3>
          </div>
          <ul className="space-y-4">
            {hours.map(([day, time]) => (
              <li key={day} className="flex justify-between items-baseline border-b border-border pb-3">
                <span className="text-foreground">{day}</span>
                <span className="text-muted-foreground tracking-wider">{time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
