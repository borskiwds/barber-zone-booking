import { Award, Sparkles, UserCheck } from "lucide-react";

const features = [
  { icon: Award, title: "Najwyższa jakość", text: "Pracujemy na topowych produktach i sprawdzonych technikach." },
  { icon: Sparkles, title: "Precyzja", text: "Każde cięcie dopracowane do milimetra — bez kompromisów." },
  { icon: UserCheck, title: "Indywidualne podejście", text: "Każdego klienta traktujemy wyjątkowo, dobierając styl pod niego." },
];

export const About = () => (
  <section id="o-nas" className="py-24 md:py-32 bg-gradient-dark">
    <div className="container-x">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">O nas</p>
        <h2 className="font-display text-4xl md:text-6xl mb-6">Nowoczesny salon barberski w sercu Rybnika</h2>
        <div className="gold-divider mb-8" />
        <p className="text-muted-foreground text-lg leading-relaxed">
          Barber Zone to nowoczesny salon barberski w Rybniku, oferujący profesjonalne strzyżenie męskie
          oraz stylizację brody. Naszym celem jest najwyższa jakość usług, precyzja oraz indywidualne
          podejście do każdego klienta. Pracujemy na najlepszych produktach i dbamy o każdy detal.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {features.map((f) => (
          <div
            key={f.title}
            className="border border-border bg-card p-8 transition-smooth hover:border-gold hover:shadow-gold"
          >
            <f.icon className="w-8 h-8 text-gold mb-4" />
            <h3 className="font-display text-2xl mb-2">{f.title}</h3>
            <p className="text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
