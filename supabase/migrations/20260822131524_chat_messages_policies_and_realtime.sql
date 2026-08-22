-- Enable INSERT for messages
CREATE POLICY "Users can insert own messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable UPDATE for messages (only to update read_at)
CREATE POLICY "Users can update received messages" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Add messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
