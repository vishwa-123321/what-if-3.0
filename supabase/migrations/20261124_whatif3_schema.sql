-- WHAT IF 3.0 — Complete Interactive Story Universe Schema & RLS Migration
-- Run in your Supabase SQL Editor to enable persistent cloud storage for dynamic AI stories.

create extension if not exists "pgcrypto";

-- 1. User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Explorer',
  email text,
  bio text default '',
  favorite_genres text[] default '{}',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Stories (curated + user-generated universes)
create table if not exists public.stories (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  author text not null default 'WHAT IF Studio',
  genre_id text,
  genre_slug text not null,
  genre_name text not null,
  cover_image text not null default '',
  difficulty text not null default 'Balanced',
  tone text not null default 'Cinematic',
  story_length text not null default 'Medium',
  pov text not null default 'First-person',
  atmosphere text not null default 'Mysterious',
  setting_type text not null default 'Realistic',
  main_character_name text not null default 'Morgan',
  character_personality text not null default 'Observant',
  character_background text default '',
  is_public boolean not null default false,
  popularity_score integer not null default 80,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Story Scenes
create table if not exists public.story_scenes (
  id text primary key,
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  parent_scene_id text references public.story_scenes(id) on delete set null,
  chapter_number integer not null default 1,
  scene_number integer not null default 1,
  scene_title text not null,
  location text not null default '',
  narrative_paragraphs jsonb not null default '[]'::jsonb,
  dialogue jsonb not null default '[]'::jsonb,
  situation_summary text not null default '',
  what_you_know jsonb not null default '[]'::jsonb,
  available_decisions jsonb not null default '[]'::jsonb,
  consequences jsonb not null default '[]'::jsonb,
  current_objective text not null default '',
  arc_stage text not null default 'Inciting Incident',
  is_ending boolean not null default false,
  ending_type text,
  ending_title text,
  created_at timestamptz not null default now()
);

-- 4. Story Decisions
create table if not exists public.story_decisions (
  id uuid primary key default gen_random_uuid(),
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  scene_id text not null references public.story_scenes(id) on delete cascade,
  scene_number integer not null,
  chapter_number integer not null,
  decision_id text not null,
  decision_label text not null,
  is_custom_action boolean not null default false,
  consequence_summary text not null default '',
  created_at timestamptz not null default now()
);

-- 5. Story Characters
create table if not exists public.story_characters (
  id text not null,
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'Key Figure',
  personality text not null default '',
  background text not null default '',
  motivation text not null default '',
  relationship text not null default 'Neutral',
  trust_score integer not null default 0,
  knowledge jsonb not null default '[]'::jsonb,
  secret text not null default '',
  secret_revealed boolean not null default false,
  dialogue_style text not null default '',
  is_present boolean not null default false,
  last_reaction text,
  updated_at timestamptz not null default now(),
  primary key (story_id, id)
);

-- 6. Story Clues (and discovered key evidence)
create table if not exists public.story_clues (
  id text not null,
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  discovered_at_scene integer not null default 1,
  chapter_number integer not null default 1,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (story_id, id)
);

-- 7. Story Branches (for interactive Turning Points tree & divergence)
create table if not exists public.story_branches (
  scene_id text primary key references public.story_scenes(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  parent_scene_id text references public.story_scenes(id) on delete set null,
  chapter_number integer not null,
  scene_number integer not null,
  title text not null,
  decision_label text not null default 'Opening Scene',
  is_custom_action boolean not null default false,
  is_ending boolean not null default false,
  ending_type text,
  is_current_path boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. Story Progress (full state snapshot for instant cross-device resume)
create table if not exists public.story_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  current_scene_id text not null,
  current_chapter integer not null default 1,
  current_scene_number integer not null default 1,
  current_location text not null default '',
  current_objective text not null default '',
  progress_percent integer not null default 10,
  is_ending boolean not null default false,
  ending_title text,
  ending_type text,
  state_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, story_id)
);

-- 9. Saved Stories (Library bookmarks)
create table if not exists public.saved_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, story_id)
);

-- 10. Favourite Stories
create table if not exists public.favourite_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, story_id)
);

-- Helpful Indexes
create index if not exists idx_stories_genre_slug on public.stories(genre_slug);
create index if not exists idx_story_scenes_story_id on public.story_scenes(story_id, scene_number);
create index if not exists idx_story_decisions_story_id on public.story_decisions(story_id, scene_number);
create index if not exists idx_story_progress_user on public.story_progress(user_id, updated_at desc);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_scenes enable row level security;
alter table public.story_decisions enable row level security;
alter table public.story_characters enable row level security;
alter table public.story_clues enable row level security;
alter table public.story_branches enable row level security;
alter table public.story_progress enable row level security;
alter table public.saved_stories enable row level security;
alter table public.favourite_stories enable row level security;

-- Policies
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Anyone reads public stories; owners manage their stories" on public.stories
  for select using (is_public = true or auth.uid() = user_id);
create policy "Owners insert stories" on public.stories
  for insert with check (auth.uid() = user_id);
create policy "Owners update stories" on public.stories
  for update using (auth.uid() = user_id);
create policy "Owners delete stories" on public.stories
  for delete using (auth.uid() = user_id);

create policy "Users manage own story scenes" on public.story_scenes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own story decisions" on public.story_decisions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own story characters" on public.story_characters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own story clues" on public.story_clues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own story branches" on public.story_branches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own story progress" on public.story_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own saved stories" on public.saved_stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own favourite stories" on public.favourite_stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
