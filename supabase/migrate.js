const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Récupérer les clés depuis l'environnement ou les arguments de ligne de commande
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.argv[2];
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.argv[3];

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('votre-projet')) {
  console.log("ℹ️  Usage: node supabase/migrate.js <SUPABASE_URL> <SUPABASE_KEY>");
  console.log("   Veuillez renseigner votre URL Supabase et votre clé API dans .env.local");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log(`🔌 Test de connexion à Supabase sur : ${supabaseUrl}...`);
  try {
    const { data, error } = await supabase.from('organizations').select('id, name').limit(1);
    if (error && error.code === '42P01') {
      console.log("⚠️  Connexion réussie, mais les tables ne sont pas encore créées.");
      console.log("👉 Veuillez copier et exécuter le script 'supabase/schema.sql' dans le SQL Editor de votre projet Supabase 'sunugestion'.");
    } else if (error) {
      console.error("❌ Erreur Supabase :", error.message);
    } else {
      console.log("✅ Connexion Supabase active et schéma opérationnel !");
      console.log("   Organisation détectée :", data);
    }
  } catch (err) {
    console.error("❌ Erreur lors du test :", err.message);
  }
}

testConnection();
