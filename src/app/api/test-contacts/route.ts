import { NextRequest, NextResponse } from 'next/server'
import { syncStudentToGoogleContacts } from '@/lib/google-contacts-service'

export async function GET(request: NextRequest) {
    const webhookUrl = process.env.GOOGLE_CONTACTS_WEBHOOK_URL
    const secretToken = process.env.GOOGLE_CONTACTS_SECRET_TOKEN

    const isWebhookSet = !!webhookUrl
    const maskedUrl = webhookUrl ? `${webhookUrl.substring(0, 35)}...${webhookUrl.substring(webhookUrl.length - 10)}` : 'NO_CONFIGURADA'

    if (!webhookUrl) {
        return NextResponse.json({
            ok: false,
            error: 'La variable GOOGLE_CONTACTS_WEBHOOK_URL no está disponible en este entorno de Vercel.',
            maskedUrl,
            hasSecretToken: !!secretToken
        }, { status: 500 })
    }

    try {
        const testPayload = {
            name: "Alumno Diagnóstico Vercel",
            email: "test.diagnostico@ugt-sp.org",
            phone: "600999888",
            dni: "00000001D",
            isAffiliated: true,
            courseTitle: "Curso Diagnóstico Vercel",
            courseCode: "TEST-VERCEL"
        }

        const success = await syncStudentToGoogleContacts(testPayload)

        return NextResponse.json({
            ok: success,
            message: success ? 'Sincronización enviada con éxito desde Vercel hacia Google Contacts' : 'El webhook devolvió error o no respondió',
            webhookConfigured: isWebhookSet,
            maskedUrl,
            hasSecretToken: !!secretToken,
            testPayload
        })
    } catch (error) {
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            webhookConfigured: isWebhookSet,
            maskedUrl
        }, { status: 500 })
    }
}
