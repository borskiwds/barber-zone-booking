import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Service { id: string; name: string; price_pln: number; duration_min: number }
interface BusinessHour { weekday: number; open_time: string | null; close_time: string | null; closed: boolean }

const formSchema = z.object({
  name: z.string().trim().min(2, "Imię musi mieć min. 2 znaki").max(80),
  phone: z.string().trim().min(9, "Podaj prawidłowy numer").max(20).regex(/^[0-9+\s()-]+$/, "Nieprawidłowy numer"),
  email: z.string().trim().email("Nieprawidłowy email").max(255).optional().or(z.literal("")),
});

const generateSlots = (open: string, close: string, step = 30) => {
  const slots: string[] = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  for (let m = start; m < end; m += step) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
};

export const Booking = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [busy, setBusy] = useState<{ date: string; time: string }[]>([]);

  const [serviceId, setServiceId] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("services").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setServices(data as Service[]);
    });
    supabase.from("business_hours").select("*").then(({ data }) => {
      if (data) setHours(data as BusinessHour[]);
    });
  }, []);

  // Refresh busy slots when date changes — public users can't read appointments,
  // so we rely on a permissive availability check inside the rezerwuj edge function instead.
  useEffect(() => { setBusy([]); }, [date]);

  const dayHours = useMemo(() => {
    if (!date) return null;
    return hours.find((h) => h.weekday === date.getDay()) ?? null;
  }, [date, hours]);

  const slots = useMemo(() => {
    if (!dayHours || dayHours.closed || !dayHours.open_time || !dayHours.close_time) return [];
    return generateSlots(dayHours.open_time.slice(0, 5), dayHours.close_time.slice(0, 5));
  }, [dayHours]);

  const isDayClosed = (d: Date) => {
    const h = hours.find((x) => x.weekday === d.getDay());
    return !h || h.closed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !date || !time) {
      toast.error("Wybierz usługę, datę i godzinę");
      return;
    }

    const parsed = formSchema.safeParse({ name, phone, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const service = services.find((s) => s.id === serviceId)!;
    setSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      service_id: service.id,
      service_name: service.name,
      service_price_pln: service.price_pln,
      customer_name: parsed.data.name,
      customer_phone: parsed.data.phone,
      customer_email: parsed.data.email || null,
      appointment_date: format(date, "yyyy-MM-dd"),
      appointment_time: time,
    });

    if (error) {
      setSubmitting(false);
      toast.error("Nie udało się zapisać rezerwacji. Spróbuj ponownie.");
      return;
    }

    // Fire-and-forget notifications (don't block UX if they fail)
    supabase.functions.invoke("notify-booking", {
      body: {
        customer_name: parsed.data.name,
        customer_phone: parsed.data.phone,
        customer_email: parsed.data.email || null,
        service_name: service.name,
        service_price_pln: service.price_pln,
        appointment_date: format(date, "yyyy-MM-dd"),
        appointment_time: time,
      },
    }).catch(() => {});

    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <section id="rezerwacja" className="py-24 md:py-32 bg-background">
        <div className="container-x max-w-2xl">
          <div className="border border-gold bg-card p-12 text-center animate-fade-up">
            <CheckCircle2 className="w-16 h-16 text-gold mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl mb-4">Dziękujemy!</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Twoja wizyta została zgłoszona i czeka na potwierdzenie. Skontaktujemy się z Tobą wkrótce.
            </p>
            <Button variant="outlineGold" className="mt-8" onClick={() => { setDone(false); setServiceId(undefined); setDate(undefined); setTime(undefined); setName(""); setPhone(""); setEmail(""); }}>
              Umów kolejną wizytę
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rezerwacja" className="py-24 md:py-32 bg-gradient-dark">
      <div className="container-x max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-gold tracking-[0.3em] text-xs uppercase mb-4">Rezerwacja online</p>
          <h2 className="font-display text-4xl md:text-6xl mb-6">Umów wizytę</h2>
          <div className="gold-divider" />
        </div>

        <form onSubmit={handleSubmit} className="border border-border bg-card p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Wybierz usługę *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service" className="h-12">
                <SelectValue placeholder="— wybierz —" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.price_pln} zł
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data wizyty *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("h-12 w-full justify-start text-left font-normal bg-input", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                    {date ? format(date, "PPP", { locale: pl }) : "Wybierz datę"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setTime(undefined); }}
                    locale={pl}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || isDayClosed(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Godzina *</Label>
              <Select value={time} onValueChange={setTime} disabled={!date || slots.length === 0}>
                <SelectTrigger id="time" className="h-12">
                  <SelectValue placeholder={!date ? "Najpierw wybierz datę" : slots.length === 0 ? "Salon zamknięty" : "— wybierz —"} />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-64">
                  {slots.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Imię *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" maxLength={80} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Numer telefonu *</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" maxLength={20} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcjonalnie — wyślemy potwierdzenie)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" maxLength={255} />
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Wysyłanie...</> : "Zarezerwuj wizytę"}
          </Button>
        </form>
      </div>
    </section>
  );
};
