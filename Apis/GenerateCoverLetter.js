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



 
router.post('/generateCoverLetter', upload.single('resume'), async (req, res) => {
    const jobDescription = req.body.jobDescription;
    const resumeFilePath = req.file.buffer
    try {
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: "You are a Professional career advisor and writer"
                },
                {
                    role: 'user',
                    content: `
    I want you to act as a professional career advisor and cover letter writer. Using the following resume data and job description, create a professional, ATS-friendly cover letter in pure HTML syntax. Do **not include any explanation, code blocks, or markdown formatting** such as \`\`\`html\`, just the HTML content for the body of the cover letter. 

    Follow these specific formatting guidelines:
- identify the sections properly from the resume 
- Use a clean and readable font family, such as Arial, Helvetica, or Times New Roman.
- Set the font size as follows:
    - Name: 24px, bold.
    - Section headers (e.g., Professional Summary, Skills): 16px, bold.
    - Body text: 14px.
    - Contact info: 14px.
    
- Line height (line spacing): 1.2 for readability.
- Use simple bullet points (•) for skills and can be represented in multiple columns based on number of skills 
    - Ensure the cover letter is split into clear sections, such as:
        - Header with name, contact info (email, phone number).
        - Hiring Manager's name or position.
        - Introduction explaining the applicant’s interest in the role.
        - Relevant skills and qualifications from the resume that match the job description.
        - Why the applicant is a strong fit for the role.
        - Conclusion with a call to action (e.g., request for an interview).
    - The cover letter should be designed to look good on both desktop and mobile screens.
    - Avoid using complicated layouts or tables as they might confuse ATS systems.
    - Do not use icons, unusual fonts, or bright colors. Stick to professional, neutral tones (e.g., black, gray, dark blue).
    - Include relevant CSS to make the document visually appealing but avoid excessive design elements.
    - Ensure the HTML structure is clean, with proper usage of semantic tags like <header>, <section>, <h1>, <h2>, <h3>, <ul>, <li>, <p> for text, and appropriate <a> tags for links.
 
    Cover letter content:
    ${resumeFilePath} (resume data)
    ${jobDescription} (job description text)

    - Do not include any other text like html markers or markdowns other than HTML body and styling in the response.
    - Make sure to style the cover letter to fit in A4 size and look good when downloaded.
`
                }
            ]
        });

        const responseData = completion.choices[0].message.content;
        console.log(completion.choices[0].message.content)
        res.send(responseData);
    } catch (error) {
        console.error('Error with OpenAI request:', error);
        res.status(500).json({ error: 'Error generating cover letter' });
    }
});


export default router