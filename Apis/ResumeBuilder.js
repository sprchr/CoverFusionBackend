import express from 'express'
import multer from 'multer';
import OpenAI from "openai";
import dotenv from 'dotenv' 

dotenv.config()
const upload = multer(); // Initialize multer for file uploads
const router = express.Router();

const openai = new OpenAI({
    apiKey:process.env.OpenAI_API_KEY,
});


  

router.post('/resumeBuild', upload.single('resume'), async (req, res) => {
  console.log(req.file)
  if (!req.file) return 
      const filePath = req.file?.buffer
    try {
      // Call OpenAI API with the file content
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a professional career advisor and resume writer."
          },
          {
            role: 'user',
            content: `
    I want you to act as a professional career advisor and resume writer. Using the following resume file, create a professional, ATS-friendly resume in pure HTML syntax. Do **not include any explanation, code blocks, or markdown formatting** such as \`\`\`html\`, just the HTML content for the body of the resume.

Follow these specific formatting guidelines:
- identify the sections properly from the resume 
- Use a clean and readable font family, such as Arial, Helvetica, or Times New Roman.
- Set the font size as follows:
    - Name: 24px, bold.
    - Section headers (e.g., Professional Summary, Skills): 16px, bold.
    - Body text: 14px.
    - Contact info: 14px.

- Line height (line spacing): 1.2 for readability.
- Use simple bullet points (•) for skills and can be represented in multiple columns based on number of skills .
- Ensure the resume is split into clear sections, such as:
    - Header with name, contact info (email, GitHub, portfolio).
    - Professional Summary.
    - Skills
    - Work Experience.
    - Education.
    - Certifications (if applicable).
    - projects
- Only include data present in given resume in the response
- The resume should be designed to look good on both desktop and mobile screens.
- Avoid using complicated layouts or tables as they might confuse ATS systems.
- Do not use icons, unusual fonts, or bright colors. Stick to professional, neutral tones (e.g., black, gray, dark blue).
- use the below CSS to make the document visually appealing but avoid excessive design elements.
 <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 30px;
            font-size: 14px;
            line-height: 1.2;
            color: black;
        }
        h1 {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
        }
        h2 {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
        }
        h3 {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
        }
        h4 {
            font-size: 14px;
            font-weight: bold;
            margin: 5px;
        }
        p, ul, li {
            margin: 0;
            padding: 0;
        }
        ul {
            list-style-type: none;
            padding-left: 0;
        }
        .contact-info {
            display: flex;
          flex-wrap: wrap; 
           justify-content: center;
font-size: 14px;
margin-top: 5px;
margin-bottom: 10px;
gap: 10px; 

        }
        .section {
            margin-top: 10px;
            border-top: 1px solid #ccc;
        
        }
        .skills {
            column-count: 2;
            column-gap: 20px;
        }
        .skills li {
            break-inside: avoid;
        }
    </style>
- Ensure the HTML structure is clean, with proper usage of semantic tags like <header>, <section>, <h1>, <h2>, <h3>, <ul>, <li>, <p> for text, and appropriate <a> tags for links.
 
Resume content:
${filePath}

 - do not include any other text like html markers or markdowns  other than html body and styling in the response
 - make sure to style the resume to fit in A4size and looks good when downloaded
            `
            
          }
        ]
      });
  
      // Extract and return the generated HTML
      console.log(completion.choices[0].message.content)
      res.send(completion.choices[0].message.content)
    } catch (error) {
        console.error('Error with OpenAI request:', error);
        res.status(500).json({ error: 'Error generating cover letter' })
    }
});

export default router