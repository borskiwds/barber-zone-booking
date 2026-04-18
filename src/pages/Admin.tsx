import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Clock, LogOut, Phone, Scissors, Settings, User, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  service_name: string;
  service_price_pln: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "accepted" | "rejected";
  notes: string | null;
}

interface BusinessHour {
  id: string;
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

const WEEKDAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

const statusVariant = (s: string) => {
  if (s === "accepted") return "bg-success text-success-foreground";
  if (s === "rejected") return "bg-destructive text-destructive-foreground";
  return "bg-gold text-gold-foreground";
};
const statusLabel = (s: string) => s === "accepted" ? "Zaakceptowane" : s === "rejected" ? "Odrzucone" : "Oczekujące";

const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (!session) navigate("/login", { replace: true });
    });
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/login", { replace: true }); return; }
      setAuthed(true);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
      const admin = !!roles?.find((r) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) toast.error("Brak uprawnień administratora");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    const [{ data: apps }, { data: bh }] = await Promise.all([
      supabase.from("appointments").select("*").order("appointment_date", { ascending: true }).order("appointment_time"),
      supabase.from("business_hours").select("*").order("weekday"),
    ]);
    if (apps) setAppointments(apps as Appointment[]);
    if (bh) setHours(bh as BusinessHour[]);
  };

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin]);

  const updateStatus = async (id: string, status: Appointment["status"]) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { toast.error("Błąd aktualizacji"); return; }
    toast.success(status === "accepted" ? "Wizyta zaakceptowana" : status === "rejected" ? "Wizyta odrzucona" : "Status zmieniony");
    loadData();
  };

  const reschedule = async (id: string) => {
    const newDate = prompt("Nowa data (YYYY-MM-DD):");
    if (!newDate) return;
    const newTime = prompt("Nowa godzina (HH:MM):");
    if (!newTime) return;
    const { error } = await supabase.from("appointments").update({ appointment_date: newDate, appointment_time: newTime }).eq("id", id);
    if (error) { toast.error("Błąd zmiany terminu"); return; }
    toast.success("Termin zmieniony");
    loadData();
  };

  const updateHours = async (h: BusinessHour) => {
    const { error } = await supabase.from("business_hours").update({
      open_time: h.open_time, close_time: h.close_time, closed: h.closed,
    }).eq("id", h.id);
    if (error) { toast.error("Błąd zapisu"); return; }
    toast.success(`Zaktualizowano: ${WEEKDAYS[h.weekday]}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (authed === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Ładowanie...</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6 text-center">
      <p className="text-muted-foreground">Twoje konto nie ma uprawnień administratora.</p>
      <Button variant="outline" onClick={handleLogout}>Wyloguj</Button>
    </div>
  );

  const pending = appointments.filter((a) => a.status === "pending");
  const upcoming = appointments.filter((a) => a.appointment_date >= format(new Date(), "yyyy-MM-dd"));
  const dayApps = calendarDate ? appointments.filter((a) => a.appointment_date === format(calendarDate, "yyyy-MM-dd")) : [];
  const datesWithApps = new Set(appointments.map((a) => a.appointment_date));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-x flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-gold" />
            <span className="font-display text-xl tracking-wider">PANEL ADMINA</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Wyloguj
          </Button>
        </div>
      </header>

      <main className="container-x py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-8">
            <TabsTrigger value="pending">Oczekujące ({pending.length})</TabsTrigger>
            <TabsTrigger value="all">Wszystkie</TabsTrigger>
            <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
            <TabsTrigger value="hours">Godziny pracy</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <AppointmentList list={pending} onAccept={(id) => updateStatus(id, "accepted")} onReject={(id) => updateStatus(id, "rejected")} onReschedule={reschedule} empty="Brak wizyt oczekujących na potwierdzenie." />
          </TabsContent>

          <TabsContent value="all">
            <AppointmentList list={upcoming} onAccept={(id) => updateStatus(id, "accepted")} onReject={(id) => updateStatus(id, "rejected")} onReschedule={reschedule} empty="Brak nadchodzących wizyt." />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid md:grid-cols-[auto_1fr] gap-8">
              <div className="border border-border bg-card p-4 inline-block">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  locale={pl}
                  modifiers={{ booked: (d) => datesWithApps.has(format(d, "yyyy-MM-dd")) }}
                  modifiersClassNames={{ booked: "bg-gold/20 text-gold font-semibold" }}
                  className="pointer-events-auto"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl mb-4">
                  {calendarDate ? format(calendarDate, "EEEE, d MMMM yyyy", { locale: pl }) : ""}
                </h3>
                <AppointmentList list={dayApps} onAccept={(id) => updateStatus(id, "accepted")} onReject={(id) => updateStatus(id, "rejected")} onReschedule={reschedule} empty="Brak wizyt w tym dniu." />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours">
            <div className="max-w-2xl space-y-3">
              {hours.map((h) => (
                <HoursRow key={h.id} hour={h} onSave={updateHours} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const AppointmentList = ({ list, onAccept, onReject, onReschedule, empty }: {
  list: Appointment[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onReschedule: (id: string) => void;
  empty: string;
}) => {
  if (list.length === 0) return <p className="text-muted-foreground py-8">{empty}</p>;
  return (
    <div className="space-y-3">
      {list.map((a) => (
        <article key={a.id} className="border border-border bg-card p-5 grid md:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn("text-xs px-3 py-1 uppercase tracking-wider font-semibold", statusVariant(a.status))}>
                {statusLabel(a.status)}
              </span>
              <span className="text-gold font-display text-xl">
                {format(new Date(a.appointment_date), "d MMM", { locale: pl })} · {a.appointment_time.slice(0, 5)}
              </span>
            </div>
            <p className="font-semibold text-lg">{a.service_name} <span className="text-muted-foreground font-normal">— {a.service_price_pln} zł</span></p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.customer_name}</span>
              <a href={`tel:${a.customer_phone}`} className="flex items-center gap-1 hover:text-gold"><Phone className="w-3 h-3" /> {a.customer_phone}</a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {a.status !== "accepted" && (
              <Button size="sm" variant="gold" onClick={() => onAccept(a.id)}><Check className="w-4 h-4" /> Akceptuj</Button>
            )}
            {a.status !== "rejected" && (
              <Button size="sm" variant="outline" onClick={() => onReject(a.id)}><X className="w-4 h-4" /> Odrzuć</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onReschedule(a.id)}><Clock className="w-4 h-4" /> Zmień termin</Button>
          </div>
        </article>
      ))}
    </div>
  );
};

const HoursRow = ({ hour, onSave }: { hour: BusinessHour; onSave: (h: BusinessHour) => void }) => {
  const [h, setH] = useState(hour);
  return (
    <div className="border border-border bg-card p-4 flex flex-wrap items-center gap-4">
      <span className="font-semibold w-32">{WEEKDAYS[h.weekday]}</span>
      <div className="flex items-center gap-2">
        <Switch checked={!h.closed} onCheckedChange={(v) => setH({ ...h, closed: !v })} />
        <span className="text-sm text-muted-foreground">{h.closed ? "Zamknięte" : "Otwarte"}</span>
      </div>
      {!h.closed && (
        <div className="flex items-center gap-2">
          <Input type="time" value={h.open_time?.slice(0, 5) ?? ""} onChange={(e) => setH({ ...h, open_time: e.target.value })} className="w-28" />
          <span className="text-muted-foreground">–</span>
          <Input type="time" value={h.close_time?.slice(0, 5) ?? ""} onChange={(e) => setH({ ...h, close_time: e.target.value })} className="w-28" />
        </div>
      )}
      <Button size="sm" variant="outlineGold" className="ml-auto" onClick={() => onSave(h)}>Zapisz</Button>
    </div>
  );
};

export default Admin;
