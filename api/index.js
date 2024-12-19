import express from 'express'
import cors from 'cors'
import GenerateCoverLetter from './GenerateCoverLetter.js'
import resumeBuild from './ResumeBuilder.js'
import editResume from './ResumeBuilder.js'
import generatepdf from './Generatepdf.js'
import submitForm from './SubmitForm.js'
import bodyParser from 'body-parser'
import controllers from '../kfaka/controller.js'

const app = express();
app.use(bodyParser.json());

// Allow requests from your frontend origin
app.use(cors({
  origin: 'https://wiki-source-ui-ten.vercel.app'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', GenerateCoverLetter);
app.use('/api',resumeBuild)
app.use('/api',generatepdf)
app.use('/api',editResume)
app.use('/api',submitForm)
app.use('/api/send',controllers.sendToKafka)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


