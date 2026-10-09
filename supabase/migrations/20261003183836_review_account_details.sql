-- Additive metadata for the approved review UI. Existing app columns and RLS stay unchanged.
ALTER TABLE public.journeys ADD COLUMN review_details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.journeys ADD CONSTRAINT journeys_review_details_object CHECK (jsonb_typeof(review_details) = 'object' AND octet_length(review_details::text) <= 262144);
ALTER TABLE public.memories ADD COLUMN review_details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.memories ADD CONSTRAINT memories_review_details_object CHECK (jsonb_typeof(review_details) = 'object' AND octet_length(review_details::text) <= 262144);
COMMENT ON COLUMN public.journeys.review_details IS 'Owner-private review presentation metadata and retained cover paths. Governed by existing journey RLS.';
COMMENT ON COLUMN public.memories.review_details IS 'Owner-private legacy messages, location identity and immutable photo-version paths. Never store signed URLs or image bytes here.';
