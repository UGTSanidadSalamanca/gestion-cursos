import fs from 'fs'
import path from 'path'
import { generateReceiptPdf, ReceiptData } from '../src/lib/receipt-pdf'

const sampleData: ReceiptData = {
    studentName: 'CARLOS MARTÍNEZ SÁNCHEZ',
    dni: '12345678Z',
    email: 'carlos.martinez.opos@email.com',
    phone: '611 22 33 44',
    isAffiliated: true,
    courseTitle: 'Preparación de Oposiciones Auxiliar Administrativo SACYL',
    courseCode: 'SACYL-AUX-2026',
    courseLevel: 'Oposiciones Sanidad',
    startDate: '01/03/2026',
    duration: 120,
    durationPeriod: 'Marzo - Julio 2026',
    totalAmount: 180,
    firstPaymentAmount: 60,
    paymentCount: 3,
    isFractioned: true,
    paymentFrequencyLabel: 'Trimestral (3 cuotas)',
    discountApplied: '-15% (Afiliado/a UGT Sanidad)',
    beneficiary: 'UGT Servicios Públicos',
    iban: 'ES59 2103 2347 4000 3377 9482',
    paymentConcept: 'SACYL-AUX-2026-1234',
    enrollmentDate: new Date().toISOString(),
    referenceId: 'UGT-2026-REG-7890'
}

const doc = generateReceiptPdf(sampleData)
const pdfArrayBuffer = doc.output('arraybuffer')
const buffer = Buffer.from(pdfArrayBuffer)

const artifactDir = '/Users/enriquemac/.gemini/antigravity-ide/brain/70bb684e-c4b1-4c64-a2cc-bb6653c5cd05'

const targets = [
    path.join(process.cwd(), 'comprobacion-inscripcion-ugt.pdf'),
    path.join(process.cwd(), 'public', 'comprobacion-inscripcion-ugt.pdf'),
    path.join(artifactDir, 'comprobacion-inscripcion-ugt.pdf')
]

for (const target of targets) {
    try {
        const dir = path.dirname(target)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(target, buffer)
        console.log('PDF generado correctamente en:', target)
    } catch (err) {
        console.error('Error al guardar en:', target, err)
    }
}
