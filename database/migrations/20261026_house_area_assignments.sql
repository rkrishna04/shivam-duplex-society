BEGIN;
CREATE TABLE IF NOT EXISTS house_area_assignments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  society_id uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  house_id bigint NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  committee_term_id bigint NOT NULL REFERENCES committee_terms(id) ON DELETE CASCADE,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until >= valid_from)
);
CREATE INDEX IF NOT EXISTS house_area_active_lookup_idx
  ON house_area_assignments(society_id, house_id, valid_from DESC)
  WHERE valid_until IS NULL;
COMMIT;
