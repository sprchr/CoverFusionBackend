import express, { response } from "express";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
import { decode, encode } from "gpt-3-encoder";
dotenv.config();
const upload = multer(); // Initialize multer for file uploads
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});


function mergeArraysByField(arr1, arr2, field) {
  const map = new Map();
  [...arr1, ...arr2].forEach(item => {
    if (item[field]) map.set(item[field], item);
  });
  return Array.from(map.values());
}

// Function to split text into chunks
function splitTextByTokens(text, maxTokens) {
  const tokens = encode(text); // Convert text into tokens
  const chunks = [];
  let start = 0;

  // Split tokens into chunks of maxTokens size
  while (start < tokens.length) {
    const end = Math.min(start + maxTokens, tokens.length);
    const chunk = tokens.slice(start, end); // Extract chunk
    chunks.push(decode(chunk));
    start = end; // Move to the next chunk
  }

  // Decode token chunks back into text
  return chunks
}
function mergeJson(current, updated) {

  return {
    header: {
      name: current.header.name || updated.header?.name || "",
      title: current.header.title || updated.header?.title || "",
      email: current.header.email || updated.header?.email || "",
      phone: current.header.phone || updated.header?.phone || "",
      linkedin: current.header.linkedin || updated.header?.linkedin || "",
      github: current.header.github || updated.header?.github || "",
      address: current.header.address || updated.header?.address || "",
    },
    summary: current.summary || updated.summary,
    skills: Array.from(new Set([...current.skills, ...(updated.skills || [])])),
    education: mergeArraysByField(current.education, updated.education, "degree"),
    experience: mergeArraysByField(current.experience, updated.experience, "title"),
    projects: mergeArraysByField(current.projects, updated.projects, "title"),
    certifications: Array.from(new Set([...current.certifications, ...(updated.certifications || [])])),
    achievements: Array.from(new Set([...current.achievements, ...(updated.achievements || [])])),
    hobbies: current.hobbies || updated.hobbies,
    languages: Array.from(new Set([...current.languages, ...(updated.languages || [])])),
    volunteer: current.volunteer || updated.volunteer,
  };
}


router.post("/resumeBuild", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Parse the uploaded PDF
    const pdfData = await pdfParse(req.file.buffer);
    const fileContent = pdfData.text;

    // Split the text into manageable chunks
    const chunks = splitTextByTokens(fileContent, 4500);

    // Initialize an empty JSON structure
    let currentJson = {
     header:
    {  
      name: "",
      title:"",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      address: ""
    }
      ,
      summary: "",
      skills: [],
      education: [
        {
          degree: "",
          institution: "",
          graduationYear: "",
          gpa: ""
        }
      ],
      experience: [
        {
          title: "",
          company: "",
          duration: "",
          responsibilities: []
        }
      ],
      projects: [
        {
          title: "",
          technologies: [],
          description: ""
        }
      ],
      certifications: [],
      achievements: [],
      hobbies: "",
      languages: [],
      volunteer: ""
    };

    // Process each chunk iteratively and update JSON
    for (const chunk of chunks) {
      
      // Update the prompt to ask OpenAI to improve the resume content
      const prompt = `
        You are a professional resume writer. Your job is to read the following resume content and:
        1. Improve the quality of the content by rephrasing, making it more impactful, and enhancing its professionalism and  enchance the given input resume content 
        Here is the current state of the resume JSON:
        ${JSON.stringify(currentJson)}
        
        Resume content:
        "${chunk}"
       - Provide the full explanation or content with as much detail as possible. I don't want a summary but a comprehensive response
       - In the certifications section, ensure certifications are listed as an array of strings, not as objects. Each string should all the information of certification
       - If the data is not provided leave the field as given

       Based on the above, provide the updated resume in the same JSON format as shown above. Do not add any additional information, formatting, or explanation.

      
       Do not provide any information other that JSON object
       exclude any response format(JSON) in output
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional career advisor and resume writer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
        // console.log("response",completion.choices[0].message.content)
      // Update the current JSON with the new response
      const updatedJson = JSON.parse(completion.choices[0].message.content);
      // const cleanedJson = cleanJson(updatedJson);
      // Merge the updated JSON with the current JSON to gradually build the final resume
      currentJson = mergeJson(currentJson, updatedJson);
      // console.log("Updated JSON:", currentJson);
    }

    // Send the final JSON response
    res.json(currentJson);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error processing resume" });
  }
});


// Function to merge two JSON objects


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
                  "name": "",
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
    // console.log(completion.choices[0].message.content);
    res.send(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    res.status(500).json({ error: "Error generating cover letter" });
  }
});
export default router;
