-- Run before deploying the video duration cache.
ALTER TABLE public.videos
    ADD COLUMN IF NOT EXISTS duration_seconds double precision
    CHECK (duration_seconds > 0 AND duration_seconds < 'Infinity'::double precision);

CREATE OR REPLACE FUNCTION public.clear_video_duration_on_url_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.url IS DISTINCT FROM OLD.url THEN
        NEW.duration_seconds := NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clear_video_duration_on_url_change ON public.videos;
CREATE TRIGGER clear_video_duration_on_url_change
    BEFORE UPDATE OF url ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.clear_video_duration_on_url_change();
