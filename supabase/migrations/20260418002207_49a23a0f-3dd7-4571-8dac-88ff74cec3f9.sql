
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_pln integer not null,
  duration_min integer not null default 30,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null unique check (weekday between 0 and 6),
  open_time time,
  close_time time,
  closed boolean not null default false
);
alter table public.business_hours enable row level security;

create type public.appointment_status as enum ('pending', 'accepted', 'rejected');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  service_price_pln integer not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_date date not null,
  appointment_time time not null,
  status public.appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create index idx_appointments_date on public.appointments(appointment_date);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_appointments_updated before update on public.appointments
for each row execute function public.update_updated_at_column();
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);
create policy "admins_select_all_profiles" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

create policy "users_read_own_roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "admins_manage_roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "services_public_read" on public.services for select using (active = true or public.has_role(auth.uid(), 'admin'));
create policy "services_admin_write" on public.services for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "business_hours_public_read" on public.business_hours for select using (true);
create policy "business_hours_admin_write" on public.business_hours for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "appointments_public_insert" on public.appointments for insert with check (status = 'pending');
create policy "appointments_admin_read" on public.appointments for select using (public.has_role(auth.uid(), 'admin'));
create policy "appointments_admin_update" on public.appointments for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "appointments_admin_delete" on public.appointments for delete using (public.has_role(auth.uid(), 'admin'));

insert into public.services (name, description, price_pln, duration_min, sort_order) values
  ('Strzyżenie męskie', 'Klasyczne lub nowoczesne strzyżenie maszynką i nożyczkami, mycie, stylizacja.', 60, 30, 1),
  ('Strzyżenie + broda', 'Pełna metamorfoza: strzyżenie włosów oraz precyzyjne modelowanie i pielęgnacja brody.', 90, 60, 2),
  ('Modelowanie brody', 'Konturowanie, przycinanie i pielęgnacja brody z użyciem najlepszych olejków i kosmetyków.', 40, 30, 3),
  ('Strzyżenie dzieci', 'Wygodne i szybkie strzyżenie dla najmłodszych klientów (do 12 lat).', 50, 30, 4);

insert into public.business_hours (weekday, open_time, close_time, closed) values
  (1, '10:00', '20:00', false),
  (2, '10:00', '20:00', false),
  (3, '10:00', '20:00', false),
  (4, '10:00', '20:00', false),
  (5, '10:00', '20:00', false),
  (6, '09:00', '15:00', false),
  (0, null, null, true);
