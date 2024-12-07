import express from 'express'
import cors from 'cors'
import generateCoverLetter from './Apis/GenerateCoverLetter.js'
import resumeBuild from './Apis/ResumeBuilder.js'
import generatepdf from './Apis/Generatepdf.js'

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', generateCoverLetter);
app.use('/api',resumeBuild)
app.use('/api',generatepdf)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


