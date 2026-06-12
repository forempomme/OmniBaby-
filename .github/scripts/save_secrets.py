#!/usr/bin/env python3
"""
Sauvegarde automatique des secrets GitHub pour OmniBaby.
Appele par le workflow lors du premier build.
Usage: save_secrets.py <token> <repo> <b64_keystore> <password> <alias>
"""
import sys, base64, json, subprocess, urllib.request

def install_and_import():
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pynacl", "-q"],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    global SealedBox, PublicKey
    from nacl.public import SealedBox, PublicKey

def get_public_key(repo, token):
    url = f"https://api.github.com/repos/{repo}/actions/secrets/public-key"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def encrypt_value(pub_key_b64, value):
    from nacl.public import SealedBox, PublicKey
    pk = PublicKey(base64.b64decode(pub_key_b64))
    box = SealedBox(pk)
    encrypted = box.encrypt(value.encode("utf-8"))
    return base64.b64encode(encrypted).decode("utf-8")

def set_secret(repo, token, key_id, pub_key, name, value):
    encrypted = encrypt_value(pub_key, value)
    payload = json.dumps({"encrypted_value": encrypted, "key_id": key_id}).encode()
    url = f"https://api.github.com/repos/{repo}/actions/secrets/{name}"
    req = urllib.request.Request(url, data=payload, method="PUT")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  [OK] Secret {name} sauvegarde (HTTP {r.status})")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [ERR] Secret {name} : {e.code} - {body}")
        sys.exit(1)

def main():
    if len(sys.argv) < 6:
        print("Usage: save_secrets.py <token> <repo> <b64> <password> <alias>")
        sys.exit(1)

    token    = sys.argv[1]
    repo     = sys.argv[2]
    b64      = sys.argv[3]
    password = sys.argv[4]
    alias    = sys.argv[5]

    print("Installation de pynacl...")
    install_and_import()

    print(f"Recuperation de la cle publique du repo {repo}...")
    pk_data = get_public_key(repo, token)
    key_id  = pk_data["key_id"]
    pub_key = pk_data["key"]

    secrets = {
        "KEYSTORE_BASE64":   b64,
        "KEYSTORE_PASSWORD": password,
        "KEY_ALIAS":         alias,
        "KEY_PASSWORD":      password,
    }

    print("Sauvegarde des secrets...")
    for name, value in secrets.items():
        set_secret(repo, token, key_id, pub_key, name, value)

    print("")
    print("Tous les secrets ont ete sauvegardes avec succes !")
    print("Les prochains builds utiliseront ce keystore automatiquement.")

if __name__ == "__main__":
    main()
