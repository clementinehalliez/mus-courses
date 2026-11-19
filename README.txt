MENUS & COURSES — INSTALLATION SUR ANDROID (GITHUB PAGES)

1. Ouvrez https://github.com et créez un compte gratuit si nécessaire.
2. Créez un dépôt PUBLIC (New repository), par exemple menus-courses.
3. Dans le dépôt, choisissez Add file > Upload files.
4. Décompressez ce ZIP et importez LES CINQ FICHIERS à la racine du dépôt : index.html, manifest.webmanifest, service-worker.js, icon-192.png, icon-512.png. Validez avec Commit changes.
5. Ouvrez Settings > Pages > Build and deployment > Source : Deploy from a branch ; Branch : main ; Folder : /(root), puis Save.
6. Après publication, ouvrez l'adresse affichée dans Settings > Pages (du type https://votre-identifiant.github.io/menus-courses/) dans Chrome sur votre Pixel.
7. Menu ⋮ de Chrome > Ajouter à l'écran d'accueil > Installer (libellé variable). Lancez ensuite l'application depuis son icône.

IMPORTANT : l'application sauvegarde automatiquement dans le stockage local du site sur cet appareil. Ce n'est PAS une sauvegarde cloud : effacer les données du site, changer d'appareil ou certains nettoyages du navigateur peuvent effacer les données. Exportez périodiquement une sauvegarde JSON depuis l'application.

MIGRATION : dans l'ancienne application, si vos recettes sont encore visibles, cliquez sur « Télécharger ma sauvegarde ». Puis ouvrez la nouvelle version installée et utilisez « Restaurer une sauvegarde ». Les données locales de l'ancien fichier HTML ne sont pas automatiquement transférées.

L'IMPORTATION DE RECETTES PAR URL dépend de l'autorisation des sites et peut échouer à cause des restrictions CORS. Le code de l'application est visible publiquement dans un dépôt GitHub Pages public ; ne mettez pas de données personnelles dans le code. Les recettes saisies dans l'application restent dans le stockage du navigateur.
