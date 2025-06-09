# Bioglyphs NFT Site

Un site web moderne pour présenter la collection NFT "Bioglyphs" - des œuvres d'art génératif basées sur le Jeu de la Vie de Conway.

## 🎨 Aperçu du Projet

Bioglyphs est une collection unique d'œuvres d'art numériques générées par les règles fascinantes du Jeu de la Vie de Conway. Chaque NFT capture l'émergence de la complexité à partir de la simplicité, transformant des algorithmes mathématiques en expériences visuelles captivantes.

### Fonctionnalités Principales

- **Page d'accueil** : Présentation du projet avec design moderne et animations
- **Galerie interactive** : Affichage de tous les NFTs avec filtrage et recherche
- **Pages de détails** : Informations complètes, lecteur vidéo, et liens interactifs
- **Interface d'administration** : Gestion complète de la collection
- **Design responsive** : Compatible mobile, tablette et desktop
- **Stockage IPFS** : Intégration avec Pinata pour l'hébergement décentralisé

## 🚀 Installation et Déploiement

### Prérequis

- Navigateur web moderne
- Serveur web (pour le développement local)
- Compte GitHub (pour le déploiement)

### Installation Locale

1. **Cloner ou télécharger le projet**
   ```bash
   git clone <repository-url>
   cd bioglyphs-nft-site
   ```

2. **Servir les fichiers localement**
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js
   npx serve .
   
   # Avec PHP
   php -S localhost:8000
   ```

3. **Ouvrir dans le navigateur**
   ```
   http://localhost:8000
   ```

### Déploiement sur GitHub Pages

1. **Créer un repository GitHub**
   - Aller sur GitHub.com
   - Créer un nouveau repository public
   - Nommer le repository (ex: `bioglyphs-nft-site`)

2. **Uploader les fichiers**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bioglyphs-nft-site.git
   git push -u origin main
   ```

3. **Activer GitHub Pages**
   - Aller dans Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Sauvegarder

4. **Accéder au site**
   ```
   https://USERNAME.github.io/bioglyphs-nft-site/
   ```

## 🔧 Configuration

### Données NFT

Les NFTs sont stockés dans `data/nfts.json`. Structure d'un NFT :

```json
{
  "id": "bioglyph_001",
  "name": "Nom du NFT",
  "description": "Description détaillée",
  "media": {
    "animation_url": "https://ipfs.io/ipfs/...",
    "preview_gif": "https://ipfs.io/ipfs/...",
    "viewer_html": "https://ipfs.io/ipfs/...",
    "metadata_json": "https://ipfs.io/ipfs/..."
  },
  "attributes": [
    {
      "trait_type": "Form",
      "value": "Glider"
    }
  ],
  "opensea_url": "https://opensea.io/assets/...",
  "created_at": "2025-06-09T...",
  "updated_at": "2025-06-09T..."
}
```

### Interface d'Administration

1. **Accès** : `/admin.html`
2. **Mot de passe par défaut** : `bioglyphs2025`
3. **Fonctionnalités** :
   - Ajouter/modifier/supprimer des NFTs
   - Gestion des attributs
   - Export des données
   - Statistiques de la collection

### Personnalisation

#### Changer le mot de passe admin
Dans `js/admin.js`, ligne 6 :
```javascript
const ADMIN_PASSWORD_HASH = 'votre_nouveau_mot_de_passe';
```

#### Modifier les couleurs
Dans `css/main.css`, section `:root` :
```css
:root {
  --primary-color: #ff0040;  /* Couleur principale */
  --secondary-color: #1a1a1a;  /* Couleur secondaire */
  /* ... autres variables */
}
```

#### Ajouter des NFTs
1. Via l'interface admin (recommandé)
2. Directement dans `data/nfts.json`

## 📁 Structure du Projet

```
bioglyphs-nft-site/
├── index.html              # Page d'accueil
├── gallery.html            # Galerie des NFTs
├── nft-details.html        # Détails d'un NFT
├── admin.html              # Interface d'administration
├── css/
│   ├── main.css            # Styles principaux
│   ├── gallery.css         # Styles de la galerie
│   ├── nft-details.css     # Styles des détails
│   └── admin.css           # Styles de l'admin
├── js/
│   ├── main.js             # Logique principale
│   ├── gallery.js          # Logique de la galerie
│   ├── nft-details.js      # Logique des détails
│   └── admin.js            # Logique d'administration
├── data/
│   └── nfts.json           # Base de données des NFTs
├── assets/
│   ├── images/             # Images du site
│   └── icons/              # Icônes
└── README.md               # Ce fichier
```

## 🎯 Utilisation

### Pour les Visiteurs

1. **Page d'accueil** : Découvrir le projet Bioglyphs
2. **Galerie** : Explorer tous les NFTs avec filtres
3. **Détails NFT** : Voir les informations complètes et l'expérience interactive

### Pour l'Administrateur

1. **Connexion** : Aller sur `/admin.html` et se connecter
2. **Ajouter un NFT** :
   - Cliquer sur "Ajouter un NFT"
   - Remplir le formulaire avec les liens IPFS
   - Ajouter les attributs
   - Sauvegarder
3. **Modifier un NFT** : Cliquer sur l'icône de modification
4. **Exporter les données** : Télécharger une sauvegarde JSON

## 🔗 Intégration IPFS/Pinata

### Préparer les Fichiers

1. **Vidéo d'animation** : Format MP4, qualité optimisée
2. **Aperçu GIF** : Animation courte, taille réduite
3. **Viewer HTML** : Fichier interactif autonome
4. **Métadonnées JSON** : Fichier de métadonnées standard NFT

### Upload sur Pinata

1. Créer un compte sur [Pinata.cloud](https://pinata.cloud)
2. Uploader chaque fichier
3. Copier les liens IPFS générés
4. Utiliser ces liens dans l'interface admin

## 🎨 Personnalisation Avancée

### Ajouter de Nouveaux Types d'Attributs

Dans `js/admin.js`, fonction `addDefaultAttributes()` :
```javascript
const defaultAttributes = [
    { type: 'Form', value: '' },
    { type: 'Behavior', value: '' },
    { type: 'Color Scheme', value: '' },
    { type: 'Nouveau Type', value: '' }  // Ajouter ici
];
```

### Modifier les Filtres de la Galerie

Dans `gallery.html`, section filtres :
```html
<select id="nouveau-filter" class="filter-select">
    <option value="">Tous les nouveaux</option>
    <option value="valeur1">Valeur 1</option>
    <option value="valeur2">Valeur 2</option>
</select>
```

### Ajouter des Pages

1. Créer le fichier HTML
2. Ajouter les liens dans la navigation
3. Inclure les CSS et JS nécessaires

## 🔒 Sécurité

- **Authentification simple** : Mot de passe côté client (pour démo)
- **Données locales** : Stockage dans localStorage
- **Pas de backend** : Site entièrement statique
- **HTTPS recommandé** : Pour la production

## 📱 Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (versions récentes)
- **Appareils** : Desktop, tablette, mobile
- **Résolutions** : Responsive design adaptatif

## 🐛 Dépannage

### Problèmes Courants

1. **Images ne s'affichent pas**
   - Vérifier les liens IPFS
   - Tester les URLs dans le navigateur

2. **Interface admin inaccessible**
   - Vérifier le mot de passe
   - Effacer le cache du navigateur

3. **Données perdues**
   - Exporter régulièrement via l'interface admin
   - Sauvegarder le fichier `nfts.json`

### Support

Pour toute question ou problème :
1. Vérifier ce README
2. Consulter les commentaires dans le code
3. Tester sur un navigateur différent

## 📄 Licence

Ce projet est fourni à des fins éducatives et de démonstration. Adaptez selon vos besoins.

## 🙏 Crédits

- **Inspiration** : Jeu de la Vie de John Conway (1937-2020)
- **Design** : Interface moderne avec animations CSS
- **Technologie** : HTML5, CSS3, JavaScript vanilla
- **Hébergement** : IPFS/Pinata pour les médias, GitHub Pages pour le site

---

**Bioglyphs** - L'art de la vie numérique, où la mathématique devient émotion et l'algorithme devient beauté.

