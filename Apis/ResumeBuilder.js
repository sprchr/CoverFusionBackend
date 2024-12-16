import express, { response } from "express";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
import KafkaConfig from "../kfaka/config.js";
dotenv.config();
const upload = multer(); // Initialize multer for file uploads
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});
router.post("/resumeBuild", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Step 1: Parse PDF and divide into chunks
    const pdfData = await pdfParse(req.file.buffer);
    const fileContent = pdfData.text;
    const chunkSize = 3000; // Keep chunks small to avoid OpenAI token limits
    const chunks = fileContent.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];

    // Step 2: Send chunks to Kafka
    const kafkaConfig = new KafkaConfig();
    const messages = chunks.map((chunk, index) => ({
      key: `chunk-${index}`,
      value: chunk,
    }));
    await kafkaConfig.producer("resume-topic", messages);

    // Step 3: Consume and process chunks from Kafka
    let processedChunks = [];
    await kafkaConfig.consume("resume-topic", async (chunk) => {
      // Process each chunk individually with OpenAI
      console.log("chunks are :",chunk);

      
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4o-mini",
      //   messages: [
      //     {
      //       role: "system",
      //       content: "You are a professional career advisor and resume writer.",
      //     },
      //     {
      //       role: "user",
      //       content: `Here is a section of my resume. Improve it to make it professional and ATS-friendly: ${chunk}

      //        provide the response in below Json format if the data is not present then return null value for the object
      //         {
      //           "header": {
      //             "fullName": "",
      //             "title": "",
      //             "email": "",
      //             "phone": "",
      //             "linkedin": "",
      //             "github": "",
      //             "location": ""
      //           },
      //           "summary": "",
      //           "skills": [],
      //           "education": [
      //             {
      //               "degree": "",
      //               "institution": "",
      //               "graduationYear": "",
      //               "gpa": ""
      //             }
      //           ],
      //           "experience": [
      //             {
      //               "title": "",
      //               "company": "",
      //               "duration": "",
      //               "responsibilities": []
      //             }
      //           ],
      //           "projects": [
      //             {
      //               "title": "",
      //               "technologies": [],
      //               "description": ""
      //             }
      //           ],
      //           "certifications": [],
      //           "achievements": [],
      //           "hobbies": "",
      //           "languages": [],
      //           "volunteer": ""
      //         }
              
             
      //       `,
      //     },
      //   ],
      // });

      // const response = completion.choices[0].message.content;
      // console.log("chunks response",response)
      // processedChunks.push(response);

      // // If all chunks are processed, finalize the response
      // if (processedChunks.length === chunks.length) {
      //   const finalOutput = processedChunks.join("\n");

      //   // Step 4: Make a final request to OpenAI for consolidation
      //   const finalCompletion = await openai.chat.completions.create({
      //     model: "gpt-4o-mini",
      //     messages: [
      //       {
      //         role: "system",
      //         content: "You are a professional career advisor and resume writer.",
      //       },
      //       {
      //         role: "user",
      //         content: `Consolidate the following improved resume sections into a single professional and ATS-friendly resume:\n${finalOutput}`,
      //       },
      //     ],
      //   });

      //   const finalResponse = finalCompletion.choices[0].message.content;
     
        
      //   // Send the final improved resume to the client
      //   res.send(finalResponse);
    // }
    });
    res.send(processedChunks)
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error processing resume" });
  }
});


router.post("/editResume", upload.single("resume"), async (req, res) => {
  const filePath = JSON.stringify(req.body);
  console.log(filePath);
  try {
    // Call OpenAI API with the file content
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor and resume writer.",
        },

        {
          role: "user",
          content: `
              I want you to help me upgrade my resume. I will provide you with my current resume as a JSON object, and I would like you to improve it in the following ways:
              - Ensure that the resume is more professional and ATS-friendly.
              - Use concise and impactful language for responsibilities and achievements.
              - Use proper grammar and punctuation in the resume.
              - Focus on highlighting key strengths and accomplishments, removing any irrelevant or redundant information.
              - do not create new resume for any request 
              Please provide the updated version of my resume, formatted as a JSON object.
              
              {
                "header": {
                  "fullName": "",
                  "title": "",
                  "email": "",
                  "phone": "",
                  "linkedin": "",
                  "github": "",
                  "location": ""
                },
                "summary": "",
                "skills": [],
                "education": [
                  {
                    "degree": "",
                    "institution": "",
                    "graduationYear": "",
                    "gpa": ""
                  }
                ],
                "experience": [
                  {
                    "title": "",
                    "company": "",
                    "duration": "",
                    "responsibilities": []
                  }
                ],
                "projects": [
                  {
                    "title": "",
                    "technologies": [],
                    "description": ""
                  }
                ],
                "certifications": [],
                "achievements": [],
                "hobbies": "",
                "languages": [],
                "volunteer": ""
              }
              
              The details of my resume as a JSON format/object are: ${filePath}
              Please generate the improved resume based on the provided data. Do not include any explanations or response format such as "JSON".
              `,
        },
      ],
    });

    // Extract and return the generated HTML
    console.log(completion.choices[0].message.content);
    res.send(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    res.status(500).json({ error: "Error generating cover letter" });
  }
});
export default router;
