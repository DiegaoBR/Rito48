
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  promo_price NUMERIC(10,2) NOT NULL,
  affiliate_link TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.scheduled_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
  id INT PRIMARY KEY CHECK (id = 1),
  telegram_chat_id TEXT,
  auto_send BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.settings (id) VALUES (1);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON public.scheduled_sends FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON public.settings FOR ALL USING (true) WITH CHECK (true);
