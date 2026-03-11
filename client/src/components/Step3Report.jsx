import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report ...</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

 
  const calculateAverageScore = (key) => {
    if (!questionWiseScore.length) return 0;
    const sum = questionWiseScore.reduce((acc, q) => acc + (q[key] || 0), 0);
    return Number((sum / questionWiseScore.length).toFixed(1));
  };

  
  const communicationScore = communication > 0 
    ? Number(communication) 
    : calculateAverageScore('confidence'); 

  const confidenceScore = confidence > 0 
    ? Number(confidence) 
    : calculateAverageScore('confidence');

  const correctnessScore = correctness > 0 
    ? Number(correctness) 
    : calculateAverageScore('correctness');

  console.log("Calculated scores:", { 
    confidence: confidenceScore, 
    communication: communicationScore, 
    correctness: correctnessScore 
  });

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidenceScore },
    { label: "Communication", value: communicationScore },
    { label: "Correctness", value: correctnessScore },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = ()=>{
    const doc = new jsPDF("p","mm","a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    doc.setFont("helvetica","bold");
    doc.setFontSize(20);
    doc.setTextColor(34,197,94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align:"center",
    });
    currentY += 5;

    doc.setDrawColor(34,197,94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    doc.setFillColor(240,253,244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0,0,0);
    doc.text(
      `Final Score : ${finalScore}/10`,
      pageWidth / 2,
      currentY + 12,
      { align: "center" }
    );

    currentY += 30;

    doc.setFillColor(249,250,251);
    doc.roundedRect(margin, currentY, contentWidth, 40, 4, 4, "F");
    doc.setFontSize(12);

    doc.text(`Confidence: ${confidenceScore}`, margin + 10, currentY + 12);
    doc.text(`Communication: ${communicationScore}`, margin + 10, currentY + 22);
    doc.text(`Correctness: ${correctnessScore}`, margin + 10, currentY + 32);
    currentY += 55;

    let advice = "";
    if (finalScore >= 8) {
      advice = "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real world examples.";
    } else if (finalScore >= 5) {
      advice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice = "Significant improvement required. Focus on structured thinking, clarity and confident delivery. Practice answering aloud regularly.";
    }

    doc.setFillColor(255,255,255);
    doc.setDrawColor(200);
    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont("helvetica","bold");
    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);
    currentY += 50;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Confidence", "Correctness", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question || "Question not available",
        `${q.score || 0}/10`,
        `${q.confidence || 0}/10`,
        `${q.correctness || 0}/10`,
        q.feedback || "No feedback available",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: "top",
      },
      headStyles: {
        fillColor: [34,197,97],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: "auto" }
      },
      alternateRowStyles: {
        fillColor: [249,250,251],
      }
    });

    doc.save("AI_Interview_Report.pdf");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="md:mb-10 w-full flex items-start gap-4">
          <button
            onClick={() => navigate("/history")}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview Analytic Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              AI-Powered performance insights
            </p>
          </div>
        </div>

        <button 
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 sm:px-8 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center"
          >
            <h3 className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
              Overall Performance
            </h3>
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: "#10b981",
                  textColor: "#374151",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>
            <p className="text-gray-400 mt-2 text-xs sm:text-sm">Out of 10</p>

            <div className="mt-4">
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                {performanceText}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {shortTagline}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Skills Evaluation
            </h3>
            <div className="space-y-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-sm sm:text-base">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="font-semibold text-emerald-600">
                      {s.value}/10
                    </span>
                  </div>

                  <div className="bg-gray-200 h-2 sm:h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-5 sm:p-8"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-gray-700 mb-4 sm:mb-6">
              Performance Trend
            </h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={questionScoreData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis domain={[0, 10]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fill="url(#scoreGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Question Breakdown 
            </h3>
            <div className="space-y-6">
              {questionWiseScore.map((q, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">
                        Question {i + 1}
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        C: {q.confidence ?? 0}
                      </div>
                      <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                        S: {q.score ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-emerald-600 font-semibold mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                      AI Feedback
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback 
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;