-- =============================================
-- Tripp V4 — Supabase Schema
-- =============================================
-- Run this in the Supabase SQL Editor after
-- creating your project.
-- =============================================

-- 1. User profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Trip rooms
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  destination text not null,
  days integer not null default 3,
  max_members integer not null default 5,
  start_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 3. Room members
create table public.room_members (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 4. Chat messages
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  user_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 5. Saved itineraries
create table public.itineraries (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  content jsonb not null,
  generated_at timestamptz default now()
);

-- 6. Packing items
create table public.packing_items (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  category text not null,
  packed boolean default false,
  created_at timestamptz default now()
);

-- 7. Travel documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  name text not null,
  type text not null,
  file_url text,
  details text,
  uploaded_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.itineraries enable row level security;
alter table public.packing_items enable row level security;
alter table public.documents enable row level security;

-- Profiles
create policy "Anyone can view profiles"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Rooms
create policy "Anyone can view rooms"
  on public.rooms for select using (true);
create policy "Authenticated users can create rooms"
  on public.rooms for insert with check (auth.uid() is not null);
create policy "Room creator can update"
  on public.rooms for update using (created_by = auth.uid());

-- Room members
create policy "Anyone can view room members"
  on public.room_members for select using (true);
create policy "Authenticated users can join rooms"
  on public.room_members for insert with check (auth.uid() = user_id);
create policy "Members can leave"
  on public.room_members for delete using (user_id = auth.uid());

-- Chat messages
create policy "Room members can view messages"
  on public.chat_messages for select using (
    exists (
      select 1 from public.room_members
      where room_id = chat_messages.room_id and user_id = auth.uid()
    )
  );
create policy "Room members can send messages"
  on public.chat_messages for insert with check (
    exists (
      select 1 from public.room_members
      where room_id = chat_messages.room_id and user_id = auth.uid()
    )
  );

-- Itineraries
create policy "Room members can view itineraries"
  on public.itineraries for select using (
    exists (
      select 1 from public.room_members
      where room_id = itineraries.room_id and user_id = auth.uid()
    )
  );
create policy "Room members can create itineraries"
  on public.itineraries for insert with check (
    exists (
      select 1 from public.room_members
      where room_id = itineraries.room_id and user_id = auth.uid()
    )
  );

-- Packing items
create policy "Room members can view packing items"
  on public.packing_items for select using (
    exists (
      select 1 from public.room_members
      where room_id = packing_items.room_id and user_id = auth.uid()
    )
  );
create policy "Users can manage own packing items"
  on public.packing_items for insert with check (user_id = auth.uid());
create policy "Users can update own packing items"
  on public.packing_items for update using (user_id = auth.uid());
create policy "Users can delete own packing items"
  on public.packing_items for delete using (user_id = auth.uid());

-- Documents
create policy "Room members can view documents"
  on public.documents for select using (
    exists (
      select 1 from public.room_members
      where room_id = documents.room_id and user_id = auth.uid()
    )
  );
create policy "Room members can upload documents"
  on public.documents for insert with check (
    exists (
      select 1 from public.room_members
      where room_id = documents.room_id and user_id = auth.uid()
    )
  );

-- =============================================
-- Realtime
-- =============================================

alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.room_members;

-- =============================================
-- Auto-create profile on signup
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
