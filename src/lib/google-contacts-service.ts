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
    const rawUrl = process.env.GOOGLE_CONTACTS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbziQx4lHa31GQLZSRa_lUZuA2EMk7SApB0A7IjI3-ghkM0ENsbVSBWjxYqxmiy-_LQWeA/exec'
    const webhookUrl = rawUrl.trim().replace(/^["']|["']$/g, '')
    const rawToken = process.env.GOOGLE_CONTACTS_SECRET_TOKEN || 'ugt_salamanca_contacts_secure_key_2026'
    const secretToken = rawToken.trim().replace(/^["']|["']$/g, '')

    if (!webhookUrl) {
        console.warn('[GoogleContacts] URL no disponible')
        return false
    }

    try {
        console.log(`[GoogleContacts] Iniciando sincronización de ${params.email} para curso ${params.courseCode}...`)
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
            // Timeout de 10 segundos
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            console.warn(`[GoogleContacts] Error HTTP en webhook: ${response.status} ${response.statusText}`)
            return false
        }

        const data = await response.json()
        if (data.error) {
            console.warn('[GoogleContacts] Respuesta con error de Google Apps Script:', data.error)
            return false
        }

        console.log(`[GoogleContacts] ¡Éxito! Contacto ${params.email} sincronizado en grupo "${data.groupName || params.courseCode}"`)
        return true
    } catch (error) {
        console.error('[GoogleContacts] Error al sincronizar contacto con Google:', error)
        return false
    }
}
