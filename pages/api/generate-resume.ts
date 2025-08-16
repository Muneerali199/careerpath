import { NextResponse } from 'next/server';
import { ResumeData } from '@/lib/types';
import { generateResumePDF } from '@/lib/resume-generator';

export async function POST(req: Request) {
  try {
    const resumeData: ResumeData = await req.json();
    
    // Generate PDF (in a real app, you'd use a PDF generation library)
    const pdfBuffer = await generateResumePDF(resumeData);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="improved-resume.pdf"'
      }
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json(
      { error: 'Error generating resume' },
      { status: 500 }
    );
  }
}