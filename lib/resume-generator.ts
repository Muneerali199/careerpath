// lib/resume-generator.ts
import { ResumeData } from '@/lib/types';

export async function generateResumePDF(resumeData: ResumeData): Promise<string> {
  // Mock implementation - in a real app, use a PDF generation library
  const mockPDF = `
    %PDF-1.4
    1 0 obj
    << /Type /Catalog /Pages 2 0 R >>
    endobj
    2 0 obj
    << /Type /Pages /Kids [3 0 R] /Count 1 >>
    endobj
    3 0 obj
    << /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
    endobj
    4 0 obj
    << /Length 44 >>
    stream
    BT /F1 12 Tf 100 700 Td (Improved Resume) Tj ET
    endstream
    endobj
    xref
    0 5
    0000000000 65535 f 
    0000000009 00000 n 
    0000000053 00000 n 
    0000000107 00000 n 
    0000000183 00000 n 
    trailer
    << /Size 5 /Root 1 0 R >>
    startxref
    253
    %%EOF
  `;
  
  return `data:application/pdf;base64,${btoa(mockPDF)}`;
}

export function generateResumeHTML(resumeData: ResumeData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          .resume { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .contact { margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            border-bottom: 2px solid #333; 
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .job { margin-bottom: 15px; }
          .job-title { font-weight: bold; }
          .company { font-style: italic; }
          .date { color: #666; }
          .skills { display: flex; flex-wrap: wrap; gap: 5px; }
          .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="resume">
          <div class="header">
            <div class="name">YOUR NAME</div>
            <div class="contact">your.email@example.com | (123) 456-7890 | linkedin.com/in/yourprofile</div>
          </div>
          
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${resumeData.analysis.improvements.length > 0 ? 
              resumeData.analysis.improvedSections[0]?.improved || 'Experienced professional' : 
              'Experienced professional with skills in...'}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Work Experience</div>
            ${resumeData.analysis.improvedSections.map(section => `
              <div class="job">
                <div class="job-title">${section.improved.split(' ').slice(0, 3).join(' ')}</div>
                <div class="company">Company Name</div>
                <div class="date">Month 20XX - Present</div>
                <ul>
                  <li>${section.improved}</li>
                </ul>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              ${resumeData.analysis.keywordAnalysis.recommended.map((skill: string) => `
                <div class="skill">${skill}</div>
              `).join('')}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}