Menus & Courses — Mise à jour V11

Nouveautés :
1. Bouton + dans le catalogue Produits pour ajouter directement aux courses.
2. Plat exceptionnel dans chaque créneau du planning, sans créer de recette en bibliothèque.
3. PDF de courses A4 portrait, deux colonnes, avec catégories et cases à cocher.
4. Onglet Recettes : recherche insensible aux accents et tri par difficulté puis alphabétique.

Installation : sauvegarder les données JSON depuis l'application, puis remplacer les fichiers du dépôt GitHub Pages par les 7 fichiers du ZIP. Supprimer l'ancien pdf-export.v10.js du dépôt, remplacé par pdf-export.v11.js. Après publication, ouvrir le site avec ?v=11 pour forcer le rafraîchissement.

Données : la clé localStorage menus_courses_v1 est conservée. Les plats exceptionnels sont stockés uniquement dans le planning de la semaine sous la forme d'une valeur préfixée et n'ajoutent pas d'ingrédients aux courses.

Tests : syntaxe JavaScript et intégrité de l'archive vérifiées. Tester les parcours dans Chrome/PWA avant suppression de la sauvegarde JSON.
