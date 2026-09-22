import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for AI WhatsApp Business OS...');

  // Clean existing data
  await prisma.aIExecution.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.whatsAppAccount.deleteMany();
  await prisma.aISkill.deleteMany();
  await prisma.aIAgent.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Organization: Dar Al Kaftan Casablanca
  const org = await prisma.organization.create({
    data: {
      name: 'Dar Al Kaftan & Couture',
      slug: 'dar-kaftan-casablanca',
      industry: 'Artisanal E-Commerce',
      businessDescription: 'Maison de haute couture artisanale spécialisée dans les caftans, takchitas et jabadors traditionnels faits main à Casablanca.',
      products: 'Caftan Royal Souss, Takchite Silk Mobra, Jabador Artisanal, Babouches Cuir Luxe',
      services: 'Sur-mesure, Livraison Express Maroc (24h) & International (DHL)',
      faq: 'Les délais de confection sur-mesure sont de 7 à 10 jours. Paiement à la livraison au Maroc accepté.',
      tone: 'FRIENDLY',
      defaultLanguage: 'fr',
      businessHours: 'Lun-Sam: 09h00 - 19h00 (GMT+1)',
      policies: 'Retours acceptés sous 7 jours si article non retouché.',
      forbiddenClaims: 'Ne jamais promettre une livraison le jour même hors Casablanca sans confirmation.',
      handoffRules: 'Transférer à un agent si le client demande une remise supérieure à 15%.',
    },
  });

  // 2. Create Subscription
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      plan: 'PRO',
      status: 'ACTIVE',
      messageLimit: 5000,
      aiLimit: 2000,
      userLimit: 10,
    },
  });

  // 3. Create Users
  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@darkaftan.ma',
      name: 'Khadija Bennani',
      passwordHash: defaultPassword,
      role: 'OWNER',
      organizationId: org.id,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      email: 'sales@darkaftan.ma',
      name: 'Othmane Chraibi',
      passwordHash: defaultPassword,
      role: 'AGENT',
      organizationId: org.id,
    },
  });

  await prisma.organizationMember.createMany({
    data: [
      { userId: ownerUser.id, organizationId: org.id, role: 'OWNER' },
      { userId: agentUser.id, organizationId: org.id, role: 'AGENT' },
    ],
  });

  // 4. WhatsApp Account
  const waAccount = await prisma.whatsAppAccount.create({
    data: {
      organizationId: org.id,
      phoneNumber: '+212661234567',
      phoneNumberId: '1092837465991',
      businessAccountId: '9876543210',
      accessToken: 'EAAB_MOCK_TOKEN_MOROCCO',
      status: 'CONNECTED',
      webhookVerifyToken: 'whatsapp_os_verify_token_morocco',
    },
  });

  // 5. Default Sales Pipeline & Stages
  const pipeline = await prisma.pipeline.create({
    data: {
      organizationId: org.id,
      name: 'Pipeline Ventes Caftan',
      isDefault: true,
    },
  });

  const stagesData = [
    { name: 'Nouveau Lead', stageKey: 'NEW', order: 1, color: '#3B82F6' },
    { name: 'Contacté', stageKey: 'CONTACTED', order: 2, color: '#8B5CF6' },
    { name: 'Qualifié', stageKey: 'QUALIFIED', order: 3, color: '#EC4899' },
    { name: 'Devis / Proposition', stageKey: 'PROPOSAL', order: 4, color: '#F59E0B' },
    { name: 'Négociation', stageKey: 'NEGOTIATION', order: 5, color: '#10B981' },
    { name: 'Gagné (Vente)', stageKey: 'WON', order: 6, color: '#059669' },
    { name: 'Perdu', stageKey: 'LOST', order: 7, color: '#EF4444' },
  ];

  const createdStages: Record<string, string> = {};
  for (const s of stagesData) {
    const stage = await prisma.pipelineStage.create({
      data: {
        pipelineId: pipeline.id,
        name: s.name,
        stageKey: s.stageKey,
        order: s.order,
        color: s.color,
      },
    });
    createdStages[s.stageKey] = stage.id;
  }

  // 6. Templates
  await prisma.messageTemplate.createMany({
    data: [
      {
        organizationId: org.id,
        name: 'Prix & Catalogue Caftan',
        category: 'Ventes',
        language: 'fr',
        content: 'Bonjour {{customer_name}} 👋 Merci pour votre intérêt envers {{business_name}}. Notre Caftan Royal est au prix de 2,500 MAD (soie vert émeraude faite main). Souhaitez-vous recevoir notre catalogue complet en PDF?',
        variables: JSON.stringify(['customer_name', 'business_name']),
      },
      {
        organizationId: org.id,
        name: 'Confirmation Délais Sur-Mesure',
        category: 'Service',
        language: 'fr',
        content: 'Salam {{customer_name}}, pour la confection sur-mesure, notre maâlem prend environ 7 à 10 jours. Je reste à votre entière disposition, {{agent_name}}.',
        variables: JSON.stringify(['customer_name', 'agent_name']),
      },
      {
        organizationId: org.id,
        name: 'Relance Prospect Darija',
        category: 'Relance',
        language: 'ar',
        content: 'Salam {{customer_name}} 👋 Kidayr(a)? Bghit nsawlak wash mazal mohtam(a) b la commande dyalk chez {{business_name}}?',
        variables: JSON.stringify(['customer_name', 'business_name']),
      },
    ],
  });

  // 7. Contacts, Conversations & Messages
  // Contact 1: Youssef Benjelloun (Rabat)
  const contact1 = await prisma.contact.create({
    data: {
      organizationId: org.id,
      name: 'Youssef Benjelloun',
      phone: '+212612345678',
      email: 'y.benjelloun@gmail.com',
      company: 'Benjelloun Logistics',
      source: 'WHATSAPP',
      leadStatus: 'QUALIFIED',
      assignedUserId: agentUser.id,
      notes: 'Intéressé par Caftan Royal vert pour mariage sœur. Livraison à Rabat.',
      tags: JSON.stringify(['Mariage', 'VIP', 'Rabat']),
    },
  });

  const conv1 = await prisma.conversation.create({
    data: {
      organizationId: org.id,
      contactId: contact1.id,
      whatsappAccountId: waAccount.id,
      assignedUserId: agentUser.id,
      status: 'OPEN',
      leadStatus: 'QUALIFIED',
      unreadCount: 1,
      lastMessageText: 'Est-ce que la livraison est disponible sur Rabat demain?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
      summary: 'Le client souhaite commander un Caftan Royal Vert émeraude (Taille M) pour un événement ce weekend à Rabat.',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        organizationId: org.id,
        conversationId: conv1.id,
        sender: 'CUSTOMER',
        recipient: waAccount.phoneNumber,
        direction: 'INBOUND',
        type: 'TEXT',
        content: 'Salam, ch\'hal thaman dyal kaftan royal khdari? Est-ce que la livraison est disponible sur Rabat?',
        status: 'READ',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        organizationId: org.id,
        conversationId: conv1.id,
        sender: 'AGENT',
        recipient: contact1.phone,
        direction: 'OUTBOUND',
        type: 'TEXT',
        content: 'Bonjour M. Benjelloun 👋 Le prix du Caftan Royal Vert est de 2 800 MAD. Oui, nous livrons à Rabat sous 24h via notre transporteur express!',
        status: 'READ',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        organizationId: org.id,
        conversationId: conv1.id,
        sender: 'CUSTOMER',
        recipient: waAccount.phoneNumber,
        direction: 'INBOUND',
        type: 'TEXT',
        content: 'Parfait! Est-ce que la livraison est disponible sur Rabat demain si je valide la commande maintenant?',
        status: 'DELIVERED',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
    ],
  });

  await prisma.lead.create({
    data: {
      organizationId: org.id,
      contactId: contact1.id,
      conversationId: conv1.id,
      pipelineId: pipeline.id,
      stageId: createdStages['QUALIFIED'],
      title: 'Caftan Royal Vert - Youssef Benjelloun',
      value: 2800.0,
      currency: 'MAD',
      assignedUserId: agentUser.id,
      buyingIntent: 'HIGH',
      budget: '3,000 MAD',
      timeline: 'Ce weekend',
      location: 'Rabat',
      productInterest: 'Caftan Royal Vert',
      notes: 'Client très chaud. Souhaite valider le paiement à la livraison.',
    },
  });

  // Contact 2: Dr. Salma Alami (Casablanca)
  const contact2 = await prisma.contact.create({
    data: {
      organizationId: org.id,
      name: 'Salma Alami',
      phone: '+212698765432',
      email: 's.alami@gmail.com',
      source: 'WHATSAPP',
      leadStatus: 'PROPOSAL',
      assignedUserId: ownerUser.id,
      notes: 'Demande sur-mesure Takchite Mobra dorée pour fiançailles.',
      tags: JSON.stringify(['Sur-Mesure', 'Casablanca']),
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      organizationId: org.id,
      contactId: contact2.id,
      whatsappAccountId: waAccount.id,
      assignedUserId: ownerUser.id,
      status: 'NEEDS_HUMAN',
      leadStatus: 'PROPOSAL',
      unreadCount: 0,
      lastMessageText: 'Merci pour le devis, je passe à votre atelier cet après-midi.',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 180),
      summary: 'Devis sur-mesure de 4,500 MAD envoyé pour Takchite Mobra Dorée.',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        organizationId: org.id,
        conversationId: conv2.id,
        sender: 'CUSTOMER',
        recipient: waAccount.phoneNumber,
        direction: 'INBOUND',
        type: 'TEXT',
        content: 'Bonjour Khadija, bghit na3raf le prix dyal takchite mobra dorée sur-mesure s\'il vous plaît.',
        status: 'READ',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
      },
      {
        organizationId: org.id,
        conversationId: conv2.id,
        sender: 'AGENT',
        recipient: contact2.phone,
        direction: 'OUTBOUND',
        type: 'TEXT',
        content: 'Bonjour Mme Alami, la Takchite Mobra dorée avec sfifa en fil d\'or pur est estimée à 4 500 MAD.',
        status: 'READ',
        timestamp: new Date(Date.now() - 1000 * 60 * 200),
      },
      {
        organizationId: org.id,
        conversationId: conv2.id,
        sender: 'CUSTOMER',
        recipient: waAccount.phoneNumber,
        direction: 'INBOUND',
        type: 'TEXT',
        content: 'Merci pour le devis, je passe à votre atelier cet après-midi vers 16h.',
        status: 'READ',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
      },
    ],
  });

  await prisma.lead.create({
    data: {
      organizationId: org.id,
      contactId: contact2.id,
      conversationId: conv2.id,
      pipelineId: pipeline.id,
      stageId: createdStages['PROPOSAL'],
      title: 'Takchite Mobra Dorée Sur-Mesure',
      value: 4500.0,
      currency: 'MAD',
      assignedUserId: ownerUser.id,
      buyingIntent: 'HIGH',
      budget: '5,000 MAD',
      timeline: 'Aujourd\'hui 16h',
      location: 'Casablanca',
      productInterest: 'Takchite Mobra Dorée',
    },
  });

  // 8. AI Agent Setup & Initial Skills
  const aiAgent = await prisma.aIAgent.create({
    data: {
      organizationId: org.id,
      name: 'Dar Al Kaftan AI Sales Engine',
      description: 'Assistant virtuel de vente spécialisé dans le textile traditionnel marocain et l\'assistance client WhatsApp.',
      isEnabled: true,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    },
  });

  const skillsToSeed = [
    { key: 'understand-message', name: 'Understand Customer Message', description: 'Classify intent, sentiment, language and urgency' },
    { key: 'generate-reply', name: 'Generate Smart Reply Options', description: 'Generate 3 contextual responses (Professional, Friendly, Sales)' },
    { key: 'qualify-lead', name: 'Qualify Lead Intent', description: 'Extract budget, timeline, location, buying intent' },
    { key: 'summarize-conversation', name: 'Summarize Conversation', description: 'Create concise summaries of customer interactions' },
    { key: 'detect-language', name: 'Multilingual Detection', description: 'Detect French, Darija, Arabic or English' },
    { key: 'detect-sentiment', name: 'Sentiment & Escalation', description: 'Flag negative sentiment and escalate to human' },
    { key: 'tone-selection', name: 'Tone Selection', description: 'Adapt response tone to business profile' },
  ];

  for (const s of skillsToSeed) {
    await prisma.aISkill.create({
      data: {
        organizationId: org.id,
        key: s.key,
        name: s.name,
        description: s.description,
        isEnabled: true,
      },
    });
  }

  console.log('✅ Database successfully seeded with realistic Moroccan business data!');
  console.log('   Organization:', org.name);
  console.log('   Credentials: owner@darkaftan.ma / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
