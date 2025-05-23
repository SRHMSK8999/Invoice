import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./currency";

interface InvoiceData {
  invoice: {
    id: number;
    invoiceNumber: string;
    business: any;
    client: any;
    issueDate: Date;
    dueDate: Date;
    currency: string;
    items: any[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    notes?: string;
    status: string;
    templateId: number;
  };
}

export const generatePDF = async ({ invoice }: InvoiceData): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set the document properties
  doc.setProperties({
    title: `Invoice #${invoice.invoiceNumber}`,
    subject: "Invoice",
    author: invoice.business.name,
    creator: "InvoiceFlow"
  });

  // Choose template based on templateId
  switch (invoice.templateId) {
    case 1:
      generateClassicTemplate(doc, invoice);
      break;
    case 2:
      generateModernTemplate(doc, invoice);
      break;
    case 3:
      generateProfessionalTemplate(doc, invoice);
      break;
    default:
      generateClassicTemplate(doc, invoice);
  }

  // Save the PDF
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

const generateClassicTemplate = (doc: any, invoice: any) => {
  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add logo if available
  if (invoice.business.logo) {
    try {
      doc.addImage(invoice.business.logo, 'JPEG', 15, 15, 40, 40);
    } catch (error) {
      console.error("Error adding logo:", error);
    }
  } else {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.business.name, 15, 30);
  }

  // Add invoice title and number
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 195, 25, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 195, 35, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.issueDate)}`, 195, 42, { align: 'right' });
  doc.text(`Due: ${formatDate(invoice.dueDate)}`, 195, 49, { align: 'right' });

  // Add status
  const statusColors: { [key: string]: [number, number, number] } = {
    draft: [100, 100, 100],
    sent: [39, 128, 227],
    paid: [39, 174, 96],
    overdue: [231, 76, 60],
    cancelled: [100, 100, 100]
  };
  
  doc.setFillColor(...(statusColors[invoice.status] || [100, 100, 100]));
  doc.roundedRect(140, 55, 55, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(invoice.status.toUpperCase(), 167, 61, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add business and client information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 15, 70);
  doc.text('To:', 120, 70);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Business details
  let yPos = 77;
  doc.text(invoice.business.name, 15, yPos);
  yPos += 7;
  
  if (invoice.business.address) {
    const addressLines = doc.splitTextToSize(invoice.business.address, 90);
    addressLines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.business.email) {
    doc.text(`Email: ${invoice.business.email}`, 15, yPos);
    yPos += 7;
  }
  
  if (invoice.business.phone) {
    doc.text(`Phone: ${invoice.business.phone}`, 15, yPos);
    yPos += 7;
  }
  
  if (invoice.business.taxNumber) {
    doc.text(`Tax/GST: ${invoice.business.taxNumber}`, 15, yPos);
  }
  
  // Client details
  yPos = 77;
  doc.text(invoice.client.name, 120, yPos);
  yPos += 7;
  
  if (invoice.client.address) {
    const addressLines = doc.splitTextToSize(invoice.client.address, 75);
    addressLines.forEach((line: string) => {
      doc.text(line, 120, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.client.email) {
    doc.text(`Email: ${invoice.client.email}`, 120, yPos);
    yPos += 7;
  }
  
  if (invoice.client.phone) {
    doc.text(`Phone: ${invoice.client.phone}`, 120, yPos);
    yPos += 7;
  }
  
  if (invoice.client.taxNumber) {
    doc.text(`Tax/GST: ${invoice.client.taxNumber}`, 120, yPos);
  }

  // Add items table
  const startY = Math.max(yPos + 20, 130);
  
  const tableData = invoice.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, invoice.currency),
    formatCurrency(item.amount, invoice.currency)
  ]);
  
  autoTable(doc, {
    startY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // Add totals
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, tableEndY);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 195, tableEndY, { align: 'right' });
  
  if (invoice.taxRate > 0) {
    doc.text(`Tax (${invoice.taxRate}%):`, 140, tableEndY + 7);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 195, tableEndY + 7, { align: 'right' });
  }
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 140, tableEndY + 14);
    doc.text(`- ${formatCurrency(invoice.discount, invoice.currency)}`, 195, tableEndY + 14, { align: 'right' });
  }
  
  // Draw line
  const lineY = tableEndY + (invoice.discount > 0 ? 21 : 14);
  doc.setDrawColor(200, 200, 200);
  doc.line(140, lineY, 195, lineY);

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, lineY + 7);
  doc.text(formatCurrency(invoice.total, invoice.currency), 195, lineY + 7, { align: 'right' });
  
  // Add notes if any
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, lineY + 20);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, 180);
    noteLines.forEach((line: string, index: number) => {
      doc.text(line, 15, lineY + 27 + (index * 7));
    });
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated by InvoiceFlow - Page ${pageCount}`, 105, 287, { align: 'center' });
};

const generateModernTemplate = (doc: any, invoice: any) => {
  // Use a blue color scheme for this template
  const primaryColor = [39, 128, 227]; // Blue

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add a colored header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 50, 'F');

  // Add logo if available
  if (invoice.business.logo) {
    try {
      doc.addImage(invoice.business.logo, 'JPEG', 155, 15, 40, 40);
    } catch (error) {
      console.error("Error adding logo:", error);
    }
  }

  // Add invoice title and business name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 15, 20);
  
  doc.setFontSize(12);
  doc.text(invoice.business.name, 15, 30);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 15, 40);
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);

  // Add invoice dates
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Date: ${formatDate(invoice.issueDate)}`, 15, 60);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 15, 67);
  
  // Add status badge
  const statusColors: { [key: string]: [number, number, number] } = {
    draft: [100, 100, 100],
    sent: [39, 128, 227],
    paid: [39, 174, 96],
    overdue: [231, 76, 60],
    cancelled: [100, 100, 100]
  };
  
  doc.setFillColor(...(statusColors[invoice.status] || [100, 100, 100]));
  doc.roundedRect(150, 55, 45, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(invoice.status.toUpperCase(), 172, 61, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add business and client information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('From:', 15, 80);
  doc.text('To:', 110, 80);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Business details
  let yPos = 87;
  doc.text(invoice.business.name, 15, yPos);
  yPos += 7;
  
  if (invoice.business.address) {
    const addressLines = doc.splitTextToSize(invoice.business.address, 80);
    addressLines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.business.email) {
    doc.text(`Email: ${invoice.business.email}`, 15, yPos);
    yPos += 7;
  }
  
  if (invoice.business.phone) {
    doc.text(`Phone: ${invoice.business.phone}`, 15, yPos);
  }
  
  // Client details
  yPos = 87;
  doc.text(invoice.client.name, 110, yPos);
  yPos += 7;
  
  if (invoice.client.address) {
    const addressLines = doc.splitTextToSize(invoice.client.address, 80);
    addressLines.forEach((line: string) => {
      doc.text(line, 110, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.client.email) {
    doc.text(`Email: ${invoice.client.email}`, 110, yPos);
    yPos += 7;
  }
  
  if (invoice.client.phone) {
    doc.text(`Phone: ${invoice.client.phone}`, 110, yPos);
  }

  // Add items table with modern styling
  const startY = Math.max(yPos + 20, 130);
  
  const tableData = invoice.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, invoice.currency),
    formatCurrency(item.amount, invoice.currency)
  ]);
  
  autoTable(doc, {
    startY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryColor],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineColor: [220, 220, 220],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Add totals with modern styling
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add a background for the totals section
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(120, tableEndY - 5, 75, invoice.discount > 0 ? 38 : 31, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, tableEndY);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 185, tableEndY, { align: 'right' });
  
  if (invoice.taxRate > 0) {
    doc.text(`Tax (${invoice.taxRate}%):`, 130, tableEndY + 7);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 185, tableEndY + 7, { align: 'right' });
  }
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 130, tableEndY + 14);
    doc.text(`- ${formatCurrency(invoice.discount, invoice.currency)}`, 185, tableEndY + 14, { align: 'right' });
  }
  
  // Draw line
  const lineY = tableEndY + (invoice.discount > 0 ? 21 : 14);
  doc.setDrawColor(200, 200, 200);
  doc.line(130, lineY, 185, lineY);

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total:', 130, lineY + 7);
  doc.text(formatCurrency(invoice.total, invoice.currency), 185, lineY + 7, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add notes if any
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Notes:', 15, lineY + 20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const noteLines = doc.splitTextToSize(invoice.notes, 180);
    noteLines.forEach((line: string, index: number) => {
      doc.text(line, 15, lineY + 27 + (index * 7));
    });
  }
  
  // Add footer with a subtle blue bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 280, 210, 15, 'F');
  
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated by InvoiceFlow - Page ${pageCount}`, 105, 287, { align: 'center' });
};

const generateProfessionalTemplate = (doc: any, invoice: any) => {
  // Use a grayscale color scheme for this template
  const primaryColor = [50, 50, 50]; // Dark gray
  
  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add a subtle header
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(15, 40, 195, 40);
  
  // Add logo and company name
  if (invoice.business.logo) {
    try {
      doc.addImage(invoice.business.logo, 'JPEG', 15, 15, 40, 20);
    } catch (error) {
      console.error("Error adding logo:", error);
    }
  } else {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(invoice.business.name, 15, 25);
  }

  // Add invoice label
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', 195, 25, { align: 'right' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 195, 35, { align: 'right' });
  
  // Add dates below the line
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, 15, 50);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 195, 50, { align: 'right' });
  
  // Add status
  const statusColors: { [key: string]: [number, number, number] } = {
    draft: [100, 100, 100],
    sent: [39, 128, 227],
    paid: [39, 174, 96],
    overdue: [231, 76, 60],
    cancelled: [100, 100, 100]
  };
  
  doc.setFillColor(...(statusColors[invoice.status] || [100, 100, 100]));
  doc.roundedRect(145, 55, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(invoice.status.toUpperCase(), 170, 61, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add from/to labels with style
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  
  // From label with background
  doc.setFillColor(...primaryColor);
  doc.rect(15, 70, 20, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('FROM', 25, 75, { align: 'center' });
  
  // To label with background
  doc.setFillColor(...primaryColor);
  doc.rect(110, 70, 15, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TO', 117.5, 75, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Business details
  let yPos = 85;
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.business.name, 15, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  if (invoice.business.address) {
    const addressLines = doc.splitTextToSize(invoice.business.address, 80);
    addressLines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.business.email) {
    doc.text(`Email: ${invoice.business.email}`, 15, yPos);
    yPos += 7;
  }
  
  if (invoice.business.phone) {
    doc.text(`Phone: ${invoice.business.phone}`, 15, yPos);
    yPos += 7;
  }
  
  if (invoice.business.taxNumber) {
    doc.text(`Tax/GST: ${invoice.business.taxNumber}`, 15, yPos);
  }
  
  // Client details
  yPos = 85;
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.client.name, 110, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  if (invoice.client.address) {
    const addressLines = doc.splitTextToSize(invoice.client.address, 80);
    addressLines.forEach((line: string) => {
      doc.text(line, 110, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.client.email) {
    doc.text(`Email: ${invoice.client.email}`, 110, yPos);
    yPos += 7;
  }
  
  if (invoice.client.phone) {
    doc.text(`Phone: ${invoice.client.phone}`, 110, yPos);
    yPos += 7;
  }
  
  if (invoice.client.taxNumber) {
    doc.text(`Tax/GST: ${invoice.client.taxNumber}`, 110, yPos);
  }

  // Add items table with professional styling
  const startY = Math.max(yPos + 20, 130);
  
  const tableData = invoice.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, invoice.currency),
    formatCurrency(item.amount, invoice.currency)
  ]);
  
  autoTable(doc, {
    startY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryColor],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // Add totals with professional styling
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  
  // Create a box for totals
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(120, tableEndY - 5, 75, invoice.discount > 0 ? 38 : 31);
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, tableEndY);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 185, tableEndY, { align: 'right' });
  
  if (invoice.taxRate > 0) {
    doc.text(`Tax (${invoice.taxRate}%):`, 130, tableEndY + 7);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 185, tableEndY + 7, { align: 'right' });
  }
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 130, tableEndY + 14);
    doc.text(`- ${formatCurrency(invoice.discount, invoice.currency)}`, 185, tableEndY + 14, { align: 'right' });
  }
  
  // Draw line
  const lineY = tableEndY + (invoice.discount > 0 ? 21 : 14);
  doc.setDrawColor(...primaryColor);
  doc.line(130, lineY, 185, lineY);

  // Total
  doc.setFillColor(...primaryColor);
  doc.rect(120, lineY + 2, 75, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 130, lineY + 9);
  doc.text(formatCurrency(invoice.total, invoice.currency), 185, lineY + 9, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add payment terms and notes if any
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, lineY + 25);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, 180);
    noteLines.forEach((line: string, index: number) => {
      doc.text(line, 15, lineY + 32 + (index * 7));
    });
  }
  
  // Add footer with a subtle line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 275, 195, 275);
  
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated by InvoiceFlow - Page ${pageCount}`, 105, 282, { align: 'center' });
};
