import { PrismaClient, UseCaseType, Channel, RunStatus } from "@prisma/client"

const prisma = new PrismaClient()

const USE_CASES = [
  {
    name: "Payment Collection",
    type: UseCaseType.PAYMENT_COLLECTION,
    description: "Automated invoice payment follow-ups with escalating urgency",
    icon: "banknote",
    color: "#22C55E",
    successCondition: "Payment received / invoice marked paid",
    channels: [Channel.WHATSAPP, Channel.EMAIL],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "professional",
        messageTemplate:
          "Hi {{name}}, this is a gentle reminder that invoice #{{invoiceNumber}} for {{amount}} was due on {{dueDate}}. Please find payment details below. {{paymentLink}}",
      },
      {
        stepNumber: 2,
        delayHours: 72,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Just checking in, {{name}}. We noticed the payment for invoice #{{invoiceNumber}} is still pending. Is there anything we can help clarify?",
      },
      {
        stepNumber: 3,
        delayHours: 168,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Invoice #{{invoiceNumber}} — {{daysOverdue}} days overdue",
        tone: "professional",
        messageTemplate:
          "{{name}}, invoice #{{invoiceNumber}} is now {{daysOverdue}} days overdue. Please let us know if there's an issue with the payment of {{amount}}.",
      },
      {
        stepNumber: 4,
        delayHours: 336,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "firm",
        messageTemplate:
          "{{name}}, we need to resolve the outstanding balance of {{amount}} urgently. Please respond to avoid service interruption.",
      },
      {
        stepNumber: 5,
        delayHours: 504,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Final Notice — Invoice #{{invoiceNumber}}",
        tone: "urgent",
        messageTemplate:
          "Final notice before we escalate this matter. {{name}}, please respond immediately regarding the outstanding payment of {{amount}} for invoice #{{invoiceNumber}}.",
      },
    ],
  },
  {
    name: "Sales Inquiry Follow-up",
    type: UseCaseType.SALES_INQUIRY,
    description: "Nurture inbound leads with value-driven follow-ups until demo is booked",
    icon: "search",
    color: "#3B82F6",
    successCondition: "Demo booked or proposal requested",
    channels: [Channel.EMAIL, Channel.WHATSAPP],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Thanks for your interest in {{productName}}",
        tone: "friendly",
        messageTemplate:
          "Hi {{name}}, thanks for your interest in {{productName}}. I'd love to show you how it works. Are you free for a 20-min call this week?",
      },
      {
        stepNumber: 2,
        delayHours: 48,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "How {{productName}} helped companies like {{company}}",
        tone: "professional",
        messageTemplate:
          "Hi {{name}}, I wanted to share a quick case study on how {{productName}} helped a company similar to {{company}} achieve great results. Would you like to see a quick demo?",
      },
      {
        stepNumber: 3,
        delayHours: 120,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "{{name}}, I wanted to share something that might be relevant to {{company}}. We just released a new feature that could help your team. Interested in learning more?",
      },
      {
        stepNumber: 4,
        delayHours: 216,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "No worries if timing isn't right",
        tone: "professional",
        messageTemplate:
          "No worries if the timing isn't right, {{name}}. I'll leave this here and you can reach out when ready. In the meantime, here's our resource center: {{resourceLink}}",
      },
      {
        stepNumber: 5,
        delayHours: 504,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Circling back — {{productName}}",
        tone: "friendly",
        messageTemplate:
          "{{name}}, circling back after a few weeks. Has anything changed at {{company}}? Would love to reconnect if the timing is better now.",
      },
    ],
  },
  {
    name: "Meeting / Demo Booking",
    type: UseCaseType.MEETING_BOOKING,
    description: "Get prospects to book a meeting slot with persistent, friendly follow-ups",
    icon: "calendar",
    color: "#8B5CF6",
    successCondition: "Calendar invite accepted",
    channels: [Channel.EMAIL, Channel.WHATSAPP],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Let's schedule a quick call",
        tone: "friendly",
        messageTemplate:
          "Hi {{name}}, here's my calendar link to book a slot that works for you: {{calLink}}. Looking forward to connecting!",
      },
      {
        stepNumber: 2,
        delayHours: 48,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Haven't seen a booking yet, {{name}}. Here are 3 slots that work for me: {{slot1}}, {{slot2}}, {{slot3}}. Which works?",
      },
      {
        stepNumber: 3,
        delayHours: 96,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Quick follow-up on scheduling",
        tone: "professional",
        messageTemplate:
          "Quick follow-up, {{name}} — should I reach out at a better time? Happy to work around your schedule.",
      },
      {
        stepNumber: 4,
        delayHours: 168,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Last check-in on meeting",
        tone: "professional",
        messageTemplate:
          "{{name}}, this is my final check-in about booking a call. If you're still interested, here's my calendar: {{calLink}}. Otherwise, no worries at all.",
      },
    ],
  },
  {
    name: "Proposal Follow-up",
    type: UseCaseType.PROPOSAL_FOLLOWUP,
    description: "Follow up on sent proposals until feedback or acceptance is received",
    icon: "file-text",
    color: "#F59E0B",
    successCondition: "Proposal accepted or feedback received",
    channels: [Channel.EMAIL],
    steps: [
      {
        stepNumber: 1,
        delayHours: 48,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Following up on {{projectName}} proposal",
        tone: "professional",
        messageTemplate:
          "Hi {{name}}, just checking you received the proposal for {{projectName}}. Happy to walk you through it or answer any questions.",
      },
      {
        stepNumber: 2,
        delayHours: 120,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Re: {{projectName}} proposal — common questions",
        tone: "professional",
        messageTemplate:
          "{{name}}, I know proposals can raise questions. Here are a few common ones we hear: timeline flexibility, payment terms, and scope adjustments. Want to discuss any of these?",
      },
      {
        stepNumber: 3,
        delayHours: 240,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Project pipeline update — {{projectName}}",
        tone: "friendly",
        messageTemplate:
          "{{name}}, we're finalizing our project pipeline for the month. Where are you on the decision for {{projectName}}?",
      },
      {
        stepNumber: 4,
        delayHours: 360,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Flexible options for {{projectName}}",
        tone: "professional",
        messageTemplate:
          "{{name}}, if the current scope or pricing doesn't quite fit, I'm open to adjusting. Let's find something that works for {{company}}.",
      },
      {
        stepNumber: 5,
        delayHours: 504,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Should I close this? — {{projectName}}",
        tone: "professional",
        messageTemplate:
          "Should I close this or is there still interest, {{name}}? No pressure either way — just want to keep things tidy on our end.",
      },
    ],
  },
  {
    name: "Quote Follow-up",
    type: UseCaseType.QUOTE_FOLLOWUP,
    description: "Follow up on sent quotes until approval or PO is received",
    icon: "receipt",
    color: "#EC4899",
    successCondition: "Quote approved or PO received",
    channels: [Channel.WHATSAPP, Channel.EMAIL],
    steps: [
      {
        stepNumber: 1,
        delayHours: 24,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Hi {{name}}, just wanted to confirm you received the quote for {{itemDescription}} — {{amount}}. Any questions?",
      },
      {
        stepNumber: 2,
        delayHours: 72,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Quote validity reminder — {{itemDescription}}",
        tone: "professional",
        messageTemplate:
          "{{name}}, just a heads up that the quote for {{itemDescription}} is valid until {{expiryDate}}. Let me know if you'd like to proceed.",
      },
      {
        stepNumber: 3,
        delayHours: 144,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "{{name}}, I might be able to offer a small adjustment on the quote for {{itemDescription}} if that helps move things forward. Interested?",
      },
      {
        stepNumber: 4,
        delayHours: 240,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Final follow-up — {{itemDescription}} quote",
        tone: "professional",
        messageTemplate:
          "{{name}}, this is my last follow-up on the quote for {{itemDescription}}. Let me know if you'd like to proceed or if circumstances have changed.",
      },
    ],
  },
  {
    name: "Onboarding Follow-up",
    type: UseCaseType.ONBOARDING,
    description: "Guide new users through setup with helpful nudges",
    icon: "rocket",
    color: "#06B6D4",
    successCondition: "User completes setup / first login / first transaction",
    channels: [Channel.EMAIL, Channel.WHATSAPP],
    steps: [
      {
        stepNumber: 1,
        delayHours: 24,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Welcome to {{productName}} — let's get started!",
        tone: "friendly",
        messageTemplate:
          "Welcome aboard, {{name}}! Here's a quick setup guide to get you started with {{productName}}: {{setupLink}}. It only takes 5 minutes.",
      },
      {
        stepNumber: 2,
        delayHours: 72,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "{{name}}, need help getting started with {{productName}}? Here's a 5-minute setup walkthrough: {{setupLink}}",
      },
      {
        stepNumber: 3,
        delayHours: 168,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "We noticed you haven't logged in yet",
        tone: "professional",
        messageTemplate:
          "We noticed you haven't logged in yet, {{name}}. Can I help with anything? Common setup questions: {{faqLink}}",
      },
      {
        stepNumber: 4,
        delayHours: 336,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Free onboarding call — {{productName}}",
        tone: "friendly",
        messageTemplate:
          "{{name}}, I'd love to offer you a free onboarding call to walk you through {{productName}}. Book a time here: {{calLink}}",
      },
    ],
  },
  {
    name: "Contract Renewal",
    type: UseCaseType.CONTRACT_RENEWAL,
    description: "Proactively manage contract renewals with timely reminders",
    icon: "refresh-cw",
    color: "#10B981",
    successCondition: "Renewal confirmed or new contract signed",
    channels: [Channel.EMAIL],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Contract renewal for {{serviceName}} — {{renewalDate}}",
        tone: "professional",
        messageTemplate:
          "{{name}}, your contract for {{serviceName}} renews on {{renewalDate}}. Let's discuss your options and any updates to your plan.",
      },
      {
        stepNumber: 2,
        delayHours: 720,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Renewal proposal — {{serviceName}}",
        tone: "professional",
        messageTemplate:
          "{{name}}, I've prepared a renewal proposal for {{serviceName}} with updated terms. Please review and let me know your thoughts.",
      },
      {
        stepNumber: 3,
        delayHours: 1104,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Renewal deadline approaching — {{serviceName}}",
        tone: "urgent",
        messageTemplate:
          "{{name}}, your {{serviceName}} contract expires in 14 days. We have a special offer for early renewal. Want to discuss?",
      },
      {
        stepNumber: 4,
        delayHours: 1272,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "7 days until expiry — {{serviceName}}",
        tone: "urgent",
        messageTemplate:
          "{{name}}, only 7 days left on your {{serviceName}} contract. Please confirm your renewal to avoid any service disruption.",
      },
      {
        stepNumber: 5,
        delayHours: 1440,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "URGENT: Contract expires today — {{serviceName}}",
        tone: "urgent",
        messageTemplate:
          "{{name}}, your {{serviceName}} contract expires today. Immediate action is needed to avoid service interruption. Please respond now.",
      },
    ],
  },
  {
    name: "Feedback / Review Request",
    type: UseCaseType.FEEDBACK_REQUEST,
    description: "Request reviews and feedback after service delivery",
    icon: "star",
    color: "#FBBF24",
    successCondition: "Review submitted or feedback form completed",
    channels: [Channel.WHATSAPP, Channel.EMAIL],
    steps: [
      {
        stepNumber: 1,
        delayHours: 24,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Hi {{name}}, hope everything went well! Would you mind leaving us a quick review? It takes just 30 seconds: {{reviewLink}}",
      },
      {
        stepNumber: 2,
        delayHours: 96,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Your feedback means a lot to us",
        tone: "friendly",
        messageTemplate:
          "{{name}}, your feedback means a lot to us and helps us improve. Just 30 seconds of your time: {{reviewLink}}",
      },
      {
        stepNumber: 3,
        delayHours: 192,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Last gentle ask, {{name}} — if you have a moment, we'd really appreciate your feedback: {{reviewLink}}. Thanks either way!",
      },
    ],
  },
  {
    name: "Re-engagement (Cold Leads)",
    type: UseCaseType.RE_ENGAGEMENT,
    description: "Re-engage dormant leads with fresh value and insights",
    icon: "snowflake",
    color: "#64748B",
    successCondition: "Reply received or meeting booked",
    channels: [Channel.EMAIL, Channel.WHATSAPP],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "It's been a while — something new for {{company}}",
        tone: "friendly",
        messageTemplate:
          "{{name}}, it's been a while since we spoke. Thought I'd share something relevant to {{company}}: {{insight}}",
      },
      {
        stepNumber: 2,
        delayHours: 120,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "New update you might find interesting",
        tone: "professional",
        messageTemplate:
          "{{name}}, we just launched something new that could be relevant to {{company}}. Here's a quick overview: {{updateLink}}",
      },
      {
        stepNumber: 3,
        delayHours: 288,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "professional",
        messageTemplate:
          "Closing the loop, {{name}} — should I remove you from our list or is there still interest in exploring how we can help {{company}}?",
      },
    ],
  },
  {
    name: "Event / Webinar Registration",
    type: UseCaseType.EVENT_REGISTRATION,
    description: "Drive event registrations with timely reminders and urgency",
    icon: "ticket",
    color: "#EF4444",
    successCondition: "Registration confirmed",
    channels: [Channel.EMAIL, Channel.WHATSAPP],
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "You're invited: {{eventName}} on {{eventDate}}",
        tone: "friendly",
        messageTemplate:
          "{{name}}, we're hosting {{eventName}} on {{eventDate}}. It's going to be packed with insights. Save your spot: {{registrationLink}}",
      },
      {
        stepNumber: 2,
        delayHours: 72,
        delayUnit: "hours",
        channel: Channel.WHATSAPP,
        subject: null,
        tone: "friendly",
        messageTemplate:
          "Only {{spotsLeft}} spots left for {{eventName}}, {{name}}. Don't miss it! Register here: {{registrationLink}}",
      },
      {
        stepNumber: 3,
        delayHours: 168,
        delayUnit: "hours",
        channel: Channel.EMAIL,
        subject: "Tomorrow: {{eventName}} — don't forget!",
        tone: "friendly",
        messageTemplate:
          "Reminder: {{eventName}} is tomorrow, {{name}}! Here's your joining link: {{joiningLink}}. See you there!",
      },
    ],
  },
]

async function main() {
  console.log("Seeding database...")

  const org = await prisma.organization.create({
    data: {
      name: "Solvtree Demo",
      slug: "solvtree-demo",
      n8nWebhookBase: "https://n8n.example.com",
    },
  })
  console.log(`Created org: ${org.name}`)

  for (const uc of USE_CASES) {
    const { steps, ...useCaseData } = uc
    const useCase = await prisma.useCase.create({
      data: {
        ...useCaseData,
        orgId: org.id,
        steps: {
          create: steps.map((s) => ({
            ...s,
            aiEnhance: true,
            stopIfReplied: true,
          })),
        },
      },
    })
    console.log(`Created use case: ${useCase.name} with ${steps.length} steps`)
  }

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Rahul Sharma",
        email: "rahul@techcorp.in",
        phone: "+919876543210",
        company: "TechCorp India",
        metadata: { invoiceNumber: "INV-001", amount: "50,000", dueDate: "2026-02-20" },
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Priya Patel",
        email: "priya@designstudio.com",
        phone: "+919123456789",
        company: "Design Studio",
        metadata: { productName: "FollowUp.AI", projectName: "Website Redesign" },
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Amit Joshi",
        email: "amit@globaltech.com",
        phone: "+919555555555",
        company: "GlobalTech Solutions",
        metadata: { eventName: "SaaS Growth Summit", eventDate: "2026-04-15" },
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Sneha Gupta",
        email: "sneha@finserv.io",
        phone: "+919888888888",
        company: "FinServ.io",
        metadata: { serviceName: "Enterprise Plan", renewalDate: "2026-06-01" },
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Vikram Singh",
        email: "vikram@retailmax.com",
        phone: "+919777777777",
        company: "RetailMax",
        metadata: { itemDescription: "Bulk Order - 500 units", amount: "2,50,000", expiryDate: "2026-03-30" },
      },
    }),
  ])
  console.log(`Created ${contacts.length} contacts`)

  const paymentUseCase = await prisma.useCase.findFirst({
    where: { type: UseCaseType.PAYMENT_COLLECTION, orgId: org.id },
  })

  const salesUseCase = await prisma.useCase.findFirst({
    where: { type: UseCaseType.SALES_INQUIRY, orgId: org.id },
  })

  if (paymentUseCase && salesUseCase) {
    const now = new Date()
    await prisma.followUpRun.create({
      data: {
        orgId: org.id,
        useCaseId: paymentUseCase.id,
        contactId: contacts[0].id,
        status: RunStatus.ACTIVE,
        currentStep: 2,
        metadata: { invoiceNumber: "INV-001", amount: "50,000", dueDate: "2026-02-20" },
        nextActionAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        logs: {
          create: [
            {
              stepNumber: 1,
              channel: Channel.WHATSAPP,
              message: "Hi Rahul, this is a gentle reminder that invoice #INV-001 for 50,000 was due on 2026-02-20.",
              status: "delivered",
              sentAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
            },
            {
              stepNumber: 2,
              channel: Channel.WHATSAPP,
              message: "Just checking in, Rahul. We noticed the payment for invoice #INV-001 is still pending.",
              status: "delivered",
              sentAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    })

    await prisma.followUpRun.create({
      data: {
        orgId: org.id,
        useCaseId: salesUseCase.id,
        contactId: contacts[1].id,
        status: RunStatus.SUCCESS,
        currentStep: 3,
        metadata: { productName: "FollowUp.AI" },
        successAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        logs: {
          create: [
            {
              stepNumber: 1,
              channel: Channel.EMAIL,
              message: "Hi Priya, thanks for your interest in FollowUp.AI.",
              status: "delivered",
              sentAt: new Date(now.getTime() - 120 * 60 * 60 * 1000),
            },
            {
              stepNumber: 2,
              channel: Channel.EMAIL,
              message: "Hi Priya, I wanted to share a quick case study...",
              status: "delivered",
              sentAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
            },
          ],
        },
      },
    })

    await prisma.followUpRun.create({
      data: {
        orgId: org.id,
        useCaseId: paymentUseCase.id,
        contactId: contacts[4].id,
        status: RunStatus.PAUSED,
        currentStep: 1,
        metadata: { invoiceNumber: "INV-045", amount: "2,50,000" },
        logs: {
          create: [
            {
              stepNumber: 1,
              channel: Channel.WHATSAPP,
              message: "Hi Vikram, gentle reminder about invoice #INV-045.",
              status: "sent",
            },
          ],
        },
      },
    })
  }

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@followupai.app",
      name: "Admin",
      orgId: org.id,
      role: "ADMIN",
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@followupai.app",
      name: "Demo User",
      orgId: org.id,
      role: "USER",
    },
  })
  console.log(`Created demo user: ${demoUser.email}`)

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
