import jsPDF from 'jspdf'

export interface PaymentConfirmationData {
    studentName: string
    dni: string
    email: string
    phone?: string
    isAffiliated: boolean
    courseTitle: string
    courseCode: string
    courseLevel?: string
    totalAmount: number
    amountPaid: number
    discountApplied?: string
    enrollmentDate?: string
    confirmationDate?: string
    referenceId?: string
}

export function generatePaymentConfirmationPdf(data: PaymentConfirmationData): jsPDF {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    })

    const pageWidth = doc.internal.pageSize.getWidth() // 210
    const margin = 15
    const contentWidth = pageWidth - margin * 2 // 180
    let y = 12

    // 1. Barra superior decorativa verde UGT (para indicar pago confirmado)
    doc.setFillColor(22, 163, 74) // #16a34a (green-600)
    doc.rect(0, 0, pageWidth, 5, 'F')

    // 2. Cabecera Institucional
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(22, 163, 74)
    doc.text('UGT SERVICIOS PÚBLICOS SALAMANCA', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    y += 4.5
    doc.text('Área de Formación y Oposiciones · C/ Gran Vía, 79-81, 37001 Salamanca', margin, y)

    // Datos a la derecha en la cabecera
    const confirmDate = data.confirmationDate ? new Date(data.confirmationDate) : new Date()
    const dateFormatted = confirmDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeFormatted = confirmDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const refCode = data.referenceId || `PAGO-${data.courseCode}-${data.dni.replace(/\\D/g, '').slice(-4) || '0000'}`

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    doc.text(`Ref: ${refCode}`, pageWidth - margin, y - 4.5, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Fecha Conf.: ${dateFormatted} ${timeFormatted}`, pageWidth - margin, y, { align: 'right' })

    // Línea separadora
    y += 4
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.4)
    doc.line(margin, y, pageWidth - margin, y)

    // 3. Título del Documento
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('JUSTIFICANTE DE PAGO CONFIRMADO', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Documento acreditativo de abono de matrícula', margin, y + 4)

    // 4. Banner de Estado
    y += 8
    doc.setFillColor(240, 253, 244) // emerald-50
    doc.setDrawColor(187, 247, 208) // emerald-200
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(21, 128, 61) // emerald-700
    doc.text('PAGO CONFIRMADO CORRECTAMENTE', margin + 4, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(22, 101, 52) // emerald-800
    doc.text('Tu plaza ha quedado formalizada definitivamente para esta acción formativa.', margin + 4, y + 9.5)

    // 5. Bloque 1: Datos del Alumno
    y += 17
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(21, 128, 61) // emerald-700
    doc.text('1. DATOS DE LA PERSONA MATRICULADA', margin, y)

    y += 3
    doc.setFillColor(248, 250, 252) // slate-50
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD')

    doc.setFontSize(8)
    const col1 = margin + 4
    const col2 = margin + 95

    let rowY = y + 5.5
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('Nombre y Apellidos:', col1, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(data.studentName || '—', col1 + 32, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('DNI / NIE:', col2, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(data.dni || '—', col2 + 20, rowY)

    rowY += 6
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('Correo Electrónico:', col1, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(data.email || '—', col1 + 32, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('Teléfono:', col2, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(data.phone || '—', col2 + 20, rowY)

    rowY += 6
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    if (data.isAffiliated) {
        doc.setTextColor(21, 128, 61)
    } else {
        doc.setTextColor(15, 23, 42)
    }
    doc.text(data.isAffiliated ? 'Afiliado/a a UGT (Tarifa bonificada)' : 'General (No afiliado)', col1 + 32, rowY)

    // 6. Bloque 2: Datos de la Acción Formativa
    y += 29
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(21, 128, 61)
    doc.text('2. INFORMACIÓN DEL PROGRAMA FORMATIVO', margin, y)

    y += 3
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD')

    rowY = y + 5.5
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('Curso:', col1, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    const titleLines = doc.splitTextToSize(data.courseTitle, contentWidth - 40)
    doc.text(titleLines[0] || '—', col1 + 32, rowY)

    rowY += 6
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('Código Curso:', col1, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(data.courseCode || '—', col1 + 32, rowY)

    if (data.courseLevel) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text('Nivel:', col2, rowY)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(data.courseLevel, col2 + 28, rowY)
    }

    // 7. Bloque 3: Datos de Pago
    y += 23
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(21, 128, 61)
    doc.text('3. DETALLE DE ABONO', margin, y)

    y += 3
    const paymentBoxHeight = 25
    doc.setFillColor(240, 253, 244) // emerald-50
    doc.setDrawColor(134, 239, 172) // emerald-300
    doc.setLineWidth(0.6)
    doc.roundedRect(margin, y, contentWidth, paymentBoxHeight, 2.5, 2.5, 'FD')

    rowY = y + 7
    // Importe destacado
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(21, 128, 61) // emerald-700
    doc.text('IMPORTE ABONADO:', col1, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(21, 128, 61)
    doc.text(`${data.amountPaid.toFixed(2)} €`, col1 + 45, rowY)

    if (data.discountApplied) {
        rowY += 5
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7.5)
        doc.setTextColor(22, 101, 52)
        doc.text(`Descuento aplicado: ${data.discountApplied}`, col1, rowY)
    }

    rowY += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('FECHA DE CONFIRMACIÓN:', col1, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(`${dateFormatted} ${timeFormatted}`, col1 + 45, rowY)


    // 9. Pie legal y Protección de Datos (RGPD)
    y += paymentBoxHeight + 8
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text('PROTECCIÓN DE DATOS (RGPD - LOPDGDD):', margin + 3, y + 4)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(148, 163, 184)
    const rgpdText = 'Responsable: UGT Servicios Públicos. Finalidad: Gestión de pre-inscripción, reserva de plaza, emisión de certificados y seguimiento de la acción formativa. Derechos: Tienes derecho a acceder, rectificar y suprimir tus datos escribiendo a dpo@ugt-sp.eu. Consulta la política completa en ugtsanidadsalamanca.github.io/-rgpd-formacion/'
    const rgpdLines = doc.splitTextToSize(rgpdText, contentWidth - 6)
    doc.text(rgpdLines, margin + 3, y + 7.5)

    // Pie de página final
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(148, 163, 184)
    doc.text('UGT Servicios Públicos Salamanca · Documento generado automáticamente como comprobante oficial de abono.', pageWidth / 2, 290, { align: 'center' })

    return doc
}
