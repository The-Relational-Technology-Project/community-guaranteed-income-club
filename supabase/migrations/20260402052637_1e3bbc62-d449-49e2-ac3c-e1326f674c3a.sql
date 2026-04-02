
ALTER TABLE public.profiles ADD COLUMN favorite_third_space text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN open_to_in_person boolean DEFAULT false;

ALTER TABLE public.transactions ADD COLUMN sender_open_to_meet boolean DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN receiver_open_to_meet boolean DEFAULT false;
