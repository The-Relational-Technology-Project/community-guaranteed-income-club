CREATE TYPE public.board_post_type AS ENUM ('offer', 'need', 'lead');

CREATE TABLE public.board_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.board_post_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_posts_created_at ON public.board_posts(created_at DESC);
CREATE INDEX idx_board_posts_author ON public.board_posts(author_id);

ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view board posts"
  ON public.board_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can create own posts"
  ON public.board_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.board_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.board_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all board posts"
  ON public.board_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
