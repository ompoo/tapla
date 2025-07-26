-- Migration: Update voteuser table unique constraint
-- Change from UNIQUE(userid, voteid) to UNIQUE(userlabel, voteid)
-- This prevents multiple participants with the same display name in the same event

-- Step 1: Drop the existing unique constraint
ALTER TABLE voteuser 
DROP CONSTRAINT IF EXISTS voteuser_userid_voteid_key;

-- Step 2: Add the new unique constraint on userlabel and voteid
ALTER TABLE voteuser 
ADD CONSTRAINT voteuser_userlabel_voteid_unique 
UNIQUE (userlabel, voteid);

-- Step 3: Update the corresponding index for performance
-- Drop old index if it exists
DROP INDEX IF EXISTS idx_voteuser_userid_voteid;

-- Create new index for the new unique constraint
CREATE INDEX idx_voteuser_userlabel_voteid ON voteuser(userlabel, voteid);

-- Note: This migration allows the same user (userid) to participate in the same event 
-- with different display names (userlabel), but prevents duplicate display names 
-- within the same event.
