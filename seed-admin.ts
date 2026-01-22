import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-utils'

async function main() {
    console.log('Seeding admin user...')

    const adminEmail = 'admin@gestion.com'
    const adminUsername = 'admin'
    const adminPassword = 'admin123'

    const hashedPassword = await hashPassword(adminPassword)

    try {
        const user = await db.user.upsert({
            where: { email: adminEmail },
            update: {
                username: adminUsername,
                password: hashedPassword,
                role: 'ADMIN' // Ensure role is ADMIN
            },
            create: {
                email: adminEmail,
                username: adminUsername,
                name: 'Administrador',
                password: hashedPassword,
                role: 'ADMIN'
            }
        })

        console.log(`User ${user.username} (email: ${user.email}) seeded successfully!`)
    } catch (error) {
        console.error('Error seeding admin user:', error)
    }
}

main()
    .then(async () => {
        await db.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await db.$disconnect()
        process.exit(1)
    })
