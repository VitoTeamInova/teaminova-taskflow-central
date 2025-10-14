-- Create error_logs table for tracking application errors
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('auth', 'database', 'api', 'ui', 'network', 'validation', 'unknown')),
  message TEXT NOT NULL,
  stack TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Administrators can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "System can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Administrators can update error logs"
  ON public.error_logs
  FOR UPDATE
  USING (has_role(auth.uid(), 'administrator'::app_role));

-- Create index for better performance
CREATE INDEX idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);