
import express from 'express'
import multer from 'multer';
import cors from 'cors'
import dotenv from 'dotenv';
import OpenAI from "openai";
import PdfParse from 'pdf-parse';


dotenv.config();
const app = express()

const storage = multer.memoryStorage();  
const upload = multer({ storage: storage });

app.use(cors());
app.get('/', (req, res) => {
    res.send('Welcome to the API server!');
});

const openai = new OpenAI({
    apiKey:process.env.OpenAI_API_KEY,
});

async function extractText (buffer) {
    const parse = await PdfParse(buffer);  // Directly parse the buffer
    return parse.text;
}

app.post('/api/generateCoverLetter', upload.single('resume'), async (req, res) => {
    const jobDescription = req.body.jobDescription;
    const resume = await extractText(req.file.buffer);
   
    // console.log(jobDescription)
    console.log(req.file)
    
    try {
        const completion = await openai.chat.completions.create({
            model:'gpt-4o-mini',
            messages: [
                {
                    "role": 'system',
                    "content": "You are a Professional career advisor and writer"
                },
                {
                    "role": "user",
                    "content": `
                        I want you to act as a professional career advisor and writer. Using the following resume and job description, create a compelling and personalized cover letter tailored to the job posting. The tone should be professional yet engaging. Highlight the candidate's most relevant skills and experiences that align with the job requirements.
                        ${resume}
                        ${jobDescription}
                        The cover letter should include:
                        1. A clear introduction that mentions the job title and expresses enthusiasm for the role.
                        2. A middle section that highlights the candidate's key qualifications, experiences, and skills that match the job description.
                        3. A concluding paragraph with a strong call to action, such as expressing interest in discussing the role further.
                        Make the cover letter concise, no longer than 250 words, and free of grammar errors.
                        Please ensure the response includes  line breaks <br> and paragraphs <p> tags to ensure the text displays correctly 
                        do not provide the type of data with the response like html or plaintext  
                                          `
                }
            ]
        })
        const responseData = completion.choices[0].message.content
        // console.log(responseData)
         res.send(responseData)
        } catch (error) {
            console.error('Error with OpenAI request:', error);
            console.error(error.stack);  // Log the full error stack trace
            res.status(500).json({ error: 'Error generating cover letter' });
        }
})




const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});