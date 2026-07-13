# PoolGenAI — application PWA installable

PoolGenAI stocke tes mesures, produits, bassins et photos directement dans
ton navigateur (IndexedDB). Elles restent sur ton téléphone même après
fermeture de l'app.

## Accéder à l'application

L'app est déjà en ligne, pas besoin de l'héberger toi-même :

**https://app.poolgenai.com**

Ouvre cette URL dans Chrome (Android) ou Safari (iPhone).

## Installer l'app sur ton téléphone

- **Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil" /
  "Installer l'application".
- **iPhone (Safari)** : bouton de partage (carré avec flèche) → "Sur l'écran
  d'accueil".

L'icône apparaît alors comme une vraie app, en plein écran, sans barre
d'adresse. La caméra fonctionne nativement via cette installation.

## Analyse IA des mesures

Le bouton "Analyser les couleurs" (bandelette) et le mode photomètre
fonctionnent tous les deux normalement : l'analyse passe par un serveur
dédié (Cloudflare Worker), pas besoin d'être dans l'environnement Claude.ai.

## Tes données

Tout reste local à ton téléphone et à ce navigateur précis. Si tu
désinstalles l'app ou vides les données du site, tout est perdu. Pense à
générer un rapport PDF régulièrement si tu veux garder une trace de
l'historique.
