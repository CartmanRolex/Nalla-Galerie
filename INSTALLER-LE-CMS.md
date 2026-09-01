# Installer le CMS (à faire une seule fois)

L'interface d'administration est déjà dans le dépôt (`admin/`). Il manque
seulement le service qui gère la connexion GitHub. Compter 20 à 30 minutes.

À la fin, Nalla ira sur
**https://cartmanrolex.github.io/Nalla-Galerie/admin/**, se connectera avec son
compte GitHub, et pourra ajouter ses œuvres par formulaire.

---

## Avant de commencer

- Un compte **Cloudflare** gratuit — https://dash.cloudflare.com/sign-up
- Nalla doit avoir un compte **GitHub** gratuit, et être invité comme
  collaborateur du dépôt : *Settings → Collaborators → Add people*.
  Sans cela il pourra se connecter mais pas enregistrer.

---

## 1. Déployer le service de connexion

1. Ouvrir https://github.com/sveltia/sveltia-cms-auth
2. Cliquer le bouton **Deploy to Cloudflare Workers** du README et se laisser guider.
3. Une fois déployé, dans le tableau de bord Cloudflare, ouvrir le worker
   `sveltia-cms-auth` et **copier son URL**. Elle ressemble à :
   `https://sveltia-cms-auth.quelquechose.workers.dev`

Garder cette URL sous la main, elle sert aux étapes 2 et 4.

## 2. Déclarer l'application auprès de GitHub

1. Ouvrir https://github.com/settings/applications/new
2. Remplir :
   - **Application name** : `Galerie Weurseuk CMS`
   - **Homepage URL** : `https://cartmanrolex.github.io/Nalla-Galerie/`
   - **Authorization callback URL** : l'URL du worker suivie de `/callback`
     → `https://sveltia-cms-auth.quelquechose.workers.dev/callback`
3. Valider, puis **Generate a new client secret**.
4. Noter le **Client ID** et le **Client Secret**. Le secret ne s'affiche qu'une fois.

## 3. Donner les clés au worker

Dans Cloudflare, worker `sveltia-cms-auth` → **Settings → Variables** :

| Nom | Valeur |
|---|---|
| `GITHUB_CLIENT_ID` | le Client ID de l'étape 2 |
| `GITHUB_CLIENT_SECRET` | le Client Secret — cliquer **Encrypt** |
| `ALLOWED_DOMAINS` | `cartmanrolex.github.io` |

Enregistrer et redéployer.

> `ALLOWED_DOMAINS` empêche n'importe quel autre site d'utiliser ce worker.
> Ne pas le laisser vide.

## 4. Brancher le site

Ouvrir **`admin/config.yml`** dans le dépôt et remplacer la ligne :

```yaml
  base_url: https://sveltia-cms-auth.CHANGEZ-MOI.workers.dev
```

par l'URL réelle du worker (sans `/` final), puis commiter.

## 5. Vérifier

1. Aller sur https://cartmanrolex.github.io/Nalla-Galerie/admin/
2. Cliquer **Se connecter avec GitHub** et autoriser.
3. Ouvrir *Catalogue → Œuvres* : les 3 séries et les 7 toiles doivent apparaître.
4. Modifier un titre, enregistrer, et vérifier sur la page Œuvres après une minute.

---

## Ce que Nalla peut faire ensuite

Dans *Catalogue → Œuvres* :

- **Ajouter une toile** : ouvrir une série, **Add Œuvre**, glisser la photo dans
  le champ Photo, remplir titre / technique / description, **Save**.
- **Créer une série** : **Add Série**, donner un nom et un identifiant en
  minuscules sans accent.
- **Réordonner** : glisser les éléments dans la liste.

Chaque enregistrement crée un commit et le site se met à jour en une minute environ.

## Si ça ne marche pas

| Symptôme | Cause probable |
|---|---|
| La page admin reste blanche | `config.yml` invalide — vérifier l'indentation |
| « Authentication failed » | callback URL de l'étape 2 mal recopiée |
| Connexion OK mais échec à l'enregistrement | Nalla n'est pas collaborateur du dépôt |
| Les images ne s'affichent pas sur le site | `public_folder` doit rester `images` |

En dernier recours, `works.json` reste modifiable à la main : voir
**AJOUTER-UNE-OEUVRE.md**.
