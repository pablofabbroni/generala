-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE transaction_type AS ENUM (
  'register_bonus', 
  'daily_bonus', 
  'ad_reward', 
  'game_entry', 
  'game_prize', 
  'rake', 
  'purchase', 
  'refund', 
  'admin_adjustment'
);
CREATE TYPE feedback_category AS ENUM ('bug', 'idea', 'ux', 'otro');
CREATE TYPE feedback_status AS ENUM ('new', 'in_review', 'resolved');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE tournament_status AS ENUM ('scheduled', 'running', 'finished', 'cancelled');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  credits INT DEFAULT 0 NOT NULL,
  status user_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  last_daily_bonus_at TIMESTAMPTZ,
  last_ad_reward_at TIMESTAMPTZ,
  ad_reward_count_today INT DEFAULT 0 NOT NULL,
  ad_reward_count_date DATE,
  last_seen_at TIMESTAMPTZ
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount INT NOT NULL, -- positive or negative
  currency TEXT,
  money_amount INT, -- in cents
  provider TEXT,
  status TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL, -- casual, intermedia, alta, tournament
  players_allowed INT NOT NULL,
  entry_fee INT NOT NULL,
  rake_pct INT DEFAULT 10 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status tournament_status DEFAULT 'scheduled' NOT NULL,
  entry_fee INT NOT NULL,
  max_players INT,
  prize_pool_type TEXT NOT NULL, -- fixed, from_entries
  prize_pool_amount INT,
  rake_pct INT DEFAULT 10 NOT NULL,
  rules JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tournament Entries
CREATE TABLE public.tournament_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  paid_entry BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tournament_id, user_id)
);

-- Player Stats
CREATE TABLE public.player_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  games_played INT DEFAULT 0 NOT NULL,
  games_won INT DEFAULT 0 NOT NULL,
  games_lost INT DEFAULT 0 NOT NULL,
  win_rate FLOAT DEFAULT 0 NOT NULL,
  last_match_at TIMESTAMPTZ
);

-- Feedback
CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category feedback_category NOT NULL,
  message TEXT NOT NULL,
  page TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  status feedback_status DEFAULT 'new' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Friends
CREATE TABLE public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status friendship_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Triggers for syncing profiles with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, image)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  -- Initial Stats
  INSERT INTO public.player_stats (user_id) VALUES (NEW.id);
  
  -- Register Bonus: +200 chips
  UPDATE public.profiles SET credits = 200 WHERE id = NEW.id;
  
  INSERT INTO public.transactions (user_id, type, amount, meta)
  VALUES (NEW.id, 'register_bonus', 200, '{"reason": "First time registration bonus"}');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON public.friends FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active rooms." ON public.rooms FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view tournaments." ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Users can view own entries." ON public.tournament_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public stats are viewable by everyone." ON public.player_stats FOR SELECT USING (true);

CREATE POLICY "Users can create feedback." ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view feedback." ON public.feedback FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own friends." ON public.friends FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can send requests." ON public.friends FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can respond to requests." ON public.friends FOR UPDATE USING (auth.uid() = addressee_id);
