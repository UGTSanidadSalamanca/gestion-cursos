import fs from 'fs'
import path from 'path'
import { generateReceiptPdf, ReceiptData } from '../src/lib/receipt-pdf'

const sampleData: ReceiptData = {
    studentName: 'LAURA GÓMEZ MARTÍN',
    dni: '12345678Z',
    email: 'laura.gomez.opos@gmail.com',
    phone: '612 34 56 78',
    isAffiliated: true,
    courseTitle: 'Auxiliar Administrativo de JCyl',
    courseCode: 'CURSO002',
    courseLevel: 'Preparación Oposiciones',
    startDate: '02/02/2026',
    duration: 78,
    durationPeriod: 'Febrero - Julio',
    totalAmount: 105,
    firstPaymentAmount: 35,
    paymentCount: 3,
    isFractioned: true,
    paymentFrequencyLabel: 'Trimestral (3 plazos)',
    discountApplied: '-10% (Antiguo Alumno)',
    beneficiary: 'UGT Servicios Públicos',
    iban: 'ES59 2103 2347 4000 3377 9482',
    paymentConcept: 'CURSO0022026',
    enrollmentDate: new Date().toISOString(),
    referenceId: 'UGT-2026-PRE-8492'
}

const doc = generateReceiptPdf(sampleData)
const pdfArrayBuffer = doc.output('arraybuffer')
const buffer = Buffer.from(pdfArrayBuffer)

const targetPublicPath = path.join(process.cwd(), 'public', 'ejemplo-justificante-preinscripcion.pdf')
fs.writeFileSync(targetPublicPath, buffer)
console.log('PDF saved to:', targetPublicPath)

const artifactDir = '/Users/enriquemac/.gemini/antigravity/brain/84c2871d-3743-4398-a2a2-19782cdf88d7'
if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, 'ejemplo-justificante-preinscripcion.pdf')
    fs.writeFileSync(artifactPath, buffer)
    console.log('PDF saved to artifact dir:', artifactPath)
}
