-- voteとuserの間に中間テーブル voteuser を作成するマイグレーション

-- 1. voteuser テーブルを作成（シンプル構造）
CREATE TABLE voteuser (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  userlabel VARCHAR NOT NULL, -- 参加者表示名
  voteid UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE, -- イベントID（投票ID）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userid, voteid) -- 同じユーザーが同じイベントに複数回参加登録することを防ぐ
);

-- 2. voteuserテーブル用のインデックスを作成
CREATE INDEX idx_voteuser_userid ON voteuser(userid);
CREATE INDEX idx_voteuser_voteid ON voteuser(voteid);
CREATE INDEX idx_voteuser_userid_voteid ON voteuser(userid, voteid);

-- 3. votesテーブルを更新して voteuser_id を追加
ALTER TABLE votes ADD COLUMN voteuser_id UUID REFERENCES voteuser(id) ON DELETE CASCADE;

-- 4. votesテーブルの既存の user_id カラムを削除する前に、既存データを voteuser に移行
-- 既存の votes データから unique な (user_id, event_id) の組み合わせを voteuser テーブルに挿入
INSERT INTO voteuser (userid, voteid, userlabel)
SELECT DISTINCT 
  v.user_id,
  v.event_id,
  COALESCE(u.name, 'ユーザー') as userlabel
FROM votes v
JOIN users u ON v.user_id = u.id
ON CONFLICT (userid, voteid) DO NOTHING;

-- 5. 既存の votes レコードに voteuser_id を設定
UPDATE votes 
SET voteuser_id = vu.id
FROM voteuser vu
WHERE votes.user_id = vu.userid 
AND votes.event_id = vu.voteid;

-- 6. voteuser_id が NULL のレコードがないことを確認（安全チェック）
-- もし NULL があれば、エラーが発生して処理が停止します
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM votes WHERE voteuser_id IS NULL) THEN
    RAISE EXCEPTION 'Some votes records do not have corresponding voteuser records';
  END IF;
END $$;

-- 7. voteuser_id を NOT NULL に変更
ALTER TABLE votes ALTER COLUMN voteuser_id SET NOT NULL;

-- 8. 古い user_id カラムのみを削除（event_id は残す）
ALTER TABLE votes DROP COLUMN user_id;

-- 9. votesテーブルの新しいユニーク制約を追加
-- 同じ voteuser が同じ日時スロットに重複投票することを防ぐ
ALTER TABLE votes ADD CONSTRAINT unique_voteuser_slot 
UNIQUE(voteuser_id, event_date_id, event_time_id);

-- 10. votesテーブルの新しいインデックスを作成
CREATE INDEX idx_votes_voteuser_id ON votes(voteuser_id);

-- 11. 古いインデックスを削除（event_id のインデックスは残す）
DROP INDEX IF EXISTS idx_votes_user_id;
DROP INDEX IF EXISTS idx_votes_event_user;

-- 12. 依存するビューとマテリアライズドビューを削除（CASCADE使用）
DROP MATERIALIZED VIEW IF EXISTS event_vote_statistics CASCADE;

-- 13. マテリアライズドビューを再作成（直接 event_id を使用するように）
CREATE MATERIALIZED VIEW event_vote_statistics AS
SELECT 
  v.event_id,
  v.event_date_id,
  v.event_time_id,
  ed.date_label,
  ed.column_order,
  et.time_label,
  et.row_order,
  COUNT(*) as total_votes,
  COUNT(CASE WHEN v.is_available = true THEN 1 END) as available_votes,
  COUNT(CASE WHEN v.is_available = false THEN 1 END) as unavailable_votes,
  ROUND(
    COUNT(CASE WHEN v.is_available = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as availability_percentage
FROM votes v
JOIN event_dates ed ON v.event_date_id = ed.id
JOIN event_times et ON v.event_time_id = et.id
GROUP BY v.event_id, v.event_date_id, v.event_time_id, ed.date_label, ed.column_order, et.time_label, et.row_order;

-- 14. マテリアライズドビューのインデックスを再作成
CREATE UNIQUE INDEX idx_vote_statistics_event_date_time ON event_vote_statistics(event_id, event_date_id, event_time_id);

-- 15. event_table_grid ビューを再作成
CREATE VIEW event_table_grid AS
SELECT 
  ed.event_id,
  ed.date_label,
  ed.column_order,
  et.time_label,
  et.row_order,
  ed.id as event_date_id,
  et.id as event_time_id,
  ts.slot_key, -- 一意識別子
  -- 投票統計も含める（リアルタイム表示用）
  COALESCE(evs.total_votes, 0) as total_votes,
  COALESCE(evs.available_votes, 0) as available_votes,
  COALESCE(evs.unavailable_votes, 0) as unavailable_votes,
  COALESCE(evs.availability_percentage, 0) as availability_percentage
FROM event_dates ed
CROSS JOIN event_times et
LEFT JOIN time_slots ts ON 
  ts.event_id = ed.event_id 
  AND ts.event_date_id = ed.id 
  AND ts.event_time_id = et.id
LEFT JOIN event_vote_statistics evs ON 
  evs.event_date_id = ed.id AND evs.event_time_id = et.id
WHERE ed.event_id = et.event_id
ORDER BY ed.column_order, et.row_order;

-- 16. マテリアライズドビューの更新トリガーを再作成
DROP TRIGGER IF EXISTS trigger_refresh_vote_statistics ON votes;
CREATE TRIGGER trigger_refresh_vote_statistics
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_vote_statistics();
