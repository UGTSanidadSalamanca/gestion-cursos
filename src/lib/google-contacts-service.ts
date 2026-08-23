export interface SyncGoogleContactParams {
    name: string
    email: string
    phone?: string
    dni?: string
    isAffiliated?: boolean
    courseTitle: string
    courseCode: string
}

/**
 * Sincroniza los datos del alumno con la cuenta de Google Contacts (Gmail)
 * asignándole la etiqueta correspondiente al curso.
 */
export async function syncStudentToGoogleContacts(params: SyncGoogleContactParams): Promise<boolean> {
    const webhookUrl = process.env.GOOGLE_CONTACTS_WEBHOOK_URL
    const secretToken = process.env.GOOGLE_CONTACTS_SECRET_TOKEN || 'ugt_salamanca_contacts_secure_key_2026'

    if (!webhookUrl) {
        // Si no está configurada la variable en .env, no bloqueamos la app
        return false
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: params.name,
                email: params.email,
                phone: params.phone,
                dni: params.dni,
                isAffiliated: params.isAffiliated,
                courseTitle: params.courseTitle,
                courseCode: params.courseCode,
                secretToken
            }),
            // Timeout de 6 segundos para no retrasar el proceso
            signal: AbortSignal.timeout(6000)
        })

        if (!response.ok) {
            console.warn(`[GoogleContacts] Error en webhook: ${response.status} ${response.statusText}`)
            return false
        }

        const data = await response.json()
        if (data.error) {
            console.warn('[GoogleContacts] Respuesta con error del script de Google:', data.error)
            return false
        }

        console.log(`[GoogleContacts] Contacto ${params.email} sincronizado con éxito en grupo ${data.groupName || params.courseCode}`)
        return true
    } catch (error) {
        console.error('[GoogleContacts] Error al sincronizar contacto con Google:', error)
        return false
    }
}
