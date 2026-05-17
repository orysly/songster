CREATE TABLE verified_tracks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spotify_id text UNIQUE NOT NULL,
  title text NOT NULL,
  artists text[] NOT NULL,
  release_year integer NOT NULL,
  release_date text NOT NULL,
  era text NOT NULL,
  genre text NOT NULL,
  preview_url text,
  image_url text,
  duration_ms integer NOT NULL,
  isrc text,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for fast random fetching
CREATE INDEX idx_verified_tracks_era_genre ON verified_tracks (era, genre);

-- Enable RLS and create a simple public policy so the game can read/write
ALTER TABLE verified_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON verified_tracks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON verified_tracks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public upsert"
  ON verified_tracks
  FOR UPDATE
  TO public
  USING (true);
