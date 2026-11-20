Menus & Courses — mise à jour v7 (PDF, favoris et difficulté)

INSTALLATION
1. Dans l'application actuelle, télécharger une sauvegarde JSON AVANT la mise à jour.
2. Décompresser ce ZIP et déposer les 7 fichiers à la racine du dépôt GitHub Pages, en remplaçant les anciens fichiers.
3. Attendre la publication GitHub Pages puis actualiser l'application (éventuellement fermer/rouvrir la PWA).
4. Vérifier les recettes et les listes de courses existantes. Les données locales sont conservées grâce à la clé de stockage inchangée « menus_courses_v1 ».

NOUVEAUTÉS
- Planning PDF A4 paysage, jours en colonnes et midi/soir en lignes.
- Boutons Télécharger PDF / Partager PDF dans Menus et Courses.
- Partage Android natif des fichiers PDF lorsque le navigateur l'autorise ; sinon téléchargement du PDF.
- Étoiles de favoris dans le catalogue de produits. Les favoris sont ajoutés automatiquement à la liste de courses ; « − favori » exclut un favori de la semaine courante sans lui retirer son étoile.
- Difficulté des recettes : simple, intermédiaire, complexe. Une recette complexe est toujours considérée comme longue.
- Configuration des repas exigeant une recette simple. Les anciennes recettes sont traitées comme « Intermédiaire ».

PRÉSERVATION DES DONNÉES
Les recettes, produits, semaines et listes déjà enregistrés ne sont pas supprimés. Les anciennes sauvegardes JSON restent compatibles. Les nouveaux champs sont facultatifs et les valeurs par défaut sont appliquées à la lecture.

LIMITES
- Les données restent stockées localement dans chaque navigateur : conserver une sauvegarde JSON.
- Le partage d'un fichier PDF dépend du navigateur et de l'application destinataire. Certains services SMS ne prennent pas en charge les pièces jointes PDF.
- Les PDF sont générés sans connexion à un service externe.
