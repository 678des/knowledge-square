INSERT INTO subjects_new (id, name, user_id, color, created_at)
SELECT id, name, user_id, color, created_at
FROM subjects;

INSERT INTO study_notes_new (id,subject_id,ai_summary,updated_at)
SELECT id,subject_id,ai_summary,updated_at
FROM study_notes;


INSERT INTO messages_new (room_id, role, content, created_at)
SELECT
  cr.id AS room_id,
  (elem->>'role')::message_role
  elem->>'content' AS content,
  NOW() AS created_at
FROM study_notes sn
JOIN chat_rooms_new cr ON sn.subject_id = cr.subject_id
CROSS JOIN LATERAL jsonb_array_elements(sn.all_chat_log) AS elem;
