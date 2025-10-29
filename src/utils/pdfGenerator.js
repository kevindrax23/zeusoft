import jsPDF from 'jspdf'


export const generateInvoicePDF = async (invoice, companyInfo = {}) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let currentY = margin

  // Configuración de empresa por defecto
  const company = {
    nombre: companyInfo.nombre || 'EMPRESA S.A.C.',
    ruc: companyInfo.ruc || '20123456789',
    direccion: companyInfo.direccion || 'Av. Principal 123, Lima - Perú',
    telefono: companyInfo.telefono || '(01) 234-5678',
    email: companyInfo.email || 'ventas@empresa.com'
  }

  // ==================== HEADER ====================
  // Logo o nombre de la empresa
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text(company.nombre, margin, currentY)
  currentY += 7

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`RUC: ${company.ruc}`, margin, currentY)
  currentY += 5
  pdf.text(company.direccion, margin, currentY)
  currentY += 5
  pdf.text(`Tel: ${company.telefono} | Email: ${company.email}`, margin, currentY)
  currentY += 10

  // Línea separadora
  pdf.setLineWidth(0.5)
  pdf.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  // ==================== FACTURA INFO ====================
  // Título de factura y número
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  const invoiceTitle = 'FACTURA ELECTRÓNICA'
  const titleWidth = pdf.getTextWidth(invoiceTitle)
  pdf.text(invoiceTitle, pageWidth - margin - titleWidth, currentY)

  pdf.setFontSize(14)
  currentY += 7
  const numeroFactura = invoice.numeroFactura
  const numeroWidth = pdf.getTextWidth(numeroFactura)
  pdf.text(numeroFactura, pageWidth - margin - numeroWidth, currentY)
  currentY += 10

  // Fecha y estado
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const fecha = new Date(invoice.fechaEmision).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const fechaText = `Fecha: ${fecha}`
  const fechaWidth = pdf.getTextWidth(fechaText)
  pdf.text(fechaText, pageWidth - margin - fechaWidth, currentY)
  currentY += 6

  const estadoText = `Estado: ${getStatusLabel(invoice.estado)}`
  const estadoWidth = pdf.getTextWidth(estadoText)
  pdf.text(estadoText, pageWidth - margin - estadoWidth, currentY)

  // Volver al inicio para datos del cliente
  currentY = margin + 40

  // ==================== CLIENTE INFO ====================
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DATOS DEL CLIENTE', margin, currentY)
  currentY += 7

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Cliente: ${invoice.cliente?.nombre || 'N/A'}`, margin, currentY)
  currentY += 6
  pdf.text(`${invoice.cliente?.tipoDocumento || 'Doc'}: ${invoice.cliente?.numeroDocumento || 'N/A'}`, margin, currentY)
  currentY += 6
  if (invoice.cliente?.email) {
    pdf.text(`Email: ${invoice.cliente.email}`, margin, currentY)
    currentY += 6
  }
  if (invoice.cliente?.telefono) {
    pdf.text(`Teléfono: ${invoice.cliente.telefono}`, margin, currentY)
    currentY += 6
  }
  currentY += 10

  // ==================== TABLA DE PRODUCTOS ====================
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DETALLE DE PRODUCTOS', margin, currentY)
  currentY += 7

  // Headers de la tabla
  const colWidths = {
    producto: 80,
    cantidad: 25,
    precio: 30,
    subtotal: 30
  }

  const startX = margin
  const headerY = currentY

  // Fondo del header
  pdf.setFillColor(240, 240, 240)
  pdf.rect(startX, headerY - 5, pageWidth - 2 * margin, 8, 'F')

  // Textos del header
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('PRODUCTO', startX + 2, headerY)
  pdf.text('CANT.', startX + colWidths.producto + 5, headerY)
  pdf.text('P. UNIT.', startX + colWidths.producto + colWidths.cantidad + 5, headerY)
  pdf.text('SUBTOTAL', startX + colWidths.producto + colWidths.cantidad + colWidths.precio + 5, headerY)

  currentY += 10

  // Productos
  pdf.setFont('helvetica', 'normal')
  invoice.items.forEach((item, index) => {
    // Verificar si necesitamos una nueva página
    if (currentY > pageHeight - 50) {
      pdf.addPage()
      currentY = margin
    }

    const rowY = currentY

    // Producto
    const productName = item.nombre.length > 40
      ? item.nombre.substring(0, 37) + '...'
      : item.nombre
    pdf.text(productName, startX + 2, rowY)
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(item.codigo, startX + 2, rowY + 4)
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    // Cantidad
    pdf.text(item.cantidad.toString(), startX + colWidths.producto + 5, rowY)

    // Precio unitario
    pdf.text(formatCurrency(item.precioUnitario), startX + colWidths.producto + colWidths.cantidad + 5, rowY)

    // Subtotal
    pdf.text(formatCurrency(item.subtotal), startX + colWidths.producto + colWidths.cantidad + colWidths.precio + 5, rowY)

    currentY += 10

    // Línea separadora
    if (index < invoice.items.length - 1) {
      pdf.setDrawColor(220, 220, 220)
      pdf.line(startX, currentY - 2, pageWidth - margin, currentY - 2)
    }
  })

  currentY += 5

  // ==================== TOTALES ====================
  const totalsX = pageWidth - margin - 60

  // Subtotal
  pdf.setFont('helvetica', 'normal')
  pdf.text('Subtotal:', totalsX - 30, currentY)
  pdf.text(formatCurrency(invoice.subtotal), totalsX, currentY)
  currentY += 7

  // IGV
  pdf.text('IGV (18%):', totalsX - 30, currentY)
  pdf.text(formatCurrency(invoice.montoImpuesto), totalsX, currentY)
  currentY += 7

  // Línea antes del total
  pdf.setLineWidth(0.5)
  pdf.line(totalsX - 35, currentY, pageWidth - margin, currentY)
  currentY += 7

  // Total
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('TOTAL:', totalsX - 30, currentY)
  pdf.text(formatCurrency(invoice.total), totalsX, currentY)

  // ==================== NOTAS ====================
  if (invoice.notas) {
    currentY += 15
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('NOTAS:', margin, currentY)
    currentY += 6
    pdf.setFont('helvetica', 'normal')

    // Dividir texto largo en múltiples líneas
    const notasLines = pdf.splitTextToSize(invoice.notas, pageWidth - 2 * margin)
    notasLines.forEach(line => {
      if (currentY > pageHeight - 30) {
        pdf.addPage()
        currentY = margin
      }
      pdf.text(line, margin, currentY)
      currentY += 5
    })
  }

  // ==================== FOOTER ====================
  const footerY = pageHeight - 20
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(100, 100, 100)
  const footerText = 'Gracias por su preferencia'
  const footerWidth = pdf.getTextWidth(footerText)
  pdf.text(footerText, (pageWidth - footerWidth) / 2, footerY)

  return pdf
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'S/. 0.00'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const getStatusLabel = (status) => {
  const labels = {
    pagada: 'PAGADA',
    pendiente: 'PENDIENTE',
    anulada: 'ANULADA'
  }
  return labels[status] || status
}

export const downloadInvoicePDF = async (invoice) => {
  try {
    const pdf = await generateInvoicePDF(invoice)
    const filename = `Factura_${invoice.numeroFactura}.pdf`
    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}

export const printInvoice = async (invoice) => {
  try {
    const pdf = await generateInvoicePDF(invoice)

    // Abrir en nueva ventana para imprimir
    const pdfBlob = pdf.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    const printWindow = window.open(pdfUrl)

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }

    return true
  } catch (error) {
    console.error('Error al imprimir:', error)
    throw error
  }
}
