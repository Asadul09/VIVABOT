// interview.controller.js
import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js"
import User from "../models/user.model.js"
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }

        const filepath = req.file.path
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages = [
            {
                role: "system",
                content: 
`Extract structured data from resume.
Return strictly JSON in this format:
{
    "role": "string",
    "experience": "string",
    "projects": ["project1", "project2"],
    "skills": ["skill1", "skill2"]
}`
            },
            {
                role: "user",
                content: resumeText
            }
        ];
        
        const aiResponse = await askAi(messages);
        console.log("AI Response:", aiResponse);
        
        const parsed = JSON.parse(aiResponse);
        fs.unlinkSync(filepath);

        res.json({
            role: parsed.role || "",
            experience: parsed.experience || "",
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            resumeText
        });

    } catch (error) {
        console.error("Error in analyzeResume:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: error.message });
    }
};

export const generateQuestion = async (req, res) => {
    try {
        console.log("===== Received Request Body =====");
        console.log(req.body);

        let { role, experience, mode, resumeText, projects, skills } = req.body;

        // Validate required fields
        if (!role || !experience || !mode) {
            console.log("Missing required fields:", { role, experience, mode });
            return res.status(400).json({ 
                message: "Role, Experience and Mode are required",
                received: { role, experience, mode }
            });
        }

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        // Check user credits
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.credits < 50) {
            return res.status(400).json({ message: "Not enough credits. Minimum 50 required." });
        }

        // Format projects and skills
        const projectText = Array.isArray(projects) && projects.length
            ? projects.join(", ")
            : "None";

        const skillsText = Array.isArray(skills) && skills.length
            ? skills.join(", ")
            : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
Role: ${role}
Experience: ${experience}
Interview Mode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume Context: ${safeResume}
        `;

        console.log("Generated Prompt:", userPrompt);

        const messages = [
            {
                role: "system",
                content: `
You are a real human interviewer conducting a professional interview.
Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions based on the candidate's profile.

Strict Rules:
- Each question must be between 10-20 words
- Each question must be a single complete sentence
- Do NOT number them
- Do NOT add any explanation
- Do NOT add extra text before or after
- One question per line only
- Keep language simple and conversational
- Questions must feel practical and realistic

Difficulty progression:
Question 1 -> Easy (Basic concepts)
Question 2 -> Easy (Fundamental understanding)
Question 3 -> Medium (Practical application)
Question 4 -> Medium (Problem-solving)
Question 5 -> Hard (Complex scenario)

Make questions relevant to the candidate's role, experience, interview mode, projects, and skills.
`
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages);
        console.log("AI Questions Response:", aiResponse);

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({ message: "AI returned empty response." });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (questionsArray.length === 0) {
            return res.status(500).json({ message: "AI failed to generate questions." });
        }

        // Deduct credits
        user.credits -= 50;
        await user.save();

        // Create interview in database
        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 120, 150][index],
            }))
        });

        console.log("Interview created:", interview._id);

        // Send response
        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions,  // Note: plural 'questions'
            role: role,
            experience: experience,
            mode: mode
        });

    } catch (error) {
        console.error("Error in generateQuestion:", error);
        return res.status(500).json({ 
            message: `Failed to create interview: ${error.message}` 
        });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const question = interview.questions[questionIndex];

        if (!answer) {
            question.score = 0;
            question.feedback = "You did not submit an answer.";
            question.answer = "";
            await interview.save();
            return res.json({ feedback: question.feedback });
        }

        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            question.answer = answer;
            await interview.save();
            return res.json({ feedback: question.feedback });
        }

        const messages = [
            {
                role: "system",
                content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):
1. Confidence
2. Communication
3. Correctness

Return ONLY valid JSON in this format:
{
    "confidence": number,
    "communication": number,
    "correctness": number,
    "finalScore": number,
    "feedback": "Short human feedback"
}
                `
            },
            {
                role: "user",
                content: `
Question: ${question.question}
Answer: ${answer}
                `
            }
        ];

        const aiResponse = await askAi(messages);
        const parsed = JSON.parse(aiResponse);

        question.answer = answer;
        question.confidence = parsed.confidence;
        question.communication = parsed.communication;
        question.correctness = parsed.correctness;
        question.score = parsed.finalScore;
        question.feedback = parsed.feedback;

        await interview.save();

        return res.status(200).json({ feedback: parsed.feedback });

    } catch (error) {
        console.error("Error in submitAnswer:", error);
        return res.status(500).json({ message: `Failed to submit answer: ${error.message}` });
    }
};

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const totalQuestions = interview.questions.length;
        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = finalScore;
        interview.status = "completed";
        await interview.save();

        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            })),
        });

    } catch (error) {
        console.error("Error in finishInterview:", error);
        return res.status(500).json({ message: `Failed to finish interview: ${error.message}` });
    }
};


export const getMyinterviews = async(req, res)=>{
    try {
        const interviews = await Interview.find({userId:req.userId})
        .sort({createdAt: - 1})
        .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interviews)
    } catch (error) {
        return res.status(500).json({message:`faild to find current user interviw ${error}`})
    }
}

export const getInterviewReport = async(req,res)=>{
    try {
        const interview = await Interview.findById(req.params.id)

        if(!interview){
            return res.status(404).json({message:"Interview not found"});
        }

        const totalQuestions = interview.questions.length;
        
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        return res.json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });
        
    } catch (error) {
        return res.status(500).json({message:`faild to find current
             user interviw report ${error}`})
    }
}