
-- Create enum for game status
CREATE TYPE game_status AS ENUM ('setup', 'active', 'finished');

-- Create games table to track game state
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status game_status NOT NULL DEFAULT 'setup',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  target_id UUID REFERENCES public.players(id),
  last_action TIMESTAMP WITH TIME ZONE,
  has_logged_in BOOLEAN NOT NULL DEFAULT false,
  pending_kill_confirmation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create kill_requests table to track elimination attempts
CREATE TABLE public.kill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  killer_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  confirmed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a game app without user authentication)
CREATE POLICY "Allow all operations on games" ON public.games FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON public.players FOR ALL USING (true);
CREATE POLICY "Allow all operations on kill_requests" ON public.kill_requests FOR ALL USING (true);

-- Insert initial game
INSERT INTO public.games (status) VALUES ('setup');

-- Function to assign targets in a circle
CREATE OR REPLACE FUNCTION assign_targets(game_uuid UUID)
RETURNS void AS $$
DECLARE
  player_ids UUID[];
  i INTEGER;
BEGIN
  -- Get all player IDs for the game in random order
  SELECT array_agg(id ORDER BY random()) INTO player_ids
  FROM public.players 
  WHERE game_id = game_uuid AND is_alive = true;
  
  -- Assign targets in a circle
  FOR i IN 1..array_length(player_ids, 1) LOOP
    UPDATE public.players 
    SET target_id = player_ids[CASE WHEN i = array_length(player_ids, 1) THEN 1 ELSE i + 1 END]
    WHERE id = player_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;
