import { PrismaClient, Prisma } from "@prisma/client";

import { hashPassword } from "../src/common/utils/bcrypt.utils";

const prisma = new PrismaClient();

const SEED_USER = {
  email: "dev@kresus.com",
  password: "password123",
} as const;

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

function buildTasks(userId: string): Prisma.TaskUncheckedCreateInput[] {
  return [
    {
      userId,
      title: "Corriger le bug de connexion",
      content: "Le formulaire de login ne valide pas les emails invalides",
      priority: "HIGH",
      executionDate: daysFromNow(1),
      completedAt: null,
      createdAt: daysAgo(25),
    },
    {
      userId,
      title: "Mettre en production la v2",
      content: "Déployer la nouvelle version sur le serveur de production après validation QA",
      priority: "HIGH",
      executionDate: daysFromNow(3),
      completedAt: null,
      createdAt: daysAgo(20),
    },
    {
      userId,
      title: "Audit de sécurité",
      content:
        "Passer en revue les dépendances et corriger les vulnérabilités critiques identifiées par npm audit",
      priority: "HIGH",
      executionDate: daysAgo(2),
      completedAt: daysAgo(1),
      createdAt: daysAgo(18),
    },
    {
      userId,
      title: "Réparer le pipeline CI",
      content: "Les tests e2e échouent depuis la mise à jour de Node",
      priority: "HIGH",
      executionDate: null,
      completedAt: daysAgo(5),
      createdAt: daysAgo(15),
    },
    {
      userId,
      title: "Migration base de données urgente",
      content: "Ajouter la colonne manquante avant le sprint suivant",
      priority: "HIGH",
      executionDate: daysAgo(7),
      completedAt: daysAgo(6),
      createdAt: daysAgo(12),
    },
    {
      userId,
      title: "Résoudre la fuite mémoire",
      content:
        "Le service API consomme trop de RAM en production, investiguer les connexions Prisma",
      priority: "HIGH",
      executionDate: daysFromNow(2),
      completedAt: null,
      createdAt: daysAgo(3),
    },
    {
      userId,
      title: "Ajouter la pagination",
      content: "Implémenter la pagination côté API et frontend pour la liste des tâches",
      priority: "MEDIUM",
      executionDate: daysFromNow(7),
      completedAt: null,
      createdAt: daysAgo(22),
    },
    {
      userId,
      title: "Refactorer le composant formulaire",
      content: "Extraire la logique commune entre création et édition de tâche",
      priority: "MEDIUM",
      executionDate: null,
      completedAt: daysAgo(3),
      createdAt: daysAgo(17),
    },
    {
      userId,
      title: "Écrire les tests unitaires du service",
      content: "Couvrir les cas limites du TaskService",
      priority: "MEDIUM",
      executionDate: daysFromNow(5),
      completedAt: null,
      createdAt: daysAgo(14),
    },
    {
      userId,
      title: "Optimiser les requêtes Prisma",
      content: "Analyser les requêtes lentes avec EXPLAIN et ajouter les index manquants",
      priority: "MEDIUM",
      executionDate: daysAgo(3),
      completedAt: daysAgo(2),
      createdAt: daysAgo(10),
    },
    {
      userId,
      title: "Configurer le rate limiting",
      content: "Protéger les endpoints publics contre les abus",
      priority: "MEDIUM",
      executionDate: null,
      completedAt: null,
      createdAt: daysAgo(8),
    },
    {
      userId,
      title: "Mettre à jour les dépendances",
      content: "Bump des versions mineures et patch de toutes les dépendances du monorepo",
      priority: "MEDIUM",
      executionDate: daysFromNow(14),
      completedAt: null,
      createdAt: daysAgo(2),
    },
    {
      userId,
      title: "Améliorer le README",
      content:
        "Documenter les commandes de développement et le setup initial pour les nouveaux contributeurs",
      priority: "LOW",
      executionDate: null,
      completedAt: daysAgo(10),
      createdAt: daysAgo(28),
    },
    {
      userId,
      title: "Ajouter des animations de transition",
      content: "Utiliser les transitions Vue pour les listes et les modales",
      priority: "LOW",
      executionDate: daysFromNow(21),
      completedAt: null,
      createdAt: daysAgo(24),
    },
    {
      userId,
      title: "Nettoyer les fichiers inutilisés",
      content: "Supprimer les composants et utils orphelins du projet",
      priority: "LOW",
      executionDate: null,
      completedAt: null,
      createdAt: daysAgo(19),
    },
    {
      userId,
      title: "Explorer le dark mode",
      content: "Tester la faisabilité du thème sombre avec Tailwind",
      priority: "LOW",
      executionDate: daysFromNow(30),
      completedAt: null,
      createdAt: daysAgo(7),
    },
    {
      userId,
      title: "Revoir le design du tableau de bord",
      content:
        "Proposer une maquette avec des statistiques sur les tâches complétées et en attente, inspirée de Notion",
      priority: "LOW",
      executionDate: daysAgo(5),
      completedAt: daysAgo(4),
      createdAt: daysAgo(13),
    },
    {
      userId,
      title: "Ajouter un favicon",
      content: "Créer et intégrer le favicon du projet",
      priority: "LOW",
      executionDate: null,
      completedAt: daysAgo(15),
      createdAt: daysAgo(30),
    },
  ];
}

async function main() {
  const hashedPassword = await hashPassword(SEED_USER.password);

  const user = await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { user: { email: SEED_USER.email } } });
    await tx.user.deleteMany({ where: { email: SEED_USER.email } });

    return tx.user.create({
      data: { email: SEED_USER.email, password: hashedPassword },
    });
  });

  const tasks = buildTasks(user.id);
  await prisma.task.createMany({ data: tasks });

  console.log(`Seeded user: ${user.email} (${user.id})`);
  console.log(`Seeded ${tasks.length} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
