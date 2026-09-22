# Spécifications API & Endpoints - ImmoSena SaaS

## 1. Annonces Immobilières (Properties)

- `GET /api/properties` : Récupère la liste des biens avec filtres dynamiques (ville, quartier, prix min/max, type, équipements).
- `GET /api/properties/:id` : Récupère les détails d'un bien et incrémente le compteur de vues.
- `POST /api/properties` : (Auth Agence requise) Crée une nouvelle annonce sous réserve du respect du quota de son forfait SaaS.
- `PUT /api/properties/:id` : Modifie une annonce existante.
- `DELETE /api/properties/:id` : Supprime une annonce.
- `POST /api/properties/:id/click-whatsapp` : Incrémente le compteur analytique des clics WhatsApp.
- `POST /api/properties/:id/click-call` : Incrémente le compteur des clics d'appel téléphonique.

## 2. Paiements & SaaS Subscriptions

- `POST /api/payments/checkout` : Inicie la souscription SaaS via Wave, Orange Money, Stripe ou PayPal.
- `POST /api/payments/webhook` : Webhook de confirmation de paiement automatique générant la facture PDF.

## 3. Demandes de Visites

- `POST /api/visits` : Soumet une demande de visite et notifie l'agence par e-mail / SMS.
