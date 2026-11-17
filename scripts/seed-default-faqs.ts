import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const DEFAULT_FAQS = [
  {
    category: "Inscripción",
    question: "¿Cómo formalizo mi preinscripción en el curso?",
    answer: "Completa el formulario online con tus datos personales (nombre, DNI/NIE, teléfono y correo electrónico). Una vez enviado, el sistema generará de forma inmediata tu resguardo oficial en PDF con un número de referencia identificativo y las indicaciones para tramitar la reserva de plaza.",
    order: 1,
    isActive: true
  },
  {
    category: "Inscripción",
    question: "¿La preinscripción online garantiza mi plaza definitiva?",
    answer: "La preinscripción constituye una reserva provisional de plaza. La confirmación definitiva se formaliza una vez comprobado el abono bancario correspondiente dentro del plazo estipulado y verificado el cumplimiento de los requisitos del programa formativo.",
    order: 2,
    isActive: true
  },
  {
    category: "Afiliación y descuentos",
    question: "¿Qué ventajas tienen las personas afiliadas a UGT Servicios Públicos?",
    answer: "Las personas afiliadas a UGT disfrutan de una cuota reducida exclusiva en el importe de la matrícula. Al tramitar la preinscripción, basta con marcar la casilla de afiliación para que el sistema aplique automáticamente este descuento.",
    order: 3,
    isActive: true
  },
  {
    category: "Afiliación y descuentos",
    question: "¿Existen descuentos adicionales aplicables a la matrícula?",
    answer: "Algunas acciones formativas contemplan descuentos específicos (desempleo, estudiantes u otras bonificaciones) siempre que figuren habilitados en la ficha del curso. Podrás seleccionar las deducciones que te correspondan directamente en el formulario de inscripción.",
    order: 4,
    isActive: true
  },
  {
    category: "Precios y pagos",
    question: "¿Cómo y cuándo se debe realizar el abono del curso?",
    answer: "El abono se efectúa mediante transferencia bancaria al número de cuenta (IBAN) de UGT Servicios Públicos Salamanca indicado en el resguardo de preinscripción. Es imprescindible señalar el código del curso y tu nombre en el concepto bancario de la operación.",
    order: 5,
    isActive: true
  },
  {
    category: "Precios y pagos",
    question: "¿Es posible fraccionar el pago de la formación?",
    answer: "En cursos de larga duración o preparación de oposiciones que lo tengan habilitado, se permite el pago fraccionado en cuotas periódicas sin intereses. La cuantía y el calendario de cada mensualidad se detallan en el justificante de preinscripción.",
    order: 6,
    isActive: true
  },
  {
    category: "Cancelaciones y devoluciones",
    question: "¿Qué sucede si no se alcanza el número mínimo de alumnos?",
    answer: "La celebración de la actividad docente requiere alcanzar el cupo mínimo de alumnos establecido para garantizar su viabilidad pedagógica. Si el curso no pudiese iniciarse por causas imputables a la organización, se reintegrará de inmediato el 100% de la cantidad abonada.",
    order: 7,
    isActive: true
  },
  {
    category: "Cancelaciones y devoluciones",
    question: "¿Disfruto de derecho de desistimiento una vez matriculado?",
    answer: "Sí. De conformidad con la normativa vigente en materia de derechos de las personas consumidoras, dispones de un plazo de 14 días naturales desde la fecha de contratación para ejercer el desistimiento sin penalización.",
    order: 8,
    isActive: true
  },
  {
    category: "Materiales y certificados",
    question: "¿Se expide certificado acreditativo al finalizar la formación?",
    answer: "Sí. Al completar satisfactoriamente la acción formativa y reuniendo los requisitos exigidos de asistencia y aprovechamiento, UGT Servicios Públicos Salamanca expedirá el diploma o certificado oficial acreditativo.",
    order: 9,
    isActive: true
  },
  {
    category: "Materiales y certificados",
    question: "¿Están incluidos los temarios y materiales didácticos?",
    answer: "Salvo indicación expresa en la ficha técnica del curso, todos los materiales, esquemas, cuestionarios y documentación complementaria elaborada por el equipo docente están incluidos en el precio del curso.",
    order: 10,
    isActive: true
  }
]

async function main() {
  console.log("🌱 Insertando preguntas frecuentes predeterminadas...")

  for (const faq of DEFAULT_FAQS) {
    const existing = await prisma.faq.findFirst({
      where: {
        question: faq.question,
        courseId: null
      }
    })

    if (!existing) {
      await prisma.faq.create({
        data: {
          ...faq,
          courseId: null
        }
      })
      console.log(`✓ Creada FAQ: ${faq.question}`)
    } else {
      console.log(`- Ya existe FAQ: ${faq.question}`)
    }
  }

  console.log("✅ Proceso de siembra de FAQs completado.")
}

main()
  .catch((e) => {
    console.error("Error al sembrar FAQs:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
