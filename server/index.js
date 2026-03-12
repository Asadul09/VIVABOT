import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';

dotenv.config();

const app = express();

/* CORS CONFIGURATION (important for Vercel frontend) */
app.use(cors({
   origin: "https://vivabot-lake.vercel.app",
   credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE"]
}));

/* Allow preflight requests */
app.options("*", cors());

/* Increase request size limit (important for resume PDF upload) */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

/* ROUTES */
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/interview', interviewRouter);

/* Root route (helps Render keep server alive and test API) */
app.get("/", (req, res) => {
   res.send("VivaBot API is running 🚀");
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, async () => {
   console.log(`Server is running on port ${PORT}`);
   await connectDb();
});
