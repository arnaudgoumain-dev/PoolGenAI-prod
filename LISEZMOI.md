# PoolApp — version PWA installable

Cette version remplace le stockage propriétaire de Claude par une vraie base
locale dans ton navigateur (IndexedDB). Les mesures, produits, bassins et
photos restent sur ton téléphone, même après fermeture de l'app.

## Important : il faut un vrai serveur web

Tu ne peux PAS ouvrir `index.html` directement en double-cliquant (`file://`).
Le navigateur bloque le chargement du composant et le stockage dans ce mode.
Il faut héberger ces fichiers, même de façon minimale.

## Option recommandée : GitHub, entièrement depuis le mobile

1. Télécharge le zip `poolapp-pwa.zip` sur ton téléphone, puis dézippe-le
   (Android : appui long sur le fichier → "Extraire" ; iPhone : tape dessus
   dans l'app Fichiers, il se décompresse tout seul en dossier).
2. Crée un compte GitHub si tu n'en as pas (github.com, dans Chrome/Safari).
3. Bouton **+** en haut à droite → **New repository**. Nom libre, visibilité
   **Public**, puis **Create repository**.
4. Sur la page du dépôt vide : **Add file → Upload files**.
5. Tape sur **"choose your files"** (PAS de glisser-déposer de dossier sur
   mobile, ça ne fonctionne pas) → ton sélecteur de fichiers s'ouvre →
   sélectionne les 8 fichiers du dossier dézippé un par un ou tous en
   sélection multiple → Ouvrir/Open.
6. En bas de page, écris un message de commit puis **Commit changes**.
7. Va dans **Settings → Pages** → Source : "Deploy from a branch" → branche
   `main`, dossier `/ (root)` → **Save**.
8. Attends 1 à 2 minutes. L'URL apparaît en haut de cette page Pages, du
   type `https://tonpseudo.github.io/nom-du-depot/`.
9. Ouvre cette URL dans Chrome (Android) ou Safari (iPhone).

## Pourquoi pas Netlify Drop

Netlify Drop (la solution "glisser-déposer en 10 secondes") ne fonctionne
pas correctement sur navigateur mobile : pas de sélection de dossier, pas de
bouton d'upload de zip fiable sur cette interface. GitHub reste la voie la
plus sûre depuis un téléphone.


## Limite connue

Le bouton "Analyser les couleurs" (mode bandelette) ne fonctionnera pas dans
cette version : il appelle l'API Claude, accessible uniquement depuis
l'environnement artifact de Claude.ai. Le mode photomètre (saisie manuelle
des valeurs + photo) fonctionne normalement, lui.

## Tes données

Tout reste local à ton téléphone et à ce navigateur précis. Si tu
désinstalles l'app ou vides les données du site, tout est perdu — pense à
exporter/sauvegarder si tu accumules un historique important (pas encore de
fonction d'export dans l'app ; à ajouter si besoin).

## Une fois l'app ouverte sur ton téléphone

- **Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil" /
  "Installer l'application".
- **iPhone (Safari)** : bouton de partage (carré avec flèche) → "Sur l'écran
  d'accueil".

L'icône apparaît alors comme une vraie app, en plein écran, sans barre
d'adresse. La caméra fonctionne nativement via cette installation.
