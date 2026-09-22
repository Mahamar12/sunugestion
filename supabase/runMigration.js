const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const projectRef = 'hvmznbgxsmtssstmkbiu';
const user = `postgres.${projectRef}`;
const password = process.argv[2] || '@Mahamar123';
const database = 'postgres';

const regions = [
  'eu-west-3',    // Paris (very common for Francophone Africa / Senegal)
  'eu-west-1',    // Ireland
  'eu-central-1', // Frankfurt
  'eu-west-2',    // London
  'af-south-1',   // Cape Town
  'us-east-1',    // N. Virginia
  'us-east-2',    // Ohio
  'us-west-1',    // N. California
  'us-west-2',    // Oregon
  'ca-central-1', // Canada
  'ap-southeast-1',// Singapore
  'ap-south-1',   // Mumbai
  'sa-east-1',    // São Paulo
  'eu-north-1',   // Stockholm
  'me-central-1'  // UAE
];

async function tryRegion(region, port) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`\n🎉 SUCCÈS ! Connecté à Supabase sur la région : ${region} (port ${port})`);
    
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Exécution du schéma SQL SunuGestion...');
    await client.query(sql);
    console.log('✅ TOUTES LES 15 TABLES, POLITIQUES RLS ET LE BUCKET STORAGE ONT ÉTÉ CRÉÉS AVEC SUCCÈS !');

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log('\n📋 Tables vérifiées en base :');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

    await client.end();
    return true;
  } catch (err) {
    process.stdout.write(`.`);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  console.log(`🔍 Recherche de la région Supabase pour le projet ${projectRef}...`);
  // Try port 5432 (session mode)
  for (const region of regions) {
    const ok = await tryRegion(region, 5432);
    if (ok) return;
  }

  // Try port 6543 (transaction mode)
  for (const region of regions) {
    const ok = await tryRegion(region, 6543);
    if (ok) return;
  }

  console.log("\n❌ Aucune région pooler n'a répondu. Tentative directe...");
}

run();
