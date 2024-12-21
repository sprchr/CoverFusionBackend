# WikiSource Backend Documentation

## 1. Basic Project Information

**Project Name:** WikiSource Backend

**Description:**  
The backend system for the WikiSource platform handles API requests for:

- Generating PDF files.
- Creating cover letters.
- Building and editing resumes.
- Integrating Firebase for user data storage.

**Tech Stack:**

- **Languages:** Node.js
- **Frameworks:** Express.js
- **Services:** Firebase, OpenAI
- **Tools:** Docker

## 2. Installation/Setup Instructions

### Prerequisites

Ensure the following are installed on your system:

- Node.js
- Docker
- Firebase CLI (for managing Firebase)
- VS Code (or any code editor)

### Steps to Set Up the Project

1. Clone the repository from GitHub:  
   ```bash
   git clone https://github.com/sprchr/WikiSourceBackend.git
   ```

2. Navigate to the project directory:  
   ```bash
   cd wikisource-backend
   ```

3. Install dependencies:  
   ```bash
   npm install
   ```

4. Configure the environment variables:
   - Firebase credentials.
   - OpenAI API key.

5. Run the application:
   - Start the backend server:  
     ```bash
     npm start
     ```

## 3. Features

- **API Endpoints:**
  - Generate cover letters from user-provided text and file inputs.
  - Build resumes by processing uploaded files.
  - Edit resumes and make updates dynamically.
  - Generate PDFs for downloading resumes.

- **Database Integration:** Firebase Firestore is used to manage user collections.

## 4. Project Structure

```
root/
├── APIS/
│   ├── generateCoverLetter.js      # Endpoint to generate cover letter
│   ├── resumeBuild.js              # Endpoint to build resumes
│   ├── editResume.js               # Endpoint to edit resume
│   └── generatePDF.js              # Endpoint to generate PDF
├── docker-compose.yml             # Docker setup
├── index.js                       # Main entry point of the application
├── firebaseConfig.js              # Firebase configuration file
```

## 5. API Documentation

### 1. **GenerateCoverLetter**

- **Endpoint:** `/generateCoverLetter`
- **Request Method:** POST
- **Input:**  
  - `resume`: The uploaded resume file (in any format).  
  - `jobDescription`: A plain text job description.
  
- **Functionality:**
  - The resume is uploaded as a file, and the job description is passed as text.
  - OpenAI Integration: The endpoint sends the resume and job description to OpenAI for processing.
  - Formatting: The generated HTML cover letter is ATS-friendly, with specific font sizes and styles.
  
- **Output:**  
  - HTML content of the cover letter, ready for download or display.
  
- **Error Handling:**  
  - If an error occurs, a 500 status error is returned with the message: "Error generating cover letter."

### 2. **ResumeBuilder**

- **Endpoint:** `/resumeBuild`
- **Request Method:** POST
- **Input:**  
  - A resume file (PDF) uploaded using Multer.
  
- **Functionality:**
  - The resume file is parsed and processed to improve the resume content.
  
- **Output:**  
  - The processed resume.
  
- **Error Handling:**  
  - A 500 error is returned if resume processing fails.

### 3. **EditResume**

- **Endpoint:** `/editResume`
- **Request Method:** POST
- **Input:**  
  - A resume in JSON format containing the user’s resume details.
  
- **Functionality:**
  - OpenAI processes the resume to improve its professionalism and ATS compatibility.
  
- **Output:**  
  - The improved resume in JSON format.
  
- **Error Handling:**  
  - Returns a 500 error if OpenAI request fails.

### 4. **GeneratePDF**

- **Endpoint:** `/generatepdf`
- **Request Method:** POST
- **Input:**  
  - `resumeHtml` or `coverLetter`: HTML content for generating the PDF.
  
- **Functionality:**
  - The HTML content is parsed and wrapped in a basic structure with styles.
  - Puppeteer generates the PDF from the HTML content.
  
- **Output:**  
  - A downloadable PDF containing the resume or cover letter.
  
- **Error Handling:**  
  - If an error occurs, a 500 status error is returned with the message: "Error generating PDF."

### 5. **SubmitForm**

- **Endpoint:** `/submitForm`
- **Request Method:** POST
- **Input:**  
  - The request body should contain `userId` and form data (user details).  
    Example:
    ```json
    {
      "userId": "12345",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
    ```

- **Functionality:**
  - The userId is validated, and the form data is either merged with existing Firestore data or a new document is created.

- **Output:**  
  - Success message: `{ "message": "Form submitted successfully to Firestore!", "userId": "12345" }`  
  - In case of an error, a 500 status with message: `{ "error": "Failed to save form data to Firestore" }`

## 6. Additional Notes

- **Testing APIs:**  
  - Use tools like Postman or cURL to test all endpoints. Ensure all POST requests include the required form data.

- **Resume Page Restriction:**  
  - The system limits resumes to 2-3 pages for PDF generation.

