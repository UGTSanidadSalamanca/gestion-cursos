import fs from 'fs'
import path from 'path'
import { generateReceiptPdf, ReceiptData } from '../src/lib/receipt-pdf'

// Datos 100% reales del curso "Auxiliar Administrativo de JCyl" (CURSO002)
// con datos ficticios de alumno
const dataAffiliated: ReceiptData = {
    studentName: 'MANUEL HERNÁNDEZ SÁNCHEZ',
    dni: '71234567K',
    email: 'manuel.hernandez.opos@gmail.com',
    phone: '644 12 34 56',
    isAffiliated: true,
    courseTitle: 'Auxiliar Administrativo de JCyl',
    courseCode: 'CURSO002',
    courseLevel: 'Preparación Oposiciones',
    startDate: '02/02/2026',
    duration: 78,
    durationPeriod: 'Febrero - Julio',
    totalAmount: 35,
    firstPaymentAmount: 35,
    paymentCount: 1,
    isFractioned: false,
    paymentFrequencyLabel: 'Mensual / Pago único',
    iban: 'ES59 2103 2347 4000 3377 9482',
    paymentConcept: 'CURSO0022026',
    enrollmentDate: '2026-02-02T10:30:00.000Z',
    referenceId: 'UGT-2026-CURSO002-4567'
}

const doc = generateReceiptPdf(dataAffiliated)
const pdfArrayBuffer = doc.output('arraybuffer')
const buffer = Buffer.from(pdfArrayBuffer)

const filesToSave = [
    path.join(process.cwd(), 'justificante_preinscripcion_aux_admin_jcyl.pdf'),
    path.join(process.cwd(), 'public', 'justificante_preinscripcion_aux_admin_jcyl.pdf'),
    path.join('/Users/enriquemac/.gemini/antigravity/brain/84c2871d-3743-4398-a2a2-19782cdf88d7', 'justificante_preinscripcion_aux_admin_jcyl.pdf')
]

for (const targetPath of filesToSave) {
    try {
        fs.writeFileSync(targetPath, buffer)
        console.log('Saved PDF to:', targetPath)
    } catch (e) {
        console.error('Error saving to', targetPath, e)
    }
}
