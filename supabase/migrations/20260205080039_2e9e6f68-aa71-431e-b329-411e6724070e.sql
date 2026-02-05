-- Create enum for stress levels
CREATE TYPE public.stress_level AS ENUM ('low', 'moderate', 'high');

-- Create table for storing portfolio analyses
CREATE TABLE public.portfolio_analyses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT,
    file_name TEXT NOT NULL,
    file_content TEXT NOT NULL,
    stress_level stress_level NOT NULL DEFAULT 'low',
    stress_score INTEGER DEFAULT 0,
    emotional_tone JSONB DEFAULT '{}',
    workload_indicators JSONB DEFAULT '{}',
    performance_trends JSONB DEFAULT '{}',
    engagement_patterns JSONB DEFAULT '{}',
    stress_causes JSONB DEFAULT '[]',
    study_schedule JSONB DEFAULT '{}',
    stress_tips JSONB DEFAULT '[]',
    analysis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write (since this is a demo without auth)
CREATE POLICY "Anyone can view analyses" 
ON public.portfolio_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analyses" 
ON public.portfolio_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update analyses" 
ON public.portfolio_analyses 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete analyses" 
ON public.portfolio_analyses 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_portfolio_analyses_updated_at
BEFORE UPDATE ON public.portfolio_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);

-- Create storage policies
CREATE POLICY "Portfolio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolios');

CREATE POLICY "Anyone can upload portfolio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolios');

CREATE POLICY "Anyone can delete portfolio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolios');