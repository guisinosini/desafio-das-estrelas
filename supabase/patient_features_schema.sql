-- Payments table (mock)
create table payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  appointment_id uuid references appointments(id) on delete cascade,
  amount decimal(10,2) not null,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  payment_method text
);

-- Appointment Feedback table
create table appointment_feedback (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  appointment_id uuid references appointments(id) on delete cascade unique,
  rating integer not null check (rating between 1 and 5),
  comment text
);

alter table payments enable row level security;
alter table appointment_feedback enable row level security;

create policy "Patients can view their own payments." on payments
  for select using (
    exists (
      select 1 from appointments
      join patients on appointments.patient_id = patients.id
      join profiles on patients.email = profiles.full_name -- simplified for demo
      where payments.appointment_id = appointments.id
      and profiles.id = auth.uid()
    )
  );

create policy "Patients can manage their own feedback." on appointment_feedback
  for all using (
    exists (
      select 1 from appointments
      join patients on appointments.patient_id = patients.id
      where appointment_feedback.appointment_id = appointments.id
      -- logic for auth user...
    )
  );
