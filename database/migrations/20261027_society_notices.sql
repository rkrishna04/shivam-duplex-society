BEGIN;
CREATE TABLE IF NOT EXISTS society_notices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 society_id uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
 created_by uuid NOT NULL REFERENCES users(id),
 title varchar(160) NOT NULL CHECK(length(title) BETWEEN 3 AND 160),
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 10000),
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS society_notices_published_idx ON society_notices(society_id,published,created_at DESC);
COMMIT;
