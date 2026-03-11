import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyinterviews, submitAnswer } from '../controllers/interview.Controller.js';



const interviewRouter = express.Router()

interviewRouter.post("/resume",isAuth,upload.single("resume"),
analyzeResume)

interviewRouter.post("/generate-questions",isAuth,generateQuestion)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)

interviewRouter.get("/get-interview",isAuth,getMyinterviews)
interviewRouter.get("/report/:id",isAuth,getInterviewReport)


export default interviewRouter;