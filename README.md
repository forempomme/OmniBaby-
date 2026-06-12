# OmniBaby 👶

Application Android de suivi bébé pour la famille.

## Structure du projet

```
omnibaby/
├── src/
│   ├── App.jsx          ← Application React principale
│   ├── main.jsx         ← Point d'entrée React
│   └── version.js       ← Version (mis à jour par le workflow)
├── android/
│   ├── app/
│   │   ├── build.gradle ← Config build Android
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/omnibaby/app/MainActivity.java
│   │       └── res/
│   └── build.gradle
├── .github/workflows/
│   └── build.yml        ← Workflow de build automatique
├── version.properties   ← Source de vérité du versioning
├── index.html
├── package.json
└── vite.config.js
```

## Versioning

Le numéro de version suit le format `MAJEUR.MINEUR.PATCH` :
- **PATCH** : correction de bug → incrément auto à chaque push
- **MINOR** : nouvelle fonctionnalité → déclencher le workflow manuellement
- **MAJOR** : refonte importante → déclencher le workflow manuellement

Pour choisir le type d'incrément :
GitHub → Actions → Build OmniBaby APK → Run workflow → choisir patch/minor/major

## Mise à jour sans désinstaller

L'APK est signé avec le même keystore à chaque build.
Installe simplement le nouvel APK par-dessus l'ancien.

## Premier déploiement

1. Suis les instructions dans `KEYSTORE_SETUP.md`
2. Ajoute les 4 secrets dans GitHub
3. Push le code → le workflow build l'APK automatiquement
4. Télécharge l'APK depuis GitHub Releases
