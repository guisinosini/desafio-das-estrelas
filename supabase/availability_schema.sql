-- Professional Availability table
create table professional_availability (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  professional_id uuid references professionals(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0 = Sunday, 6 = Saturday
  start_time time not null,
  end_time time not null,
  active boolean default true,
  unique (professional_id, day_of_week, start_time, end_time)
);

alter table professional_availability enable row level security;

create policy "Professionals can manage their own availability." on professional_availability
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'professional'
    )
  );

create policy "Public can view availability (for booking)." on professional_availability
  for select using (true);
