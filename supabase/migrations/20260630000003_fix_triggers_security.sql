-- Fix trigger permissions by adding SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE programs
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.program_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE programs
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.program_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_program_ratings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_program_id UUID;
  v_avg        NUMERIC(3,2);
  v_count      INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_program_id := OLD.program_id;
  ELSE
    v_program_id := NEW.program_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO v_avg, v_count
  FROM ratings
  WHERE program_id = v_program_id;

  UPDATE programs
  SET average_rating = v_avg, ratings_count = v_count
  WHERE id = v_program_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- Recalculate counts to fix existing data
UPDATE programs p
SET 
  favorites_count = (SELECT COUNT(*) FROM favorites f WHERE f.program_id = p.id),
  ratings_count = (SELECT COUNT(*) FROM ratings r WHERE r.program_id = p.id),
  average_rating = COALESCE((SELECT AVG(rating) FROM ratings r WHERE r.program_id = p.id), 0);
