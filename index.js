import express from 'express'
import cors from 'cors'
import generateCoverLetter from './Apis/GenerateCoverLetter.js'
import resumeBuild from './Apis/ResumeBuilder.js'
import editResume from './Apis/ResumeBuilder.js'
import generatepdf from './Apis/Generatepdf.js'
import submitForm from './Apis/SubmitForm.js'
import bodyParser from 'body-parser'
import controllers from './kfaka/controller.js'

const app = express();
app.use(bodyParser.json());

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', generateCoverLetter);
app.use('/api',resumeBuild)
app.use('/api',generatepdf)
app.use('/api',editResume)
app.use('/api',submitForm)
app.use('/api/send',controllers.sendToKafka)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


