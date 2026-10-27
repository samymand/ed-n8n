# Echo Flow — site vitrine

Site statique (HTML/CSS/JS, sans dépendance de build) présentant **Echo Flow**, l'offre d'automatisation n8n d'Echo Digitale.

| Page | Fichier |
|---|---|
| Présentation | `index.html` |
| Contact | `contact.html` |
| Mentions légales | `mentions-legales.html` |
| Conditions d'utilisation | `conditions-utilisation.html` |
| Politique de confidentialité | `confidentialite.html` |

Aperçu local : `python3 -m http.server 8080`, puis http://localhost:8080

## À compléter avant la mise en ligne

- **Formulaire** : renseigner `data-endpoint` dans `contact.html` avec l'URL d'un webhook n8n (POST, JSON). Tant que l'URL contient `VOTRE-INSTANCE`, le formulaire ouvre la messagerie de l'internaute.
- **Nom du produit** : « Echo Flow » est une proposition ; rechercher/remplacer si besoin.

## Déploiement automatique

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui copie le site sur le serveur par SSH (`rsync --delete` : le dossier distant devient le miroir exact du dépôt, hors `.github`, `README.md`, etc.). Un déploiement peut aussi être lancé à la main : onglet **Actions → Déploiement du site → Run workflow**.

### Mise en place (une seule fois)

1. **Créer une clé dédiée au déploiement** (sur votre poste) :
   ```bash
   ssh-keygen -t ed25519 -C "deploy ed-n8n" -f ~/.ssh/ed-n8n-deploy -N ""
   ```
2. **Autoriser la clé sur le serveur** (l'utilisateur doit pouvoir écrire dans le dossier web) :
   ```bash
   ssh-copy-id -i ~/.ssh/ed-n8n-deploy.pub utilisateur@serveur
   ```
3. **Enregistrer les secrets GitHub** (environnement `production`) :
   ```bash
   gh secret set SSH_HOST        --env production --body "serveur.exemple.com"
   gh secret set SSH_USER        --env production --body "utilisateur"
   gh secret set DEPLOY_PATH     --env production --body "/var/www/flow.echodigitale.com/public"
   gh secret set SSH_PRIVATE_KEY --env production < ~/.ssh/ed-n8n-deploy
   gh secret set SSH_PORT        --env production --body "22"   # facultatif
   ssh-keyscan -H serveur.exemple.com | gh secret set SSH_KNOWN_HOSTS --env production   # recommandé
   ```

Tant que ces secrets sont absents, le workflow s'exécute sans erreur mais ignore le déploiement (avertissement dans l'onglet Actions).

## Charte

Couleurs déclarées en variables CSS dans `assets/css/style.css` (`--ed-petrole` #005461, `--ed-turquoise` #00A5AC, `--ed-jade` #2F9F91, `--ed-vert` #7DB159, `--ed-canard` #006272, `--ed-emeraude` #00A18E). Polices : Comfortaa (titres, proche du logotype) et Nunito Sans (texte).
