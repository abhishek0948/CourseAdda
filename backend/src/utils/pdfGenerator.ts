import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

export const generateCertificatePDF = async (
  studentName: string,
  courseName: string,
  completionDate: Date,
  res: Response
): Promise<void> => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate-${studentName.replace(/\s+/g, '_')}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .strokeColor('#1a73e8')
      .stroke();

    doc
      .rect(35, 35, doc.page.width - 70, doc.page.height - 70)
      .lineWidth(1)
      .strokeColor('#1a73e8')
      .stroke();

    // Add title
    doc
      .font('Helvetica-Bold')
      .fontSize(48)
      .fillColor('#1a73e8')
      .text('CERTIFICATE', 0, 100, {
        align: 'center',
        width: doc.page.width,
      });

    doc
      .fontSize(24)
      .fillColor('#333333')
      .text('OF COMPLETION', 0, 160, {
        align: 'center',
        width: doc.page.width,
      });

    // Add "This is to certify that"
    doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('#666666')
      .text('This is to certify that', 0, 220, {
        align: 'center',
        width: doc.page.width,
      });

    // Add student name
    doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .fillColor('#1a73e8')
      .text(studentName, 0, 260, {
        align: 'center',
        width: doc.page.width,
      });

    // Add underline for name
    const nameWidth = doc.widthOfString(studentName);
    const centerX = (doc.page.width - nameWidth) / 2;
    doc
      .moveTo(centerX, 300)
      .lineTo(centerX + nameWidth, 300)
      .strokeColor('#1a73e8')
      .lineWidth(2)
      .stroke();

    // Add completion text
    doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('#666666')
      .text('has successfully completed the internship course', 0, 330, {
        align: 'center',
        width: doc.page.width,
      });

    // Add course name
    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#333333')
      .text(courseName, 0, 370, {
        align: 'center',
        width: doc.page.width,
      });

    // Add completion date
    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#666666')
      .text(`Completed on ${formattedDate}`, 0, 430, {
        align: 'center',
        width: doc.page.width,
      });

    // Add footer
    doc
      .fontSize(10)
      .fillColor('#999999')
      .text('Internship Learning Management System', 0, doc.page.height - 80, {
        align: 'center',
        width: doc.page.width,
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};
