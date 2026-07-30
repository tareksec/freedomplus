-- ENUMS
CREATE TYPE public.content_type AS ENUM ('book','article','news');
CREATE TYPE public.progress_status AS ENUM ('not_started','in_progress','completed');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reading_goal_minutes_per_day INTEGER NOT NULL DEFAULT 30,
  notify_daily BOOLEAN NOT NULL DEFAULT true,
  notify_weekly BOOLEAN NOT NULL DEFAULT true,
  notify_achievements BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AUTHORS
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_public_domain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.authors TO anon, authenticated;
GRANT ALL ON public.authors TO service_role;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors are viewable by everyone" ON public.authors FOR SELECT USING (true);

-- CONTENT
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_bn TEXT,
  type public.content_type NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  excerpt TEXT,
  body_text TEXT,
  file_url TEXT,
  external_url TEXT,
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  pages INTEGER,
  rating NUMERIC(2,1),
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_public_domain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX content_type_idx ON public.content(type);
CREATE INDEX content_category_idx ON public.content(category);
GRANT SELECT ON public.content TO anon, authenticated;
GRANT ALL ON public.content TO service_role;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content is viewable by everyone" ON public.content FOR SELECT USING (true);

-- READING PROGRESS
CREATE TABLE public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'in_progress',
  percent_complete INTEGER NOT NULL DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),
  total_minutes_spent NUMERIC NOT NULL DEFAULT 0,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reading progress" ON public.reading_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTES
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BOOKMARKS
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOLLOWED TOPICS
CREATE TABLE public.followed_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followed_topics TO authenticated;
GRANT ALL ON public.followed_topics TO service_role;
ALTER TABLE public.followed_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own followed topics" ON public.followed_topics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED AUTHORS
INSERT INTO public.authors (slug, name, bio, avatar_url, is_featured, is_public_domain) VALUES
('rabindranath-tagore','Rabindranath Tagore','Bengali polymath, poet and the first non-European Nobel laureate in Literature (1913). His works are in the public domain.','https://i.pravatar.cc/160?img=12',true,true),
('marcus-aurelius','Marcus Aurelius','Roman Emperor and Stoic philosopher whose private journal became one of the most enduring works of practical philosophy.','https://i.pravatar.cc/160?img=52',true,true),
('jane-austen','Jane Austen','English novelist known for her sharp social observation and enduring romantic comedies of manners.','https://i.pravatar.cc/160?img=45',true,true),
('mary-shelley','Mary Shelley','English novelist who wrote Frankenstein at nineteen, effectively inventing science fiction.','https://i.pravatar.cc/160?img=25',true,true),
('sun-tzu','Sun Tzu','Ancient Chinese military strategist and author of The Art of War.','https://i.pravatar.cc/160?img=60',false,true),
('yuval-noah-harari','Yuval Noah Harari','Contemporary historian and author of Sapiens. His works are under copyright — Freedom Plus links to legal sources only.','https://i.pravatar.cc/160?img=47',true,false),
('james-clear','James Clear','Author of Atomic Habits. Copyrighted work — Freedom Plus links to legal purchase and library options.','https://i.pravatar.cc/160?img=33',false,false),
('freedom-plus-newsroom','Freedom Plus Newsroom','The in-house editorial team covering science, technology and education.','https://i.pravatar.cc/160?img=68',false,true);

-- SEED CONTENT: public-domain books
INSERT INTO public.content (slug,title,title_bn,type,category,author_name,author_id,cover_image_url,excerpt,body_text,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'gitanjali','Gitanjali','গীতাঞ্জলি','book','Poetry','Rabindranath Tagore',a.id,
'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop',
'A collection of devotional poems that won Tagore the 1913 Nobel Prize in Literature.',
E'Thou hast made me endless, such is thy pleasure. This frail vessel thou emptiest again and again, and fillest it ever with fresh life.\n\nThis little flute of a reed thou hast carried over hills and dales, and hast breathed through it melodies eternally new.\n\nAt the immortal touch of thy hands my little heart loses its limits in joy and gives birth to utterance ineffable.\n\nThy infinite gifts come to me only on these very small hands of mine. Ages pass, and still thou pourest, and still there is room to fill.\n\nWhen thou commandest me to sing it seems that my heart would break with pride; and I look to thy face, and tears come to my eyes.\n\nAll that is harsh and dissonant in my life melts into one sweet harmony — and my adoration spreads wings like a glad bird on its flight across the sea.\n\nI know thou takest pleasure in my singing. I know that only as a singer I come before thy presence.\n\nI touch by the edge of the far-spreading wing of my song thy feet which I could never aspire to reach.\n\nDrunk with the joy of singing I forget myself and call thee friend who art my lord.',
'https://www.gutenberg.org/ebooks/7164',6,112,4.9,'1912-01-01',true FROM public.authors a WHERE a.slug='rabindranath-tagore';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'meditations','Meditations','book','Philosophy','Marcus Aurelius',a.id,
'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
'Personal writings of a Roman Emperor on Stoic philosophy, self-discipline, and living well.',
E'Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil.\n\nBut I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, and the nature of him who does wrong, that it is akin to me — I can neither be injured by any of them, nor can I be angry with my kinsman, nor hate him.\n\nWe are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another then is contrary to nature.\n\nWhatever this is that I am, it is a little flesh and breath, and the ruling part. Throw away thy books; no longer distract thyself: it is not allowed.\n\nDo every act of thy life as if it were thy last, free from all vanity, all passionate deviation from reason, all hypocrisy, all self-love, and all discontent with thy portion.\n\nNothing happens to any man which he is not formed by nature to bear.',
'https://www.gutenberg.org/ebooks/2680',9,208,4.8,'0180-01-01',true FROM public.authors a WHERE a.slug='marcus-aurelius';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'pride-and-prejudice','Pride and Prejudice','book','Fiction','Jane Austen',a.id,
'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
'A witty study of manners, marriage and misjudgement in Regency England.',
E'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.\n\n"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"\n\nMr. Bennet replied that he had not.\n\n"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."\n\nMr. Bennet made no answer.\n\n"Do not you want to know who has taken it?" cried his wife impatiently.\n\n"You want to tell me, and I have no objection to hearing it."\n\nThis was invitation enough.',
'https://www.gutenberg.org/ebooks/1342',10,432,4.7,'1813-01-28',true FROM public.authors a WHERE a.slug='jane-austen';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'frankenstein','Frankenstein; or, The Modern Prometheus','book','Fiction','Mary Shelley',a.id,
'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop',
'The birth of science fiction: ambition, creation, and the responsibility owed to what we make.',
E'You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.\n\nI am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight.\n\nThere, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour.\n\nI shall satiate my ardent curiosity with the sight of a part of the world never before visited, and may tread a land never before imprinted by the foot of man.\n\nSo strange an accident has happened to us that I cannot forbear recording it, although it is very probable that you will see me before these papers can come into your possession.',
'https://www.gutenberg.org/ebooks/84',8,280,4.6,'1818-01-01',true FROM public.authors a WHERE a.slug='mary-shelley';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'the-art-of-war','The Art of War','book','History','Sun Tzu',a.id,
'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop',
'A 2,500-year-old treatise on strategy that still shapes how we think about conflict and planning.',
E'The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.\n\nThe art of war, then, is governed by five constant factors, to be taken into account in one''s deliberations: the Moral Law, Heaven, Earth, the Commander, and Method and discipline.\n\nAll warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive.\n\nIf your opponent is of choleric temper, seek to irritate him. Pretend to be weak, that he may grow arrogant.\n\nSupreme excellence consists in breaking the enemy''s resistance without fighting.\n\nIf you know the enemy and know yourself, you need not fear the result of a hundred battles.',
'https://www.gutenberg.org/ebooks/132',5,120,4.5,'0500-01-01',true FROM public.authors a WHERE a.slug='sun-tzu';

-- SEED CONTENT: curated (copyrighted) recommendations — external links only
INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'sapiens','Sapiens: A Brief History of Humankind','book','History','Yuval Noah Harari',a.id,
'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format&fit=crop',
'How Homo sapiens rose from an insignificant ape to become the dominant species on Earth. Copyrighted — borrow it free from your local library or buy a copy.',
'https://openlibrary.org/search?q=Sapiens+Yuval+Noah+Harari',0,464,4.6,'2011-01-01',false FROM public.authors a WHERE a.slug='yuval-noah-harari';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,external_url,read_time_minutes,pages,rating,published_date,is_public_domain)
SELECT 'atomic-habits','Atomic Habits','book','Self-Development','James Clear',a.id,
'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
'Tiny changes, remarkable results. Copyrighted — borrow it free from your local library or buy a copy.',
'https://openlibrary.org/search?q=Atomic+Habits+James+Clear',0,320,4.8,'2018-10-16',false FROM public.authors a WHERE a.slug='james-clear';

-- SEED CONTENT: articles
INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,rating,published_date,is_public_domain)
SELECT 'ancient-mesopotamia','The Cradle of Civilization: Ancient Mesopotamia','article','History','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1608425234255-d3ecbbe2b7ad?w=1200&auto=format&fit=crop',
'Between the Tigris and Euphrates, humanity''s first cities rose from clay and cuneiform.',
E'Mesopotamia — the land between two rivers — is often called the cradle of civilization. It was here, in the fertile crescent of modern-day Iraq, that humans first organized into cities, invented writing, and codified law.\n\nThe Sumerians developed cuneiform around 3200 BCE, a writing system pressed into wet clay tablets with a reed stylus. These tablets recorded grain, taxes, prayers, and the earliest known works of literature, including the Epic of Gilgamesh.\n\nZiggurats — stepped temple pyramids — dominated the skyline of cities like Ur and Uruk. Each was dedicated to a patron deity, and priests climbed their terraces to bring humanity closer to the heavens.\n\nThe Code of Hammurabi, carved into a basalt stele around 1750 BCE, is one of the earliest surviving legal codes. Its 282 laws covered wages, trade, marriage and liability.\n\nThe legacy of Mesopotamia lives on in the 60-minute hour, the 360-degree circle, and the very notion that shared laws can hold a society together.',
12,4.7,'2024-11-12',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,rating,published_date,is_public_domain)
SELECT 'quantum-computing-primer','A Gentle Primer on Quantum Computing','article','Technology','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop',
'Superposition, entanglement, and why a quantum bit is nothing like a light switch.',
E'Classical computers store information as bits — each one either 0 or 1. Quantum computers use qubits, which can exist in a superposition of both states at once.\n\nThis is not a metaphor. A qubit is described by a probability amplitude, and its behaviour is genuinely different from any classical system.\n\nEntangled qubits share a state across distance, allowing certain algorithms to solve problems exponentially faster than classical approaches.\n\nShor''s algorithm can factor large integers efficiently, which threatens today''s public-key cryptography. Grover''s algorithm gives a quadratic speed-up for unstructured search.\n\nIn practice, today''s quantum machines are noisy and small. Error correction requires many physical qubits per logical qubit. But the trajectory is real, and chemistry simulation may be the first field genuinely transformed.',
15,4.8,'2024-11-20',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,rating,published_date,is_public_domain)
SELECT 'monsoon-poetry','The Language of the Monsoon in Bengali Poetry','article','Literature','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1200&auto=format&fit=crop',
'From Tagore to Jibanananda, rain has always carried the weight of longing.',
E'In Bengali poetry, the monsoon is never just weather. It is memory, separation, renewal, and the ache of distance.\n\nTagore''s Borsha Mongal cycles link rainfall to devotion. The clouds gather, and with them a restlessness that is at once erotic and spiritual.\n\nJibanananda Das saw in the monsoon a quieter grief — the earth remembering itself, the smell of wet soil standing in for everything unsaid.\n\nThe very sound of brishti (বৃষ্টি) carries the patter of drops on a tin roof, which is why the word appears so often at the end of a line.\n\nTo read monsoon poetry is to accept that a season can be a grammar of feeling.',
6,4.6,'2024-10-28',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,rating,published_date,is_public_domain)
SELECT 'learning-how-to-learn','Learning How to Learn: Evidence-Based Study Methods','article','Self-Development','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop',
'Spaced repetition, retrieval practice and interleaving — what actually works, according to research.',
E'Most students study by re-reading. Decades of cognitive research show it is close to the least effective method available.\n\nRetrieval practice — closing the book and trying to recall — produces far stronger long-term retention. The effort of retrieval is the learning.\n\nSpaced repetition exploits the forgetting curve: review just as you begin to forget, and each review buys you a longer interval.\n\nInterleaving mixes problem types instead of blocking them. It feels harder and slower, and it produces better transfer.\n\nElaboration — asking why and how something works, and connecting it to what you already know — turns isolated facts into a structure you can navigate.\n\nThe common thread is desirable difficulty. If studying feels effortless, it probably is not working.',
9,4.9,'2025-02-04',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

-- SEED CONTENT: news
INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,published_date,is_public_domain)
SELECT 'ai-open-models-2026','Open-Source AI Models Surpass Proprietary Rivals in New Benchmark','news','Artificial Intelligence','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop',
'Community-trained models now match closed labs on reasoning benchmarks, reshaping who owns the future of AI.',
E'For the first time, an openly licensed model has topped a widely-cited reasoning benchmark, edging out closed offerings from major labs.\n\nThe result matters because open weights let researchers audit, fine-tune and deploy models without vendor lock-in — a core pillar of accessible learning.\n\nEducators are already integrating these models into free tutoring tools available to any student with an internet connection.\n\nCritics caution that benchmark scores are an imperfect proxy for real-world usefulness, and that open release raises its own safety questions.',
4,'2026-07-18',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,published_date,is_public_domain)
SELECT 'cybersecurity-passkey-adoption','Passkeys Cross One Billion Users as Passwords Begin to Fade','news','Cybersecurity','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop',
'Phishing-resistant sign-in is going mainstream, and browsers are quietly retiring the password prompt.',
E'Passkeys — cryptographic credentials tied to your device — have crossed a billion active users across the major platforms.\n\nUnlike passwords, a passkey never leaves your device and cannot be phished, because the site never receives a reusable secret.\n\nAdoption has been fastest in consumer apps, while enterprises are moving more slowly due to legacy identity systems.\n\nSecurity researchers describe the shift as the largest practical improvement in account security in two decades.',
3,'2026-07-12',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,published_date,is_public_domain)
SELECT 'open-access-research-mandate','Major Funders Mandate Open Access for All Published Research','news','Science','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop',
'Publicly funded science must now be free to read on the day it is published.',
E'A coalition of research funders has agreed that any work they finance must be freely available at the moment of publication, with no embargo period.\n\nThe policy ends a long-standing arrangement in which taxpayers funded research and then paid again to read it.\n\nPublishers have warned about sustainability; librarians point out that subscription budgets have risen far faster than inflation for thirty years.\n\nFor independent learners, the practical effect is immediate: far more primary literature is now readable without an institutional login.',
4,'2026-06-29',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';

INSERT INTO public.content (slug,title,type,category,author_name,author_id,cover_image_url,excerpt,body_text,read_time_minutes,published_date,is_public_domain)
SELECT 'digital-libraries-expansion','Digital Libraries Add Two Million Public-Domain Titles','news','Education','Freedom Plus Newsroom',a.id,
'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop',
'A coordinated digitisation push has doubled the number of freely readable classic works online.',
E'Volunteer-driven digitisation projects have added roughly two million public-domain titles to open catalogues over the past year.\n\nMuch of the growth comes from non-English collections, which had been badly under-represented.\n\nImproved OCR for historical typefaces and non-Latin scripts made the expansion possible.\n\nFreedom Plus sources its public-domain library from these catalogues, so every book in it can be read in full, for free, forever.',
3,'2026-05-30',true FROM public.authors a WHERE a.slug='freedom-plus-newsroom';