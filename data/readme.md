***Description des données RSS colonne par colonne :***  

- **id** : identifiant du séjour
- **date_entree** : date à laquelle le patient est arrivé à l'hôpital
- **mode_entree** : renseigne la manière dont le patient est arrivé à l'hôpital : en urgence, de chez lui, en transfert d'un autre établissement....
- **date_sortie** : date à laquelle le patient est sortie de l'hôpital
- **mode_sortie** : renseigne la manière dont le patient est sorti de l'hôpital : est transféré, rentre chez lui...
- **duree_totale** : du séjour en nuitées
- **sexe** : du patient
- **age** : du patient
- **CMD** : *Catégorie Majeure de Diagnostics* elle est déterminée par le diagnostic principal du séjour. présente dans les deux premiers chiffres du GHM
- **GHM** : *Groupe Homogène de Maladies* groupe de maladies qui ont des caractéristiques similaires en termes de santé et qui sont traitées de manière similaire. Dépend essentiellement du diagnostic principal et de l'acte classant principal du séjour.
- **type_ghm** : lettre présente dans le GHM, elle différencie les séjours chirurgicaux, médicaux...
- **severite** : dernier chiffre du GHM, la sévérité évalue la gravité d'un séjour de 1 (léger) à 4 (très grave)
- **dp** : diagnostic principal du séjour : raison principale pour laquelle le patient est à l'hôpital
- **das** : diagnostics associés : autres problèmes dont souffre le patient et qui sont traités pendant sont séjour
- **listes_actes** : liste de tous les actes effectués sur le patient
- **listes_actes_classants** : liste des actes chirurgicaux les plus importants effectués sur le patient -> ils déterminent le GHM du séjour (tous les séjours n'en ont pas)
- **acte_classant_principal** : acte chirurgical principal pour lequel le patient se présente à l'hôpital (tous les séjours n'en ont pas)
- **date_acte_classant_principal** : date à laquelle l'acte précédent est effectué



***Comment lire un GHM ?***
On retrouve 4 informations différentes dans un GHM.  
ex : 06C043  
- 06 : CMD associée au séjour -> la CMD 02 regroupe les affections du tube digestif
- C : le séjour est classé comme étant Chirurgical, car un acte classant chirurgical a été effectué
- 04 : Itv. maj. sur le côlon ou l'intestin grêle
- 3 : sévérité associée au séjour, 3 est une sévérité lourde, on peut donc imaginer que le séjour a été long, avec plusieurs complications et plusieurs actes lourds.

