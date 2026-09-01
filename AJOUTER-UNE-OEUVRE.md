# Ajouter une œuvre au site

Tout se fait depuis github.com, sans installer quoi que ce soit.
Le site se met à jour tout seul environ une minute après.

## 1. Déposer la photo

1. Ouvrir le dossier **`images/`** du dépôt.
2. Cliquer **Add file → Upload files**, glisser la photo, puis **Commit changes**.
3. Retenir le nom exact du fichier, par exemple `08-nouvelle-toile.jpg`.

Conseils : photo bien cadrée sur la toile, format `.jpg`, moins de 2 Mo si possible.

## 2. Décrire l'œuvre

1. Ouvrir le fichier **`works.json`** et cliquer sur le crayon ✏️.
2. Trouver la série voulue (`braises`, `pavois` ou `visages`).
3. Copier un bloc existant et le coller juste en dessous, séparé par une virgule.

Un bloc ressemble à ceci :

```json
{
  "title": "Braise I",
  "artist": "Nalla Thioye",
  "medium": "Huile sur toile",
  "image": "images/01-rouge-i.jpg",
  "alt": "Masse rouge travaillée au couteau, éclats jaunes",
  "description": "Une masse rouge travaillée au couteau, où la matière garde la trace du geste."
}
```

- `title` — le titre affiché
- `artist` — le nom de l'artiste
- `medium` — la technique, par exemple `Acrylique sur toile`
- `image` — le chemin de la photo déposée à l'étape 1
- `alt` — courte description pour les personnes qui ne voient pas l'image
- `description` — le texte affiché quand on clique sur l'œuvre

4. Cliquer **Commit changes**.

## Règles à respecter

- Chaque bloc est entouré d'accolades `{ }` et séparé du suivant par une **virgule**.
- Le **dernier** bloc d'une série n'a **pas** de virgule après son accolade fermante.
- Les textes vont entre guillemets droits `"`. Pour une apostrophe, écrire `'` normalement.

Si le site affiche « Les œuvres n'ont pas pu être chargées », c'est qu'il manque
une virgule ou un guillemet. Revenir au commit précédent via l'onglet **History**
du fichier, puis réessayer.

## Créer une nouvelle série

Ajouter un bloc dans `series`, sur ce modèle :

```json
{
  "id": "gravures",
  "name": "Gravures",
  "works": []
}
```

`id` doit être en minuscules, sans accent ni espace.
