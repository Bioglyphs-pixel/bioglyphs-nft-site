# Guide de Déploiement - Bioglyphs NFT Site

## 🚀 Déploiement sur GitHub Pages

### Étape 1 : Préparation du Repository GitHub

1. **Créer un compte GitHub** (si vous n'en avez pas)
   - Aller sur [github.com](https://github.com)
   - Créer un compte gratuit

2. **Créer un nouveau repository**
   - Cliquer sur "New repository"
   - Nom suggéré : `bioglyphs-nft-site`
   - Cocher "Public" (requis pour GitHub Pages gratuit)
   - Cocher "Add a README file"
   - Cliquer "Create repository"

### Étape 2 : Upload des Fichiers

#### Option A : Via l'interface web GitHub
1. Dans votre repository, cliquer "uploading an existing file"
2. Glisser-déposer tous les fichiers du dossier `bioglyphs-nft-site/`
3. Écrire un message de commit : "Initial commit - Bioglyphs NFT site"
4. Cliquer "Commit changes"

#### Option B : Via Git (ligne de commande)
```bash
# Cloner votre repository
git clone https://github.com/VOTRE_USERNAME/bioglyphs-nft-site.git
cd bioglyphs-nft-site

# Copier tous les fichiers du site dans ce dossier
# Puis :
git add .
git commit -m "Initial commit - Bioglyphs NFT site"
git push origin main
```

### Étape 3 : Activer GitHub Pages

1. Dans votre repository, aller dans **Settings**
2. Descendre jusqu'à la section **Pages**
3. Dans "Source", sélectionner **Deploy from a branch**
4. Choisir la branche **main**
5. Laisser le dossier sur **/ (root)**
6. Cliquer **Save**

### Étape 4 : Accéder à votre site

Après quelques minutes, votre site sera accessible à :
```
https://VOTRE_USERNAME.github.io/bioglyphs-nft-site/
```

## 🔧 Configuration Post-Déploiement

### 1. Modifier le Mot de Passe Admin

Dans le fichier `js/admin.js`, ligne 5 :
```javascript
const ADMIN_PASSWORD_HASH = 'VOTRE_NOUVEAU_MOT_DE_PASSE';
```

### 2. Ajouter vos NFTs Réels

1. Aller sur `https://VOTRE_SITE/admin.html`
2. Se connecter avec votre mot de passe
3. Cliquer "Ajouter un NFT"
4. Remplir avec vos vrais liens IPFS/Pinata

### 3. Remplacer les Données d'Exemple

Modifier le fichier `data/nfts.json` avec vos vraies données NFT.

## 📱 Alternatives de Déploiement

### Netlify (Recommandé pour les débutants)

1. Aller sur [netlify.com](https://netlify.com)
2. Créer un compte gratuit
3. Glisser-déposer le dossier `bioglyphs-nft-site/`
4. Votre site sera automatiquement déployé

### Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Connecter votre compte GitHub
3. Importer votre repository
4. Déploiement automatique

## 🔄 Mises à Jour

### Pour GitHub Pages
1. Modifier les fichiers localement
2. Commit et push vers GitHub
3. Le site se met à jour automatiquement

### Pour Netlify
1. Glisser-déposer le nouveau dossier
2. Ou connecter à GitHub pour auto-déploiement

## 🛠️ Maintenance

### Sauvegarde des Données
- Exporter régulièrement via l'interface admin
- Sauvegarder le fichier `data/nfts.json`

### Monitoring
- Vérifier régulièrement les liens IPFS
- Tester l'interface admin périodiquement

## 🆘 Dépannage

### Site ne s'affiche pas
- Vérifier que GitHub Pages est activé
- Attendre 5-10 minutes après activation
- Vérifier l'URL (avec le bon nom d'utilisateur)

### Interface admin ne fonctionne pas
- Vérifier la console du navigateur (F12)
- S'assurer que tous les fichiers JS sont présents
- Tester avec un autre navigateur

### Images ne s'affichent pas
- Vérifier les liens IPFS dans `data/nfts.json`
- Tester les URLs directement dans le navigateur
- S'assurer que les liens sont accessibles publiquement

## 📞 Support

Pour toute question :
1. Vérifier ce guide
2. Consulter le README.md
3. Vérifier la console du navigateur pour les erreurs
4. Tester sur un navigateur différent

---

**Félicitations ! Votre site Bioglyphs NFT est maintenant en ligne ! 🎉**

