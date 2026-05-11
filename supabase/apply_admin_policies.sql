-- Enable RLS for all clinical tables
alter table professionals enable row level security;
alter table patients enable row level security;
alter table services enable row level security;
alter table products enable row level security;
alter table appointments enable row level security;

-- Policies for Professionals
create policy "Admins have full access to professionals" on professionals
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Policies for Patients
create policy "Admins have full access to patients" on patients
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Policies for Services
create policy "Admins have full access to services" on services
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Policies for Products
create policy "Admins have full access to products" on products
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Policies for Appointments
create policy "Admins have full access to appointments" on appointments
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Allow everyone to read services and professionals (needed for booking and listings)
create policy "Services are viewable by everyone" on services for select using (true);
create policy "Professionals are viewable by everyone" on professionals for select using (true);
