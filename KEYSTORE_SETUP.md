# Keystore OmniBaby — Instructions GitHub Secrets

## Créer le keystore (une seule fois, depuis ton PC)

Si tu ne peux pas utiliser de ligne de commande, utilise l'outil en ligne :
https://keystore-generator.com ou demande à quelqu'un de générer le keystore.

## Commande (si tu as accès à un PC) :
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias omnibaby \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass MON_MOT_DE_PASSE \
  -keypass MON_MOT_DE_PASSE \
  -dname "CN=OmniBaby, OU=Family, O=OmniBaby, L=Paris, S=IDF, C=FR"
```

## Encoder en base64 :
```bash
base64 -w 0 release.keystore > keystore_base64.txt
```

## Ajouter dans GitHub Secrets (Settings → Secrets → Actions) :

| Secret              | Valeur                          |
|---------------------|---------------------------------|
| KEYSTORE_BASE64     | Contenu de keystore_base64.txt  |
| KEYSTORE_PASSWORD   | MON_MOT_DE_PASSE                |
| KEY_ALIAS           | omnibaby                        |
| KEY_PASSWORD        | MON_MOT_DE_PASSE                |

⚠️ GARDE LE FICHIER release.keystore EN SÉCURITÉ.
   Sans lui, tu ne pourras plus mettre à jour l'app sans désinstaller.
