const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT query, calls, total_exec_time, mean_exec_time 
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_catalog%' 
        AND query NOT LIKE '%neon_perf_counters%' 
        AND query NOT LIKE '%pg_stat%'
        AND query NOT LIKE '%DEALLOCATE%'
        AND query NOT LIKE 'BEGIN'
        AND query NOT LIKE 'COMMIT'
      ORDER BY total_exec_time DESC 
      LIMIT 10;
    `;
    console.log(JSON.stringify(stats, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

check().finally(() => prisma.$disconnect());
