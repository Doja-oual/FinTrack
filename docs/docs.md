Qu'est-ce que Node.js ?

Node.js est un environnement d'exécution JavaScript côté serveur, construit sur le moteur V8 de Chrome. Il permet d'exécuter du JavaScript en dehors du navigateur

--------pour installation de node-------
node --version
npm --version

NPM:Node Package Manager,

_____________Initialiser un projet
mkdir nom-projet
cd nom-projet
npm init-y
____________Commandes essentielles


npm install express
-----Installer en tant que dépendance de développement
npm install --save-dev nodemon

------pour désinstalle un package
npm uninstall expess
------mettre a jour package
npm update
_________Fichier package.json___________

{
  "name": "finsolutions",
  "version": "1.0.0",
  "description": "Application de gestion de budget",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
________Modules Node.js______
Personal finance web app developmentPartagerOsalu besoin de donne un documentation sur node.js avant debute a  express  estles chose qui besoin de vu pour aplique donne projet chaie de charge FinSolutions, une entreprise innovante dans le secteur de la FinTech, souhaite développer une application web moderne de gestion de budget personnel. L'objectif est de permettre aux utilisateurs de suivre leurs dépenses, gérer leurs objectifs financiers et visualiser leurs données financières de manière interactive.
* HTML5
* Node.js
* MySQL
* Responsive design
* Git
* JavaScript
* Agility
* UI
Référentiels
* Compétences transversales
* [2023] Concepteur⋅rice développeur⋅se d'applications
Contexte du projet
Objectifs du Projet :
Développer une application web full-stack permettant aux utilisateurs de :
* Gérer leurs transactions financières (revenus et dépenses)
* Catégoriser et suivre leurs dépenses
* Définir et suivre des objectifs d'épargne
* Gérer leur profil et leurs préférences
* Visualiser leurs données financières via des graphiques interactifs (Bonus)
Fonctionnalités Principales :
1. Gestion des Utilisateurs
* Inscription et connexion sécurisées
* Profil utilisateur personnalisable
* Gestion des préférences
2. Gestion des Transactions
* Ajout, modification et suppression de transactions
* Catégorisation manuelle
* Export des données
3. Budgétisation
* Création de budgets par catégorie
* Suivi des dépenses vs budget
* Objectifs d'épargne personnalisés
4. Visualisation des Données
* Tableaux de bord interactifs
* Graphiques de tendances
* Répartition des dépenses par catégorie
5. Bonus
* Notifications et alertes de dépassement de budget par email
* - Réinitialisation de mot de passe
Spécifications Techniques
Backend
* Utilisation de Node.js avec le framework Express.js
* Base de données MySQL, gérée via l'ORM Sequelize pour la modélisation et les requêtes
* Implémentation des routes nécessaires pour chaque fonctionnalité (GET, POST, PUT, DELETE)
* Gestion des sessions utilisateurs avec express-session
* Rendu des vues côté serveur avec EJS
* Validation et gestion centralisée des erreurs côté serveur
Frontend
* Utilisation d'un moteur de templates comme EJS pour le rendu dynamique des pages
* Mise en place d'un design épuré et intuitif avec CSS3
* Possibilité d'utiliser un framework CSS comme Bootstrap ou TailwindCSS
* Utilisation de JavaScript ES6+ pour la manipulation du DOM, la gestion des événements et l'interactivité
* Intégration de graphiques interactifs (par exemple avec Chart.js ou D3.js)
Sécurité
* Protection contre les injections SQL via Sequelize
* Hachage des mots de passe avant stockage en base de données (par exemple avec bcrypt)
User Stories :
En tant qu'utilisateur non connecté, je veux :
* M'inscrire sur la plateforme avec mon email et un mot de passe sécurisé
* Me connecter à mon compte existant
* Voir une page d'accueil présentant les fonctionnalités principales
* Réinitialiser mon mot de passe en cas d'oubli
En tant qu'utilisateur connecté, je veux :
* Voir mon solde actuel et mes dépenses récentes dès la page d'accueil
* Ajouter une nouvelle transaction (revenu ou dépense) avec date, montant et catégorie
* Modifier ou supprimer mes transactions existantes
* Catégoriser mes transactions manuellement
* Définir des budgets mensuels par catégorie
* Exporter mes données financières (csv)
* Personnaliser mes préférences (devise, profil, mot de passe)
* Créer des catégories personnalisées pour mes transactions
* Définir des objectifs d'épargne et suivre leur progression
* Générer des rapports détaillés de mes finances
* Visualiser mes dépenses via des graphiques par catégorie et période
Modalités pédagogiques
Organisation du Travail
* Projet individuel
* Auto-gestion du temps et planification des tâches
Outils de Développement
* Git et GitHub pour le versioning
* Jira ou Trello pour la gestion des tâches et le suivi du projet
* VS Code comme éditeur
* Node.js avec Express pour le backend
* EJS pour le rendu côté serveur
* MySQL pour la base de donnéesModifierDocumentation Node.js pour débuter avec Express
Salut ! Voici une documentation complète pour maîtriser Node.js avant de commencer avec Express pour ton projet FinSolutions.
1. Fondamentaux de Node.js
Qu'est-ce que Node.js ?
Node.js est un environnement d'exécution JavaScript côté serveur, construit sur le moteur V8 de Chrome. Il permet d'exécuter du JavaScript en dehors du navigateur.
Installation
bash# Vérifier si Node.js est installé
node --version
npm --version

# Installer Node.js depuis https://nodejs.org
# Choisir la version LTS (Long Term Support)
2. NPM (Node Package Manager)
Initialiser un projet
bash# Créer un nouveau projet
mkdir finsolutions
cd finsolutions
npm init -y
Commandes essentielles
bash# Installer un package
npm install express

# Installer en tant que dépendance de développement
npm install --save-dev nodemon

# Désinstaller un package
npm uninstall express

# Mettre à jour les packages
npm update
Fichier package.json
json{
  "name": "finsolutions",
  "version": "1.0.0",
  "description": "Application de gestion de budget",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
3. Modules Node.js
-----Système de modules CommonJS

function addition(a,b){
  return a+b;
}
  function soustraction(a,b){
    return a-b;

  }

module.export={
  addition,
  soustraction
};
//importer in module(app.js)

const math=require('./math);

-------Modules natifs importants FS(file systeme)
//Gestion des fichiers
const fs=require('fs');
//lire un fichie
fs.readFile('data.txt','utf8',(err,data)=>{
  if(err) throw err;
  console.log(data);
});

// Écrire dans un fichier
fs.writeFile('output.txt', 'Contenu', (err) => {
  if (err) throw err;
  console.log('Fichier créé !');
});

//manipulation des chemins

const path=require('path');
const filePath=path.join(__dirname,'data','users.json)

// CREE un serveur basique
const http =require('http');


const server= http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<h1>hello word</h1>);
});

server.listen(3000,()=>{
  console.log('serveur demare sur le post 3000');
});

______Programmation Asynchrone______
-----Calbacks----
function fetchUser(id,callback){
  setTime(()=>{
    const user={id:id,nom:'doja'};
    calback(null,user);
  },1000)
}

fetchUser(1, (err, user) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(user);
});

----Promises
function fetchUser(id){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      const user={id:id,nom:'doja'};
      resolve(user)
    },1000)
  });
}

fetchUser(1)
.then(user=>console.log(user))
.catch(err=>console.error(err));

----Async/Await
async function getUser(id) {
  try {
    const user = await fetchUser(id);
    console.log(user);
  } catch (err) {
    console.error(err);
  }
}

getUser(1);


___Variables d'Environnment:sont des valeurs externes à ton code qui servent souvent à configurer ton application (comme une clé API, un mot de passe de base de données, ou le port du serveur).
---utilisation de dotenv

npm install dotenv

cree un fichie.env
