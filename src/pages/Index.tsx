import { Header, Footer } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Offer } from "@/components/site/Offer";
import { Booking } from "@/components/site/Booking";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Offer />
        <Booking />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
