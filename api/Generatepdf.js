import Chromium from '@sparticuz/chromium';
import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

router.post('/generatepdf', async (req, res) => {
    let html;
    
    // Conditional HTML rendering based on the provided data (coverLetter or resumeHtml)
    if (req.body.coverLetter) {
        html = `
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            font-family: 'Roboto', sans-serif; /* Added Roboto font */
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        @page {
                            margin-top: 10mm; /* Adds space at the top of every page */
                            margin-left: 5mm
                        }
                    </style>
                    <link href="https://fonts.google.com/share?selection.family=EB+Garamond:ital,wght@0,400..800;1,400..800|Wendy+One" rel="stylesheet">
                </head>
                <body>
                    <div"> 
                        ${req.body.coverLetter}
                    </div>
                </body>
            </html>
        `;
    } else if (req.body.resumeHtml) {
        html = `
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            font-family: 'Roboto', sans-serif; /* Added Roboto font */
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        @page {
                            margin-top: 5mm; /* Adds space at the top of every page */
                        }
                    </style>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
                </head>
                <body>
                    <div >
                        ${req.body.resumeHtml}
                    </div>
                </body>
            </html>
        `;
    }

    try {
        // Launch Puppeteer browser instance
        const browser = await puppeteer.launch({
            executablePath: await Chromium.executablePath(),
            args: Chromium.args,
            headless: Chromium.headless,
        });
        // const browser = await puppeteer.launch()
        const page = await browser.newPage();
        
        // Set the content for the PDF generation
        await page.setContent(html, { waitUntil: 'domcontentloaded' });

        // Generate the PDF buffer
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // Close the browser instance
        await browser.close();

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
        
        // Send the PDF buffer as the response
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

export default router;
