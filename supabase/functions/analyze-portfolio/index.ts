 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const STRESS_ANALYSIS_PROMPT = `You are an expert academic stress analyst and educational psychologist. Analyze the following student portfolio content and provide a comprehensive stress assessment.
 
 Your analysis must include:
 
 1. **Stress Level Classification**: Classify as "low", "moderate", or "high" based on:
    - Workload indicators (course load, assignments, deadlines)
    - Emotional tone in writing (anxiety, confidence, overwhelm)
    - Performance trends (grades, improvement/decline patterns)
    - Engagement patterns (participation, activity levels)
 
 2. **Stress Score**: Provide a numerical score from 0-100 (0=no stress, 100=extreme stress)
 
 3. **Emotional Tone Analysis**: Identify emotional indicators like:
    - Confidence level (0-100)
    - Anxiety level (0-100)
    - Motivation level (0-100)
    - Overwhelm indicators
 
 4. **Workload Indicators**: Identify:
    - Number of courses/subjects mentioned
    - Assignment density
    - Deadline clustering
    - Extracurricular commitments
 
 5. **Performance Trends**: Analyze:
    - Grade patterns if mentioned
    - Improvement or decline indicators
    - Academic strengths and weaknesses
 
 6. **Engagement Patterns**: Assess:
    - Class participation indicators
    - Study habits mentioned
    - Time management hints
 
 7. **Key Stress Causes**: List 3-5 specific causes based on the content (e.g., "Heavy exam schedule in April", "Multiple project deadlines overlapping")
 
 8. **Personalized Study Schedule**: Create a weekly study plan with:
    - Daily time blocks
    - Subject prioritization
    - Break recommendations
    - Review sessions
 
9. **Stress Reduction Tips**: Provide 5-7 actionable tips tailored to the detected stress causes, including:
    - Time management strategies
    - Study techniques
    - Relaxation methods
    - Healthy academic habits

  10. **Health Issues**: Identify 3-6 potential health issues that could arise from the detected stress level and causes, such as:
    - Physical health effects (headaches, insomnia, fatigue, muscle tension, weakened immunity)
    - Mental health effects (anxiety disorders, depression, burnout, difficulty concentrating)
    - Behavioral effects (social withdrawal, appetite changes, substance use risk)
    - Each health issue should include the issue name and a brief explanation of how the student's specific stress factors could lead to it
  
  11. **Analysis Summary**: A 2-3 sentence summary of the overall assessment.
 
 Respond with a valid JSON object using this exact structure:
 {
   "stress_level": "low" | "moderate" | "high",
   "stress_score": number,
   "emotional_tone": {
     "confidence": number,
     "anxiety": number,
     "motivation": number,
     "overwhelm": number,
     "primary_emotion": string
   },
   "workload_indicators": {
     "course_count": number,
     "assignment_density": "low" | "moderate" | "high",
     "deadline_clustering": boolean,
     "extracurricular_load": "minimal" | "moderate" | "heavy"
   },
   "performance_trends": {
     "overall_trend": "improving" | "stable" | "declining",
     "strengths": string[],
     "areas_for_improvement": string[]
   },
   "engagement_patterns": {
     "participation_level": "low" | "moderate" | "high",
     "study_consistency": "irregular" | "moderate" | "consistent",
     "time_management": "poor" | "fair" | "good" | "excellent"
   },
   "stress_causes": string[],
   "study_schedule": {
     "monday": { "morning": string, "afternoon": string, "evening": string },
     "tuesday": { "morning": string, "afternoon": string, "evening": string },
     "wednesday": { "morning": string, "afternoon": string, "evening": string },
     "thursday": { "morning": string, "afternoon": string, "evening": string },
     "friday": { "morning": string, "afternoon": string, "evening": string },
     "saturday": { "morning": string, "afternoon": string, "evening": string },
     "sunday": { "morning": string, "afternoon": string, "evening": string }
   },
    "stress_tips": string[],
    "health_issues": [
      { "issue": string, "description": string, "severity": "mild" | "moderate" | "severe" }
    ],
    "analysis_summary": string
 }`;
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { fileContent, fileName, studentName } = await req.json();
 
     if (!fileContent) {
       return new Response(
         JSON.stringify({ error: "File content is required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      // Truncate content to avoid exceeding token limits (~4 chars per token, limit to ~200k tokens worth)
      const MAX_CONTENT_CHARS = 500000;
      const truncatedContent = fileContent.length > MAX_CONTENT_CHARS
        ? fileContent.substring(0, MAX_CONTENT_CHARS) + "\n\n[Content truncated due to length...]"
        : fileContent;

      console.log(`Processing file: ${fileName}, content length: ${fileContent.length}, truncated to: ${truncatedContent.length}`);

      // Call Lovable AI Gateway for analysis
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: STRESS_ANALYSIS_PROMPT },
            { 
              role: "user", 
              content: `Please analyze the following student portfolio content:\n\nStudent Name: ${studentName || "Anonymous"}\nFile Name: ${fileName}\n\nContent:\n${truncatedContent}` 
            },
          ],
        }),
      });
 
     if (!aiResponse.ok) {
       if (aiResponse.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       if (aiResponse.status === 402) {
         return new Response(
           JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
           { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       const errorText = await aiResponse.text();
       console.error("AI Gateway error:", aiResponse.status, errorText);
       throw new Error(`AI Gateway error: ${aiResponse.status}`);
     }
 
     const aiData = await aiResponse.json();
     const analysisContent = aiData.choices?.[0]?.message?.content;
 
     if (!analysisContent) {
       throw new Error("No analysis content received from AI");
     }
 
     // Parse the JSON response from AI
     let analysis;
     try {
       // Extract JSON from the response (handle markdown code blocks if present)
       const jsonMatch = analysisContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, analysisContent];
       const jsonStr = jsonMatch[1] || analysisContent;
       analysis = JSON.parse(jsonStr.trim());
     } catch (parseError) {
       console.error("Failed to parse AI response:", analysisContent);
       throw new Error("Failed to parse AI analysis response");
     }
 
     // Store the analysis in the database
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     const { data: savedAnalysis, error: dbError } = await supabase
       .from("portfolio_analyses")
       .insert({
         student_name: studentName || null,
         file_name: fileName,
         file_content: fileContent.substring(0, 50000), // Limit stored content
         stress_level: analysis.stress_level,
         stress_score: analysis.stress_score,
         emotional_tone: analysis.emotional_tone,
         workload_indicators: analysis.workload_indicators,
         performance_trends: analysis.performance_trends,
         engagement_patterns: analysis.engagement_patterns,
         stress_causes: analysis.stress_causes,
         study_schedule: analysis.study_schedule,
          stress_tips: analysis.stress_tips,
          health_issues: analysis.health_issues,
          analysis_summary: analysis.analysis_summary,
       })
       .select()
       .single();
 
     if (dbError) {
       console.error("Database error:", dbError);
       throw new Error("Failed to save analysis to database");
     }
 
     return new Response(
       JSON.stringify({ success: true, analysis: savedAnalysis }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("analyze-portfolio error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });