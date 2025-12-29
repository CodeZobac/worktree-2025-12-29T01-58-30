import { prisma } from '../lib/prisma';

async function main() {
    try {
        console.log('Attempting to connect to database...');
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);

        // Attempt a write operation
        console.log('Attempting to write to database (create temporary user)...');
        // Using a random email to avoid unique constraint errors if run multiple times (though we delete it)
        const testUser = await prisma.user.create({
            data: {
                email: `test-write-${Date.now()}@example.com`,
                name: 'Test Write User',
            }
        });
        console.log('Write successful. Created user:', testUser.id);

        await prisma.user.delete({ where: { id: testUser.id } });
        console.log('Delete successful');

    } catch (e) {
        console.error('Database check failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
