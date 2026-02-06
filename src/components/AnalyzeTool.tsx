 import { useState, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Upload, FileText, Loader2, Brain, AlertCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import AnalysisDashboard from "./AnalysisDashboard";
 
 interface AnalysisResult {
   id: string;
   student_name: string | null;
   file_name: string;
   stress_level: "low" | "moderate" | "high";
   stress_score: number;
   emotional_tone: {
     confidence: number;
     anxiety: number;
     motivation: number;
     overwhelm: number;
     primary_emotion: string;
   };
   workload_indicators: {
     course_count: number;
     assignment_density: string;
     deadline_clustering: boolean;
     extracurricular_load: string;
   };
   performance_trends: {
     overall_trend: string;
     strengths: string[];
     areas_for_improvement: string[];
   };
   engagement_patterns: {
     participation_level: string;
     study_consistency: string;
     time_management: string;
   };
    stress_causes: string[];
    study_schedule: Record<string, { morning: string; afternoon: string; evening: string }>;
    stress_tips: string[];
    health_issues: { issue: string; description: string; severity: "mild" | "moderate" | "severe" }[];
    analysis_summary: string;
    created_at: string;
 }
 
 const AnalyzeTool = () => {
   const [studentName, setStudentName] = useState("");
   const [file, setFile] = useState<File | null>(null);
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
   const [dragActive, setDragActive] = useState(false);
   const { toast } = useToast();
 
   const handleDrag = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     if (e.type === "dragenter" || e.type === "dragover") {
       setDragActive(true);
     } else if (e.type === "dragleave") {
       setDragActive(false);
     }
   }, []);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setDragActive(false);
     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const droppedFile = e.dataTransfer.files[0];
       if (isValidFile(droppedFile)) {
         setFile(droppedFile);
       } else {
         toast({
           title: "Invalid file type",
           description: "Please upload a PDF, DOC, DOCX, or TXT file.",
           variant: "destructive",
         });
       }
     }
   }, [toast]);
 
   const isValidFile = (file: File): boolean => {
     const validTypes = [
       "application/pdf",
       "application/msword",
       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
       "text/plain",
     ];
     return validTypes.includes(file.type) || 
            file.name.endsWith(".pdf") || 
            file.name.endsWith(".doc") || 
            file.name.endsWith(".docx") || 
            file.name.endsWith(".txt");
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       const selectedFile = e.target.files[0];
       if (isValidFile(selectedFile)) {
         setFile(selectedFile);
       } else {
         toast({
           title: "Invalid file type",
           description: "Please upload a PDF, DOC, DOCX, or TXT file.",
           variant: "destructive",
         });
       }
     }
   };
 
    const extractTextContent = async (file: File): Promise<string> => {
      // For text files, read directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        return text.substring(0, 200000); // Limit to ~200k chars
      }
      
      // For PDF and DOC files, extract readable text from raw content
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Only process first 2MB to avoid massive garbled output
      const maxBytes = Math.min(uint8Array.length, 2 * 1024 * 1024);
      let text = "";
      for (let i = 0; i < maxBytes; i++) {
        const char = uint8Array[i];
        if (char >= 32 && char <= 126) {
          text += String.fromCharCode(char);
        } else if (char === 10 || char === 13) {
          text += "\n";
        }
      }
      
      // Clean up the extracted text
      text = text.replace(/[^\x20-\x7E\n]/g, " ")
                 .replace(/\s+/g, " ")
                 .trim()
                 .substring(0, 200000); // Limit final output
      
      if (text.length < 50) {
        return `Academic Portfolio: ${file.name}\n\nNote: This document was uploaded for stress analysis. The system will analyze based on the document structure and any extractable content.\n\n${text}`;
      }
      
      return text;
    };
 
   const handleAnalyze = async () => {
     if (!file) {
       toast({
         title: "No file selected",
         description: "Please upload a portfolio file to analyze.",
         variant: "destructive",
       });
       return;
     }
 
     setIsAnalyzing(true);
     setAnalysisResult(null);
 
     try {
       const fileContent = await extractTextContent(file);
       
       const { data, error } = await supabase.functions.invoke("analyze-portfolio", {
         body: {
           fileContent,
           fileName: file.name,
           studentName: studentName || undefined,
         },
       });
 
       if (error) {
         throw error;
       }
 
       if (data.error) {
         throw new Error(data.error);
       }
 
       setAnalysisResult(data.analysis);
       toast({
         title: "Analysis Complete",
         description: "Your portfolio has been analyzed successfully!",
       });
     } catch (error) {
       console.error("Analysis error:", error);
       toast({
         title: "Analysis Failed",
         description: error instanceof Error ? error.message : "Failed to analyze portfolio. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsAnalyzing(false);
     }
   };
 
   const handleReset = () => {
     setFile(null);
     setStudentName("");
     setAnalysisResult(null);
   };
 
   if (analysisResult) {
     return <AnalysisDashboard analysis={analysisResult} onReset={handleReset} />;
   }
 
   return (
     <section id="analyze" className="py-20 bg-accent/30">
       <div className="container mx-auto px-4">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
         >
           <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
             Analyze Your <span className="text-gradient">Portfolio</span>
           </h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             Upload your academic portfolio and let our AI analyze your stress levels,
             generate personalized study schedules, and provide stress-reduction tips.
           </p>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1 }}
           className="max-w-2xl mx-auto"
         >
           <Card className="border-2 border-dashed border-primary/20 bg-card/50 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Brain className="w-5 h-5 text-primary" />
                 Portfolio Stress Analysis
               </CardTitle>
               <CardDescription>
                 Upload your academic documents to receive AI-powered stress analysis
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               {/* Student Name Input */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">
                   Student Name (Optional)
                 </label>
                 <Input
                   placeholder="Enter your name"
                   value={studentName}
                   onChange={(e) => setStudentName(e.target.value)}
                   className="bg-background"
                 />
               </div>
 
               {/* File Upload Zone */}
               <div
                 className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                   dragActive
                     ? "border-primary bg-primary/5"
                     : file
                     ? "border-green-500 bg-green-500/5"
                     : "border-muted-foreground/25 hover:border-primary/50"
                 }`}
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
               >
                 <input
                   type="file"
                   accept=".pdf,.doc,.docx,.txt"
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <div className="text-center">
                   <AnimatePresence mode="wait">
                     {file ? (
                       <motion.div
                         key="file"
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="flex flex-col items-center gap-3"
                       >
                         <div className="w-16 h-16 rounded-xl bg-green-500/10 flex items-center justify-center">
                           <FileText className="w-8 h-8 text-green-500" />
                         </div>
                         <div>
                           <p className="font-medium text-foreground">{file.name}</p>
                           <p className="text-sm text-muted-foreground">
                             {(file.size / 1024).toFixed(1)} KB
                           </p>
                         </div>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             setFile(null);
                           }}
                         >
                           Remove File
                         </Button>
                       </motion.div>
                     ) : (
                       <motion.div
                         key="upload"
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="flex flex-col items-center gap-3"
                       >
                         <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                           <Upload className="w-8 h-8 text-primary" />
                         </div>
                         <div>
                           <p className="font-medium text-foreground">
                             Drop your portfolio here
                           </p>
                           <p className="text-sm text-muted-foreground">
                             or click to browse • PDF, DOC, DOCX, TXT
                           </p>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>
 
               {/* Info Box */}
               <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50">
                 <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                 <div className="text-sm text-muted-foreground">
                   <p className="font-medium text-foreground mb-1">What we analyze:</p>
                   <ul className="space-y-1">
                     <li>• Emotional tone and anxiety indicators</li>
                     <li>• Workload and deadline patterns</li>
                     <li>• Performance trends and engagement</li>
                     <li>• Time management effectiveness</li>
                   </ul>
                 </div>
               </div>
 
               {/* Analyze Button */}
               <Button
                 onClick={handleAnalyze}
                 disabled={!file || isAnalyzing}
                 className="w-full gradient-hero text-primary-foreground py-6 text-lg font-semibold"
               >
                 {isAnalyzing ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                     Analyzing Portfolio...
                   </>
                 ) : (
                   <>
                     <Brain className="w-5 h-5 mr-2" />
                     Analyze Stress Levels
                   </>
                 )}
               </Button>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </section>
   );
 };
 
 export default AnalyzeTool;