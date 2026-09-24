/**
 * Validaciones locales sin APIs externas para DNI/NIE y Correo Electrónico.
 */

// Letras de control oficiales del Ministerio del Interior (Módulo 23)
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

/**
 * Valida matemáticamente un DNI (8 dígitos + letra) o NIE (X/Y/Z + 7 dígitos + letra)
 */
export function validateDniNie(value: string): { isValid: boolean; error?: string; formatted?: string } {
    if (!value || typeof value !== 'string') {
        return { isValid: false, error: 'El DNI/NIE es obligatorio' }
    }

    const clean = value.trim().toUpperCase().replace(/[\s-]/g, '')

    if (!clean) {
        return { isValid: false, error: 'El DNI/NIE es obligatorio' }
    }

    // Comprobar patrón DNI: 8 números + 1 letra
    const dniRegex = /^(\d{8})([A-Z])$/
    // Comprobar patrón NIE: X/Y/Z + 7 números + 1 letra
    const nieRegex = /^([XYZ])(\d{7})([A-Z])$/

    const dniMatch = clean.match(dniRegex)
    const nieMatch = clean.match(nieRegex)

    if (!dniMatch && !nieMatch) {
        if (/^\d+$/.test(clean) && clean.length === 8) {
            // Usuario metió solo 8 números sin letra, le sugerimos cuál sería
            const num = parseInt(clean, 10)
            const expectedLetter = DNI_LETTERS.charAt(num % 23)
            return {
                isValid: false,
                error: `Falta la letra de control (para este número corresponde la '${expectedLetter}')`,
                formatted: `${clean}${expectedLetter}`
            }
        }
        return {
            isValid: false,
            error: 'Formato no válido. Debe tener 8 dígitos y letra (DNI) o empezar por X, Y o Z (NIE).'
        }
    }

    if (dniMatch) {
        const num = parseInt(dniMatch[1], 10)
        const letter = dniMatch[2]
        const expectedLetter = DNI_LETTERS.charAt(num % 23)

        if (letter !== expectedLetter) {
            return {
                isValid: false,
                error: `La letra '${letter}' no es válida para este DNI (debería ser '${expectedLetter}').`,
                formatted: `${dniMatch[1]}${expectedLetter}`
            }
        }

        return { isValid: true, formatted: clean }
    }

    if (nieMatch) {
        let prefixNum = '0'
        if (nieMatch[1] === 'Y') prefixNum = '1'
        else if (nieMatch[1] === 'Z') prefixNum = '2'

        const num = parseInt(prefixNum + nieMatch[2], 10)
        const letter = nieMatch[3]
        const expectedLetter = DNI_LETTERS.charAt(num % 23)

        if (letter !== expectedLetter) {
            return {
                isValid: false,
                error: `La letra '${letter}' no es válida para este NIE (debería ser '${expectedLetter}').`,
                formatted: `${nieMatch[1]}${nieMatch[2]}${expectedLetter}`
            }
        }

        return { isValid: true, formatted: clean }
    }

    return { isValid: false, error: 'Documento no válido.' }
}

// Dominios temporales o desechables comunes para bloquear
const DISPOSABLE_DOMAINS = [
    'yopmail.com', 'yopmail.fr', 'yopmail.net', 'tempmail.com', 'temp-mail.org',
    '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net', 'mailinator.com',
    'trashmail.com', 'sharklasers.com', 'getnada.com', 'mohmal.com', 'dispostable.com',
    'throwawaymail.com', 'fakeinbox.com', 'burnermail.io'
]

// Errores tipográficos comunes en dominios y su corrección sugerida
const DOMAIN_TYPOS: Record<string, string> = {
    // Gmail
    'gmil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmeil.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.es': 'gmail.com',
    'gemail.com': 'gmail.com',
    'gmaild.com': 'gmail.com',
    
    // Hotmail
    'hotmial.com': 'hotmail.com',
    'hotmial.es': 'hotmail.es',
    'hotmal.com': 'hotmail.com',
    'hotmal.es': 'hotmail.es',
    'hotmai.com': 'hotmail.com',
    'hotmai.es': 'hotmail.es',
    'hotmaill.com': 'hotmail.com',
    'hotmaill.es': 'hotmail.es',
    'homail.com': 'hotmail.com',
    'homail.es': 'hotmail.es',
    'hotamail.com': 'hotmail.com',
    'jotmail.com': 'hotmail.com',
    'jotmail.es': 'hotmail.es',

    // Outlook
    'outlok.com': 'outlook.com',
    'outlok.es': 'outlook.es',
    'outloo.com': 'outlook.com',
    'outloock.com': 'outlook.com',
    'putlook.com': 'outlook.com',

    // Yahoo
    'yahooo.es': 'yahoo.es',
    'yahooo.com': 'yahoo.com',
    'yaho.es': 'yahoo.es',
    'yaho.com': 'yahoo.com',
    'yaho.com.es': 'yahoo.es',

    // iCloud
    'iclud.com': 'icloud.com',
    'iclou.com': 'icloud.com',
    'icloud.es': 'icloud.com'
}

/**
 * Valida un correo, detecta dominios temporales/de prueba y propone sugerencias de corrección tipográfica
 */
export function checkEmailValidation(email: string): {
    isValid: boolean
    error?: string
    suggestion?: string
    isTestOrFake?: boolean
} {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'El correo electrónico es obligatorio.' }
    }

    const clean = email.trim().toLowerCase()

    // 1. Detectar términos explícitos de prueba / falsos
    const testTerms = ['prueba', 'test', 'ejemplo', 'example', 'fake', 'asdf', 'inventado', 'noemail', 'sincorreo']
    const parts = clean.split('@')

    if (parts.length === 2) {
        const [user, domain] = parts

        // Si el usuario o dominio contiene "prueba" u otros términos ficticios
        if (
            testTerms.some(t => user === t || user.startsWith(`${t}.`) || user.startsWith(`${t}_`) || user.startsWith(`${t}1`)) ||
            domain === 'prueba.com' ||
            domain === 'prueba.es' ||
            domain.startsWith('prueba.') ||
            domain === 'test.com' ||
            domain === 'test.es' ||
            domain === 'ejemplo.com' ||
            domain === 'ejemplo.es' ||
            domain === 'example.com' ||
            domain === 'example.org'
        ) {
            return {
                isValid: false,
                isTestOrFake: true,
                error: 'No se permiten direcciones de prueba ni correos de ejemplo. Por favor, introduce un correo electrónico real y activo.'
            }
        }

        // Comprobar dominios desechables
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            return {
                isValid: false,
                isTestOrFake: true,
                error: 'No se admiten cuentas de correo temporales o desechables. Por favor, usa una cuenta permanente.'
            }
        }

        // Comprobar sugerencias de errores tipográficos en el dominio
        if (DOMAIN_TYPOS[domain]) {
            const suggestedDomain = DOMAIN_TYPOS[domain]
            return {
                isValid: true,
                suggestion: `${user}@${suggestedDomain}`
            }
        }
    }

    // 2. Validación estándar de formato de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(clean)) {
        return {
            isValid: false,
            error: 'El formato del correo electrónico no parece válido (ej: nombre@gmail.com).'
        }
    }

    return { isValid: true }
}
