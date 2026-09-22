# Guide de Déploiement & Installation Production

## 1. Pré-requis
- Node.js >= 18.x / 20.x / 24.x
- Compte Vercel / Netlify ou serveur VPS Ubuntu Nginx.
- Instance Supabase PostgreSQL configurée avec les variables d'environnement.

## 2. Variables d'Environnement `.env.production`

```env
NEXT_PUBLIC_SITE_URL=https://immosena.sn
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WAVE_API_KEY=your-wave-key
ORANGE_MONEY_SECRET=your-om-secret
STRIPE_SECRET_KEY=sk_live_...
```

## 3. Installation et Build Local

```bash
cd immosena-saas
npm install
npm run build
npm run start
```

## 4. Configuration Domaine .SN & SSL
- Assigner les enregistrements CNAME Vercel dans l'espace NIC Sénégal (`nic.sn`).
- SSL TLS v1.3 automatique généré par Let's Encrypt / Vercel Edge.
