-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

-- Recreate policy to explicitly allow public inserts (anon + authenticated)
CREATE POLICY "Allow public inserts" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);
