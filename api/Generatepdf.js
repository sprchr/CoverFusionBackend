import Chromium from '@sparticuz/chromium';
import express from 'express'
import puppeteer from 'puppeteer';

const router = express.Router();


router.post('/generatepdf', async (req, res) => {
    console.log(req.body.resumeHtml)
    let html
    if (req.body.coverLetter) {
      html = `
          <html>
              <head>
                <style>
                  body {
                      margin-left: 60px;
                      margin-right: 30px;
                      margin-top: 60px;
                      font-family: Arial, sans-serif;
                      font-size: 14px;
                      line-height: 1.2;
                  }
                </style>
              </head>
              <body>
                  ${req.body.coverLetter}
              </body>
          </html>
      `;
  } else if (req.body.resumeHtml) {
      html = `
        
              ${req.body.resumeHtml}
             
      `;
  } 

  try {
    // Launch puppeteer browser instance
    const browser = await puppeteer.launch({
      executablePath: await Chromium.executablePath(),
      args: Chromium.args,
      headless: Chromium.headless,
  });

  const page = await browser.newPage();
  
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
    const pdfBuffer = await page.pdf({ format: 'A4' });
    // fs.writeFileSync('test1.pdf', pdfBuffer);
    // Close the browser instance
    await browser.close();
  
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
  
    // Send the PDF buffer as the response
    // console.log(pdfBuffer)
    res.send(Buffer.from(pdfBuffer));
  }catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF')
    }
  });
  
  export default router