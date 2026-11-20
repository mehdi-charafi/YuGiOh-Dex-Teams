# Connected Mon Dex — Yu-Gi-Oh! Edition

Projet réalisé dans le cadre de la formation (Sprint 3 — Brief 2). Une encyclopédie interactive des cartes Yu-Gi-Oh! optimisée pour mobile et desktop, **connectée à l'API du club (json-server)** : plus de `data.js`, les cartes sont lues et enregistrées via l'API.

## Installation

Prérequis : [Node.js](https://nodejs.org) (version 18 ou plus).

```bash
npm install
```

Il faut ensuite **deux terminaux ouverts en même temps** :

```bash
# Terminal 1 : l'API (http://localhost:3000)
npx json-server --watch db.json --port 3000

# Terminal 2 : Tailwind (régénère dist/output.css à chaque modification)
npm run dev
```

Ouvrez ensuite `index.html` dans votre navigateur (ou avec l'extension Live Server).

> ⚠️ Utiliser **json-server@0.17.4** : les filtres et les tris du brief en dépendent.

Avant de rendre le projet :

```bash
npm run build
```

> ℹ️ L'API tourne sur l'ordinateur : le projet se montre **en local** (pas sur GitHub Pages). Le fichier `db.json` fait partie du rendu.

## Fonctionnalités

### Partie 1 — Le Dex connecté à l'API
- Affichage des cartes avec `GET /creatures` (numéro, image, nom, type)
- Message « Chargement… » et message clair si l'API ne répond pas
- Filtre par type : `?type=...` (« Tous » affiche toutes les cartes)
- Recherche : `?q=...`, combinable avec le filtre ; message si aucun résultat
- Le dernier type choisi est mémorisé dans le **LocalStorage**

### Partie 2 — Trier, consulter et ajouter
- Tri « Trier par » (nom A → Z, nom Z → A, numéro) avec `sort` et `order`, en gardant recherche et filtre
- Fiche détaillée avec `GET /creatures/:id` (image, type, statistiques, description) ; « Chargement… » pendant l'appel et « Créature introuvable » en cas de 404
- Ajout d'une carte avec `POST /creatures`, après validation par `validateCreature(data)`
- Brouillon du formulaire d'ajout dans le **SessionStorage** (effacé à l'ajout et à la fermeture de l'onglet)

### Partie 3 — Modifier, supprimer et finition
- Modification avec `PUT /creatures/:id` (formulaire pré-rempli, même validation)
- Suppression avec `DELETE /creatures/:id`, après confirmation
- États de l'interface : bouton désactivé pendant l'envoi, message de succès ou d'erreur, grille rechargée depuis l'API en conservant recherche, filtre et tri
- Cas d'erreur testés (json-server arrêté, créature introuvable)

## Routes de l'API utilisées

| Méthode | Route | Rôle |
| --- | --- | --- |
| GET | `/creatures` | Liste des cartes |
| GET | `/creatures?type=Effect` | Les cartes d'un type |
| GET | `/creatures?q=dark` | Recherche (un champ contient « dark ») |
| GET | `/creatures?sort=name&order=asc` | Tri par nom (`desc` pour l'ordre inverse) |
| GET | `/creatures?type=Effect&q=dark&sort=name&order=asc` | Paramètres combinés |
| GET | `/creatures/1` | Une carte |
| POST | `/creatures` | Ajouter une carte (corps JSON) |
| PUT | `/creatures/1` | Remplacer une carte (modifier) |
| DELETE | `/creatures/1` | Supprimer une carte |

## Contenu du dépôt

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page Dex, interactive, avec les cartes Yu-Gi-Oh! |
| `db.json` | La base de données de l'API json-server (au moins 12 cartes) |
| `tailwind.config.js` | Le thème personnalisé pour l'univers Yu-Gi-Oh! |
| `src/input.css` | Les directives Tailwind et classes de composants |
| `dist/output.css` | Le CSS généré par Tailwind |
| `js/api.js` | `request(method, route, body)` : le seul endroit qui appelle `fetch`, et les fonctions `getCreatures(params)`, `getCreature(id)`, `createCreature`, `updateCreature`, `deleteCreature` |
| `js/rules.js` | Les règles, sans DOM : `validateCreature(data)` |
| `js/storage.js` | Le dernier filtre (LocalStorage) et le brouillon du formulaire (SessionStorage), jamais les cartes elles-mêmes |
| `js/ui.js` | L'affichage : grille, fiche, formulaire, messages |
| `js/main.js` | Le point de départ : les écouteurs, qui appellent `api.js` puis `ui.js` |
| `design/` | La maquette de la version finale |

## Règles de code

- Modules ES, 5 fichiers dans `js/`
- Aucun `fetch` en dehors de `api.js`
- Chaque appel utilise `async / await`, `try / catch` et vérifie `response.ok`
- Chaque appel affiche un état de chargement (boutons désactivés pendant l'envoi) puis un message de succès ou d'erreur
- Les données de l'API sont affichées avec `createElement` et `textContent`, jamais avec `innerHTML`

## Validation du formulaire (`validateCreature`)

Un message clair s'affiche sous chaque champ invalide.

| Champ | Règle |
| --- | --- |
| Nom | Obligatoire |
| Type | Obligatoire (un type doit être choisi) |
| Statistiques (ATK / DEF) | Nombre entre 1 et 255 |

```js
// Exemples
validateCreature({ name: "Dark Magician", type: "Effect", atk: 100, def: 200 }) // ➔ aucune erreur
validateCreature({ name: "", type: "Effect", atk: 100, def: 200 })              // ➔ erreur sur le nom
validateCreature({ name: "Gaia", type: "", atk: 100, def: 200 })                // ➔ erreur sur le type
validateCreature({ name: "Gaia", type: "Effect", atk: 0, def: 256 })            // ➔ erreurs sur les statistiques
```

## Stockage navigateur

| Donnée | Stockage | Durée de vie |
| --- | --- | --- |
| Dernier type filtré | LocalStorage | Conservé après fermeture du navigateur |
| Brouillon du formulaire d'ajout | SessionStorage | Disparaît à la fermeture de l'onglet |

## Informations du Projet

| | |
| --- | --- |
| Univers choisi | Yu-Gi-Oh! |
| Dépôt GitHub | [À compléter : lien du dépôt](https://github.com/) |
| Sources des cartes | YGOPRODeck (ygoprodeck.com) |

## Organisation Git

- Une branche et une Pull Request relue par partie :
  - `feature/dex` (Partie 1)
  - `feature/dex-add` (Partie 2)
  - `feature/dex-edit` (Partie 3)
- Tableau GitHub Projects tenu à jour

## Livrables

| Livrable | Date | Contenu |
| --- | --- | --- |
| 1 | Mardi 17/11, 23h30 | Dépôt, tableau GitHub Projects, PR `feature/dex` relue |
| 2 | Jeudi 19/11, 23h30 | PR `feature/dex-add` relue + capture Réseau (GET avec `?type=`, `q=`, `_sort=`, GET `/creatures/:id`, POST) |
| 3 | Vendredi, 23h30 | PR `feature/dex-edit` relue, dépôt final (`db.json` + README) + capture Réseau (PUT et DELETE) |