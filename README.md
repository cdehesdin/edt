## Emploi du temps

Développement d'un outil de génération d'**emploi du temps** personnalisable et imprimable, construit dynamiquement à partir d'une constante JSON définie dans le fichier `edt.js`.  

> Site web : [https://cdehesdin.github.io/edt](https://cdehesdin.github.io/edt).


### Fonctionnalités

L'emploi du temps peut être entièrement personnalisé : le titre, l'horaire de début et de fin de journée peuvent être modifiés.

Il est possible d'ajouter autant de jours que nécessaire, et pour chacun de ces jours, créer des créneaux horaires où l'on peut définir le nom de l'activité, l'heure de début et de fin, ainsi que deux informations supplémentaires comme le nom du professeur et le numéro de salle. Si des créneaux se chevauchent (par exemple, deux activités programmées sur la même plage horaire), l'outil les affiche de manière optimisée.

L'emploi du temps peut être imprimé facilement en format portrait ou paysage en utilisant `Ctrl+P` sous Windows/Linux ou `Cmd+P` sur macOS, selon le système d'exploitation.

### Structure JSON

Le fichier `edt.js` contient la constante JSON qui structure l'emploi du temps. Par exemple :

```javascript
const edt = {
  titre: "Mon Emploi du Temps",
  heureDebut: "08:00",
  heureFin: "18:00",
  jours: [
    {
      nom: "Lundi",
      creneaux: [
        {
          nom: "Mathématiques",
          debut: "08:00",
          fin: "09:30",
          info1: "M. Dupont",
          info2: "Salle 101"
        },
        {
          nom: "Physique",
          debut: "09:45",
          fin: "11:15",
          info1: "Mme Martin",
          info2: "Salle 102"
        }
      ]
    },
    {
      nom: "Mardi",
      creneaux: []
    }
  ]
};
```

### Utilisation

Pour utiliser l'outil, il suffit de cloner le dépôt, modifier le fichier `edt.js` selon vos besoins et ouvrir le fichier `index.html` dans un navigateur pour voir l'emploi du temps généré et pouvoir l'imprimer facilement.