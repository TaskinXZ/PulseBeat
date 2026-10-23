-- ============================================================================
-- PulseBeat Production Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  company_name text default 'Acme Cloud Platform',
  custom_domain text default 'status.acmeworks.io',
  user_plan text default 'free' check (user_plan in ('free', 'pro', 'team')),
  hide_branding boolean default false,
  discord_webhook_url text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Monitors Table
create table if not exists public.monitors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  url text not null,
  type text default 'https' check (type in ('http', 'https', 'tcp', 'dns')),
  interval_sec integer default 60,
  status text default 'operational' check (status in ('operational', 'degraded', 'down', 'maintenance')),
  uptime_90d numeric(5,2) default 100.0,
  latency_ms integer default 35,
  ssl_expiry_days integer default 180,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Ping Logs Table (Time-Series checks)
create table if not exists public.ping_logs (
  id uuid default uuid_generate_v4() primary key,
  monitor_id uuid references public.monitors on delete cascade not null,
  latency_ms integer not null,
  status_code integer not null,
  success boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast time-series lookup
create index if not exists idx_ping_logs_monitor_time on public.ping_logs(monitor_id, created_at desc);

-- 4. Incidents Table
create table if not exists public.incidents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  impact text default 'minor' check (impact in ('minor', 'major', 'critical', 'maintenance')),
  status text default 'investigating' check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
  affected_monitor_ids jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- 5. Incident Updates Table
create table if not exists public.incident_updates (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.incidents on delete cascade not null,
  status text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Subscribers Table (For public status page email alerts)
create table if not exists public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, email)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user only accesses their own data
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.monitors enable row level security;
alter table public.ping_logs enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_updates enable row level security;
alter table public.subscribers enable row level security;

-- Profiles: Users can select & update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Monitors: Owner access
create policy "Users can view own monitors" on public.monitors
  for select using (auth.uid() = user_id);

create policy "Users can insert own monitors" on public.monitors
  for insert with check (auth.uid() = user_id);

create policy "Users can update own monitors" on public.monitors
  for update using (auth.uid() = user_id);

create policy "Users can delete own monitors" on public.monitors
  for delete using (auth.uid() = user_id);

-- Incidents: Owner access
create policy "Users can view own incidents" on public.incidents
  for select using (auth.uid() = user_id);

create policy "Users can insert own incidents" on public.incidents
  for insert with check (auth.uid() = user_id);

create policy "Users can update own incidents" on public.incidents
  for update using (auth.uid() = user_id);

-- Public Read for Status Pages (Anyone can view monitors and incidents for public status pages)
create policy "Public can view active monitors" on public.monitors
  for select using (is_active = true);

create policy "Public can view incidents" on public.incidents
  for select using (true);

create policy "Public can view incident updates" on public.incident_updates
  for select using (true);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, company_name)
  values (new.id, new.email, 'My Cloud Platform');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
