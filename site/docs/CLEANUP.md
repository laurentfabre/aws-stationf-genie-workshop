# Rejouer et nettoyer

## Rejouer sans perdre le travail

Conservez le même catalogue, schéma et warehouse. Le mode `verifier` exécute les contrôles sans créer de ressource. Le mode `installer` réutilise les tables seulement si les propriétés d’atelier, le propriétaire et le contenu correspondent ; il préserve aussi les instructions de l’Agent existant. Il ne restaure pas un dataset modifié.

Pour une nouvelle édition indépendante, utilisez un nouveau suffixe, par exemple `stationf_20261124_equipe01_bis`. Cela crée de nouvelles ressources et consomme du stockage/calcul. Pour éviter les doublons, ne lancez qu’une installation à la fois pour un schéma.

## Après la séance

1. Exportez le cahier JSON et Markdown ; conservez le notebook avec son reçu, les conversations, SQL et liens/version de l’application. Ne commitez pas les sorties contenant vos identifiants ou URLs personnelles dans ce dépôt public.
2. Dans Apps et Genie, identifiez les ressources que vous avez créées pour cette édition par leur nom, URL et namespace. Supprimez-les dans l’interface seulement après avoir conservé vos travaux.
3. Dans Catalog Explorer, inspectez les propriétés des trois tables : `workshop.id=stationf-20261124`, `workshop.dataset=stationf-synthetic-v1`, votre `workshop.owner` et le schéma de votre reçu. Supprimez seulement ces tables si vous souhaitez retirer le dataset. Ne supprimez pas un objet homonyme sans vérifier ses propriétés.
4. Supprimez le schéma dédié seulement s’il est vide. N’utilisez pas `CASCADE` et ne supprimez pas le catalogue. Ne stoppez ni ne supprimez un warehouse partagé.
5. Nettoyez vos téléchargements et notes de navigateur après export si nécessaire.

La suppression des tables ne clôture pas l’essai ni sa facturation. Vérifiez séparément les crédits, la date de fin, les moyens de paiement et les abonnements AWS Marketplace éventuels dans votre compte. Les conditions du Trial prévalent sur ce guide.
