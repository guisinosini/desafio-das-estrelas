-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text check (role in ('admin', 'professional', 'patient')) default 'patient',
  avatar_url text
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Professionals table
create table professionals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text unique not null,
  phone text,
  crm text unique,
  specialty text,
  active boolean default true
);

-- Patients table
create table patients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text unique,
  phone text,
  cpf text unique,
  birth_date date,
  active boolean default true
);

-- Services table
create table services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  duration_minutes integer not null default 30,
  price decimal(10,2) not null,
  active boolean default true
);

-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock_quantity integer default 0,
  active boolean default true
);

-- Appointments table
create table appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  patient_id uuid references patients(id) on delete set null,
  professional_id uuid references professionals(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  status text check (status in ('scheduled', 'confirmed', 'cancelled', 'completed')) default 'scheduled',
  notes text
);

-- Create a function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'patient'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
