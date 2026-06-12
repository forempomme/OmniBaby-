# 🍼 OmniBaby

Application Android de suivi bébé en famille — BabyLog, suivi de croissance, sommeil, médicaments, diversification alimentaire, journal de bord et gestion multi-utilisateurs avec verrouillage par code PIN / empreinte digitale.

---

## 📋 Sommaire

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Arborescence du projet](#-arborescence-du-projet)
- [Stockage des données](#-stockage-des-données)
- [Authentification](#-authentification)
- [Build & déploiement (GitHub Actions)](#-build--déploiement-github-actions)
- [Versioning](#-versioning)
- [Développement local](#-développement-local)
- [Roadmap / idées futures](#-roadmap--idées-futures)

---

## 📱 Présentation

OmniBaby est une application **React + Capacitor**, packagée en **APK Android natif**, fonctionnant **100% hors-ligne** avec stockage local (`localStorage`). Aucun compte email, aucun serveur : toutes les données restent sur l'appareil.

L'app est pensée pour être utilisée par **plusieurs membres de la famille** (parents, grands-parents...) sur un même téléphone ou tablette, chacun avec son propre profil et code PIN.

---

## ✨ Fonctionnalités

### Onglets principaux

| Onglet | Description |
|---|---|
| 📓 **Journal** | BabyLog — biberons, couches, sommeil, autres événements, avec timeline du jour |
| 📈 **Santé** | GrandisBien — mesures (poids/taille/PC), courbe OMS, carnet de vaccination |
| 🌙 **Dodo** | DodoZen — suivi du sommeil (nuits/siestes), qualité, conseils, graphique hebdo |
| 🛠️ **Outils** | Sous-menu avec 7 modules (voir ci-dessous) |
| ⚙️ **Réglages** | Profil enfant, utilisateurs, apparence, export/import, reset |

### Sous-modules "Outils"

| Module | Description |
|---|---|
| ⏱️ **Minuteur** | Chrono de tétée par sein avec alternance automatique |
| 💊 **Médocs** | Suivi des traitements en cours, doses, fréquences |
| 🌡️ **Fièvre** | Courbe de température, historique, alertes fièvre |
| 🥦 **Aliments** | Diversification alimentaire, filtrage par catégorie, allergènes |
| 📊 **Stats** | Graphiques biberons / sommeil / couches sur 7 jours |
| 📸 **Journal** | Souvenirs, étapes de développement, moments forts |
| 👨‍👩‍👧 **Famille** | Gestion des utilisateurs (ajout, modification, suppression, rôles) |

### Fonctionnalités transverses

- ✏️ **Modification** et 🗑️ **suppression** de chaque entrée (toutes les listes)
- 🌙 **Mode sombre** manuel + automatique (21h–7h)
- 📤 **Export JSON** complet (sauvegarde)
- 📥 **Import JSON** (restauration)
- 🔄 **Réinitialisation complète** de l'app (double confirmation)
- 🔢 **Numéro de version** affiché dans le bandeau en haut de chaque écran

---

## 🏗️ Architecture technique

| Couche | Technologie |
|---|---|
| Framework UI | **React 18** (hooks, context) |
| Build tool | **Vite 5** |
| Packaging Android | **Capacitor 6** |
| Stockage | **localStorage** (navigateur embarqué WebView) |
| Authentification | Code **PIN local** + **biométrie** via `capacitor-native-biometric` |
| CI/CD | **GitHub Actions** |
| Signature APK | **Keystore Java** (`keytool`), committé dans le repo |

### Pourquoi Capacitor ?

Capacitor encapsule l'application web (HTML/CSS/JS générés par Vite) dans une **WebView Android native**, génère le projet `android/` automatiquement (`npx cap add android`), et permet d'accéder aux API natives (biométrie, etc.) via des plugins npm.

---

## 📂 Arborescence du projet

```
omnibaby/
├── .github/
│   └── workflows/
│       └── build.yml          # Workflow CI : build + signe + publie l'APK
│
├── src/
│   ├── App.jsx                 # Application complète (tous les composants)
│   ├── main.jsx                # Point d'entrée React (ReactDOM.createRoot)
│   └── version.js               # Numéro de version (auto-généré par le CI)
│
├── assets/
│   └── android-icons/           # Icônes de l'app par résolution (mipmap-*dpi)
│       ├── mipmap-mdpi/
│       ├── mipmap-hdpi/
│       ├── mipmap-xhdpi/
│       ├── mipmap-xxhdpi/
│       └── mipmap-xxxhdpi/
│
├── android/                      # Généré automatiquement par `npx cap add android`
│   └── (projet Android natif complet, régénéré à chaque build)
│
├── index.html                    # Point d'entrée HTML (Vite)
├── package.json                  # Dépendances npm + métadonnées
├── vite.config.js                # Configuration du build Vite
├── version.properties            # Source de vérité du versioning (MAJOR/MINOR/PATCH)
├── .gitignore
└── README.md                      # Ce fichier
```

> 💡 Le dossier `android/` n'est **pas versionné en détail** — il est régénéré à chaque build via Capacitor (`npx cap add android` + `npx cap sync`). Seul le keystore de signature y est conservé entre les builds.

---

## 💾 Stockage des données

Toutes les données sont stockées **localement sur l'appareil**, dans le `localStorage` de la WebView, sous deux clés :

| Clé | Contenu |
|---|---|
| `omnibaby_store_v1` | Toutes les données de l'app : profil enfant, utilisateurs, entrées BabyLog, mesures, vaccins, sommeils, médicaments, températures, aliments, journal |
| `omnibaby_session_v1` | Session active (utilisateur actuellement connecté) |

### Structure de `omnibaby_store_v1`

```json
{
  "child": { "id": ..., "nom": "...", "emoji": "👶", "birthdate": "YYYY-MM-DD" },
  "users": [ { "id": ..., "nom": "...", "pin": "1234", "role": "admin", "initiales": "MA", "couleur": "purple" } ],
  "entries": [ ... ],
  "mesures": [ ... ],
  "vaccins": [ ... ],
  "sommeils": [ ... ],
  "medicaments": [ ... ],
  "temperatures": [ ... ],
  "aliments": [ ... ],
  "journal": [ ... ]
}
```

### Export / Import

- **Export** (Réglages → Données → Exporter en JSON) : télécharge un fichier `omnibaby-export-AAAA-MM-JJ.json` contenant l'intégralité de `omnibaby_store_v1`.
- **Import** : remplace entièrement le store actuel par le contenu du fichier JSON sélectionné.
- **Reset** : efface les deux clés `localStorage` et réinitialise l'app à son état initial (aucun profil, aucun utilisateur).

---

## 🔐 Authentification

L'app utilise un système **100% local**, sans email ni serveur :

1. **Premier lancement** : aucun utilisateur n'existe → écran de création du premier profil (prénom + code PIN à 4 chiffres) → devient automatiquement **Admin**.

2. **Lancements suivants** : écran de verrouillage à chaque ouverture de l'app :
   - Sélection du profil (avatar)
   - Saisie du code PIN (clavier numérique intégré)
   - **OU** bouton "Empreinte digitale" → utilise `capacitor-native-biometric` (fingerprint Android natif). Si la biométrie est indisponible, le PIN reste utilisable.

3. **Rôles** :
   | Rôle | Permissions |
   |---|---|
   | **Admin** | Tout : profils, utilisateurs, données, reset |
   | **Éditeur** | Ajouter / modifier des entrées |
   | **Lecture seule** | Consultation uniquement |

4. **Gestion des utilisateurs** (onglet Famille) : ajout, modification (nom/PIN/couleur/rôle), suppression — le dernier utilisateur ne peut pas être supprimé.

---

## 🚀 Build & déploiement (GitHub Actions)

Le fichier `.github/workflows/build.yml` automatise entièrement la création de l'APK signé.

### Déclencheurs

- **Push sur `main`** → build automatique avec incrément **patch** (ex: 1.0.3 → 1.0.4)
- **Déclenchement manuel** (`workflow_dispatch`) → choix du type d'incrément : `patch` / `minor` / `major`

### Étapes du workflow

1. **Checkout** du repo
2. **Calcul de la version** à partir de `version.properties`
3. **Mise à jour** de `version.properties` et `src/version.js`
4. **Build React** (`npm install` + `npm run build` → génère `dist/`)
5. **Capacitor** : `npx cap init` + `npx cap add android` + `npx cap sync android`
6. **Fix Maven** : ajout d'un miroir Maven Central (contourne les erreurs 403 sur le runner GitHub)
7. **Injection des icônes** depuis `assets/android-icons/`
8. **Décodage du keystore** depuis le secret `KEYSTORE_BASE64`
9. **Build de l'APK signé** (`./gradlew assembleRelease`)
10. **Renommage** : `OmniBaby-v{VERSION}.apk`
11. **Création du ZIP** des sources web : `OmniBaby-web-v{VERSION}.zip`
12. **Commit** du bump de version + **tag Git** `v{VERSION}`
13. **Upload artifact** (sauvegarde 30 jours)
14. **Publication d'une GitHub Release** avec l'APK et le ZIP en téléchargement

### Secrets GitHub requis

À configurer dans **Settings → Secrets and variables → Actions** :

| Secret | Description |
|---|---|
| `KEYSTORE_BASE64` | Keystore de signature encodé en base64 |
| `KEYSTORE_PASSWORD` | Mot de passe du keystore |
| `KEY_ALIAS` | Alias de la clé (`omnibaby`) |
| `KEY_PASSWORD` | Mot de passe de la clé |

### Installation / mise à jour sur Android

1. Télécharger `OmniBaby-v{VERSION}.apk` depuis l'onglet **Releases**
2. Ouvrir le fichier sur le téléphone
3. Autoriser l'installation depuis des sources inconnues si demandé
4. Installer — **les mises à jour se font par-dessus sans perte de données**, car l'APK est toujours signé avec le même keystore

---

## 🔢 Versioning

Le numéro de version suit le format **`MAJOR.MINOR.PATCH`** (ex: `1.3.2`), géré automatiquement.

| Type | Quand l'utiliser | Effet |
|---|---|---|
| **PATCH** | Correction de bug | `1.0.3` → `1.0.4` (automatique à chaque push) |
| **MINOR** | Nouvelle fonctionnalité | `1.0.4` → `1.1.0` (déclenchement manuel) |
| **MAJOR** | Refonte majeure / breaking change | `1.1.0` → `2.0.0` (déclenchement manuel) |

### Où la version est stockée / affichée

- **Source de vérité** : `version.properties` (racine du repo)
- **Utilisée par l'app** : `src/version.js` (généré automatiquement par le CI à partir de `version.properties`)
- **Affichage** : bandeau violet en haut de chaque écran de l'app (`v1.0.4`)
- **Nommage des artefacts** : `OmniBaby-v1.0.4.apk`, `OmniBaby-web-v1.0.4.zip`
- **Tag Git** : `v1.0.4`

### Déclencher un build manuel avec choix de version

Sur GitHub : **Actions → Build OmniBaby APK → Run workflow** → choisir `patch`, `minor` ou `major`.

---

## 💻 Développement local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de dev (preview web, hot-reload)
npm run dev

# Build de production (génère dist/)
npm run build

# Prévisualiser le build de production
npm run preview
```

Pour tester la version Android localement (nécessite Android Studio / SDK) :

```bash
npx cap add android
npx cap sync android
npx cap open android
```

---

## 🗺️ Roadmap / idées futures

- [ ] Notifications push locales (rappels biberon, médicaments, vaccins)
- [ ] Export PDF (rapport pédiatre)
- [ ] Synchronisation multi-appareils (optionnelle, via Firebase ou Supabase)
- [ ] Widgets Android (raccourci biberon/couche depuis l'écran d'accueil)
- [ ] Thèmes de couleur personnalisables
- [ ] Support multi-enfants (fratrie)

---

## 📄 Licence

Projet personnel / familial — usage privé.
