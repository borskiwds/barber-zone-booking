import { Quote } from "lucide-react";

const reviews = [
  { text: "Najlepszy barber w Rybniku, pełen profesjonalizm!", author: "Marek K." },
  { text: "Mega klimat i świetna obsługa", author: "Tomek W." },
  { text: "Zawsze wychodzę zadowolony", author: "Bartek S." },
];

export const Testimonials = () => (
  <section id="opinie" className="py-24 md:py-32 bg-gradient-dark">
    <div className="container-x">
      <div className="text-center mb-16">
        <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">Opinie</p>
        <h2 className="font-display text-4xl md:text-6xl mb-6">Co mówią klienci</h2>
        <div className="gold-divider" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {reviews.map((r) => (
          <figure key={r.author} className="border border-border bg-card p-8 relative">
            <Quote className="w-8 h-8 text-gold/40 mb-4" />
            <blockquote className="text-lg leading-relaxed text-foreground">"{r.text}"</blockquote>
            <figcaption className="mt-6 text-gold tracking-wider uppercase text-sm">— {r.author}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
