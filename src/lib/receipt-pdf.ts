import jsPDF from 'jspdf'

export interface ReceiptData {
    studentName: string
    dni: string
    email: string
    phone?: string
    isAffiliated: boolean
    courseTitle: string
    courseCode: string
    courseLevel?: string
    startDate?: string
    duration?: number
    durationPeriod?: string
    totalAmount: number
    firstPaymentAmount?: number
    paymentCount?: number
    isFractioned?: boolean
    paymentFrequencyLabel?: string
    discountApplied?: string
    iban: string
    paymentConcept: string
    enrollmentDate?: string
    referenceId?: string
}

export function generateReceiptPdf(data: ReceiptData): jsPDF {
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

    // 1. Barra superior decorativa roja UGT
    doc.setFillColor(211, 47, 47) // #d32f2f
    doc.rect(0, 0, pageWidth, 5, 'F')

    // 2. Cabecera Institucional
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(211, 47, 47)
    doc.text('UGT SERVICIOS PÚBLICOS SALAMANCA', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    y += 4.5
    doc.text('Área de Formación y Oposiciones · C/ Gran Vía, 79-81, 37001 Salamanca', margin, y)

    // Datos a la derecha en la cabecera
    const now = data.enrollmentDate ? new Date(data.enrollmentDate) : new Date()
    const dateFormatted = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeFormatted = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const refCode = data.referenceId || `INS-${data.courseCode}-${data.dni.replace(/\D/g, '').slice(-4) || '0000'}`

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    doc.text(`Ref: ${refCode}`, pageWidth - margin, y - 4.5, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Fecha: ${dateFormatted} ${timeFormatted}`, pageWidth - margin, y, { align: 'right' })

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
    doc.text('JUSTIFICANTE DE PRE-INSCRIPCIÓN', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Documento acreditativo de reserva provisional de plaza', margin, y + 4)

    // 4. Banner de Estado
    y += 8
    doc.setFillColor(240, 253, 244) // emerald-50
    doc.setDrawColor(187, 247, 208) // emerald-200
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(21, 128, 61) // emerald-700
    doc.text('REGISTRO COMPLETADO CORRECTAMENTE', margin + 4, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(22, 101, 52) // emerald-800
    doc.text('Tu plaza queda reservada provisionalmente a la espera del abono bancario correspondiente.', margin + 4, y + 9.5)

    // 5. Bloque 1: Datos del Alumno
    y += 17
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(185, 28, 28) // red-700
    doc.text('1. DATOS DE LA PERSONA SOLICITANTE', margin, y)

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
    doc.setTextColor(185, 28, 28)
    doc.text('2. INFORMACIÓN DEL PROGRAMA FORMATIVO', margin, y)

    y += 3
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD')

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

    rowY += 6
    if (data.duration && data.duration > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text('Duración:', col1, rowY)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(`${data.duration} horas lectivas`, col1 + 32, rowY)
    }

    if (data.startDate || data.durationPeriod) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text('Período / Inicio:', col2, rowY)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(data.durationPeriod || data.startDate || '—', col2 + 28, rowY)
    }

    // 7. Bloque 3: Datos de Pago y Transferencia Bancaria (El más importante)
    y += 29
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(185, 28, 28)
    doc.text('3. INSTRUCCIONES DE PAGO Y TRANSFERENCIA BANCARIA', margin, y)

    y += 3
    const paymentBoxHeight = 44
    doc.setFillColor(254, 242, 242) // red-50
    doc.setDrawColor(252, 165, 165) // red-300
    doc.setLineWidth(0.6)
    doc.roundedRect(margin, y, contentWidth, paymentBoxHeight, 2.5, 2.5, 'FD')

    rowY = y + 6
    // Importe destacado
    const amountToPay = data.firstPaymentAmount && data.isFractioned ? data.firstPaymentAmount : data.totalAmount

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(127, 29, 29) // red-900
    doc.text('IMPORTE A TRANSFERIR:', col1, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(185, 28, 28)
    doc.text(`${amountToPay.toFixed(2)} €`, col1 + 45, rowY)

    if (data.isFractioned && data.paymentCount) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(154, 52, 18)
        doc.text(`(1.er plazo de ${data.paymentCount} cuotas · Total curso: ${data.totalAmount.toFixed(2)} €)`, col1 + 65, rowY - 0.5)
    }

    if (data.discountApplied) {
        rowY += 5
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7.5)
        doc.setTextColor(21, 128, 61)
        doc.text(`Descuento aplicado: ${data.discountApplied}`, col1, rowY)
    }

    // Cuenta Bancaria (IBAN)
    rowY += 7.5
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(col1, rowY - 4, contentWidth - 8, 10, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('CUENTA BANCARIA (IBAN):', col1 + 3, rowY + 2)

    doc.setFont('courier', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(15, 23, 42)
    doc.text(data.iban || 'ES59 2103 2347 4000 3377 9482', col1 + 52, rowY + 2.3)

    // Concepto Obligatorio
    rowY += 12
    doc.setFillColor(254, 226, 226) // red-100
    doc.setDrawColor(239, 68, 68)
    doc.roundedRect(col1, rowY - 4, contentWidth - 8, 10, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(153, 27, 27) // red-800
    doc.text('CONCEPTO OBLIGATORIO:', col1 + 3, rowY + 2)

    doc.setFont('courier', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(185, 28, 28)
    doc.text(data.paymentConcept || `${data.courseCode}${new Date().getFullYear()}`, col1 + 52, rowY + 2.3)

    // Aviso sobre el concepto
    rowY += 8
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    doc.setTextColor(154, 52, 18)
    const warningText = 'IMPORTANTE: Es imprescindible indicar exactamente este concepto en la transferencia para vincular el pago a tu matrícula.'
    const warningLines = doc.splitTextToSize(warningText, contentWidth - 14)
    doc.text(warningLines, col1 + 3, rowY)

    // 8. Bloque 4: Instrucciones adicionales
    y += paymentBoxHeight + 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('4. PASOS SIGUIENTES', margin, y)

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    doc.text('1. Realiza la transferencia o ingreso en la cuenta bancaria indicada con el concepto obligatorio.', margin, y)
    y += 4
    doc.text('2. Guarda el justificante emitido por tu entidad bancaria tras completar la operación.', margin, y)
    y += 4
    doc.text('3. Remite el justificante bancario a formacion.salamanca@ugt-sp.ugt.org o mediante WhatsApp al +34 600 43 71 34.', margin, y)
    y += 4
    doc.text('4. Una vez validado el ingreso, recibirás la confirmación definitiva y tus credenciales de acceso al aula virtual.', margin, y)

    // 9. Pie legal y Protección de Datos (RGPD)
    y += 10
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
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
    doc.text('UGT Servicios Públicos Salamanca · Documento generado automáticamente como comprobante oficial de pre-inscripción.', pageWidth / 2, 290, { align: 'center' })

    return doc
}
