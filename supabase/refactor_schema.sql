CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE chat_mode AS ENUM ('study', 'review', 'chat');


CREATE TABLE subjects_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE chat_rooms_new(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects_new(id) ON DELETE CASCADE,
    mode chat_mode NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages_new(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms_new(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE study_notes_new(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects_new(id) ON DELETE CASCADE,
    ai_summary TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE INDEX messages_room_id_created_at_idx
ON messages_new(room_id, created_at DESC);


CREATE OR REPLACE FUNCTION create_default_note_obj()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- study モード
  INSERT INTO chat_rooms_new (subject_id, mode)
  VALUES (NEW.id, 'study'::chat_mode);

  -- review モード
  INSERT INTO chat_rooms_new (subject_id, mode)
  VALUES (NEW.id, 'review'::chat_mode);

  INSERT INTO study_notes_new (subject_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;


CREATE TRIGGER subjects_create_chat_rooms_new
AFTER INSERT ON subjects_new
FOR EACH ROW
EXECUTE PROCEDURE create_default_note_obj();


-- 権限
-- subjects
CREATE POLICY "Users can read their own subjects"
ON subjects_new
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

CREATE POLICY "Users can insert their own subjects"
ON subjects_new
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can update their own subjects"
ON subjects_new
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can delete their own subjects"
ON subjects_new
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-- messages
CREATE POLICY "Users can read their own messages"
ON messages_new
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms_new
    WHERE chat_rooms_new.id = messages_new.room_id
    AND chat_rooms_new.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own messages"
ON messages_new
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms_new
    WHERE chat_rooms_new.id = messages_new.room_id
    AND chat_rooms_new.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON messages_new
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms_new
    WHERE chat_rooms_new.id = messages_new.room_id
    AND chat_rooms_new.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms_new
    WHERE chat_rooms_new.id = messages_new.room_id
    AND chat_rooms_new.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own messages"
ON messages_new
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms_new
    WHERE chat_rooms_new.id = messages_new.room_id
    AND chat_rooms_new.user_id = auth.uid()
  )
);


--rooms
CREATE POLICY "Users can read their own chat rooms"
ON chat_rooms_new
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

CREATE POLICY "Users can insert their own chat rooms"
ON chat_rooms_new
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can update their own chat rooms"
ON chat_rooms_new
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can delete their own chat rooms"
ON chat_rooms_new
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

