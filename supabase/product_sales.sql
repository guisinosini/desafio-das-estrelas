-- Table for product sales
create table if not exists product_sales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  quantity integer not null default 1,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null
);

-- Enable RLS
alter table product_sales enable row level security;

-- Policies
create policy "Product sales are viewable by admins" on product_sales
  for select using (true);

create policy "Admins can insert product sales" on product_sales
  for insert with check (true);
