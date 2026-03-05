/**
 * USE CASE TEMPLATE LIBRARY
 *
 * 10 use case types x 2 variants = 20 templates
 * - Standard: Professional tone, moderate delays
 * - Aggressive: Urgent tone, shorter delays, tighter follow-ups
 *
 * Each template maps directly to the UseCase + FollowUpStep schema.
 * When a user picks a template, we POST it to /api/use-cases as-is.
 */

export interface TemplateStep {
  stepNumber: number
  delayHours: number
  channel: "EMAIL" | "WHATSAPP" | "SMS"
  tone: string
  subject?: string
  messageTemplate: string
  aiEnhance: boolean
  stopIfReplied: boolean
}

export interface UseCaseTemplate {
  type: string
  variantId: string
  variantName: string
  variantDescription: string
  name: string
  description: string
  icon: string
  color: string
  channels: ("EMAIL" | "WHATSAPP" | "SMS")[]
  successCondition: string
  steps: TemplateStep[]
}

export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  // ───────────────── PAYMENT COLLECTION ─────────────────
  {
    type: "PAYMENT_COLLECTION",
    variantId: "payment-standard",
    variantName: "Standard",
    variantDescription: "Professional 5-step sequence over 3 weeks with gentle escalation",
    name: "Payment Collection",
    description: "Automated invoice payment follow-ups with escalating urgency",
    icon: "banknote",
    color: "#22C55E",
    channels: ["WHATSAPP", "EMAIL"],
    successCondition: "Payment received / invoice marked paid",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "WHATSAPP", tone: "professional",
        messageTemplate: "Hi {{name}}, this is a gentle reminder that invoice #{{invoiceNumber}} for {{amount}} was due on {{dueDate}}. Please find payment details below. {{paymentLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 72, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Just checking in, {{name}}. We noticed the payment for invoice #{{invoiceNumber}} is still pending. Is there anything we can help clarify?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 168, channel: "EMAIL", tone: "professional",
        subject: "Invoice #{{invoiceNumber}} — {{daysOverdue}} days overdue",
        messageTemplate: "{{name}}, invoice #{{invoiceNumber}} is now {{daysOverdue}} days overdue. Please let us know if there's an issue with the payment of {{amount}}.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 336, channel: "WHATSAPP", tone: "firm",
        messageTemplate: "{{name}}, we need to resolve the outstanding balance of {{amount}} urgently. Please respond to avoid service interruption.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 504, channel: "EMAIL", tone: "urgent",
        subject: "Final Notice — Invoice #{{invoiceNumber}}",
        messageTemplate: "Final notice before we escalate this matter. {{name}}, please respond immediately regarding the outstanding payment of {{amount}} for invoice #{{invoiceNumber}}.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "PAYMENT_COLLECTION",
    variantId: "payment-aggressive",
    variantName: "Aggressive",
    variantDescription: "Urgent 6-step sequence over 10 days with rapid escalation",
    name: "Payment Collection (Urgent)",
    description: "Fast-paced payment recovery with daily follow-ups and firm escalation",
    icon: "banknote",
    color: "#22C55E",
    channels: ["WHATSAPP", "EMAIL", "SMS"],
    successCondition: "Payment received / invoice marked paid",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "WHATSAPP", tone: "firm",
        messageTemplate: "{{name}}, invoice #{{invoiceNumber}} for {{amount}} is overdue. Please process payment today. {{paymentLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 24, channel: "EMAIL", tone: "firm",
        subject: "URGENT: Overdue invoice #{{invoiceNumber}} — {{amount}}",
        messageTemplate: "{{name}}, we haven't received payment for invoice #{{invoiceNumber}}. The overdue amount is {{amount}}. Immediate payment is required to avoid service disruption.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 48, channel: "SMS", tone: "urgent",
        messageTemplate: "{{name}}, invoice #{{invoiceNumber}} ({{amount}}) is critically overdue. Please pay now: {{paymentLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 96, channel: "WHATSAPP", tone: "urgent",
        messageTemplate: "{{name}}, this is your third reminder. Invoice #{{invoiceNumber}} for {{amount}} MUST be paid immediately. Services will be suspended if unresolved.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 168, channel: "EMAIL", tone: "urgent",
        subject: "FINAL WARNING: Invoice #{{invoiceNumber}} — Service Suspension",
        messageTemplate: "{{name}}, this is the final warning. If payment of {{amount}} for invoice #{{invoiceNumber}} is not received within 48 hours, we will proceed with service suspension and collection proceedings.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 6, delayHours: 240, channel: "EMAIL", tone: "urgent",
        subject: "Account Escalated — Invoice #{{invoiceNumber}}",
        messageTemplate: "{{name}}, your account has been escalated due to non-payment of {{amount}}. Please contact us immediately to resolve this before further action is taken.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── SALES INQUIRY ─────────────────
  {
    type: "SALES_INQUIRY",
    variantId: "sales-standard",
    variantName: "Standard",
    variantDescription: "Warm 5-step nurture sequence over 3 weeks",
    name: "Sales Inquiry Follow-up",
    description: "Nurture inbound leads with value-driven follow-ups until demo is booked",
    icon: "search",
    color: "#3B82F6",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Demo booked or proposal requested",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "Thanks for your interest in {{productName}}",
        messageTemplate: "Hi {{name}}, thanks for your interest in {{productName}}. I'd love to show you how it works. Are you free for a 20-min call this week?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 48, channel: "EMAIL", tone: "professional",
        subject: "How {{productName}} helped companies like {{company}}",
        messageTemplate: "Hi {{name}}, I wanted to share a quick case study on how {{productName}} helped a company similar to {{company}} achieve great results. Would you like to see a quick demo?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 120, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, I wanted to share something that might be relevant to {{company}}. We just released a new feature that could help your team. Interested in learning more?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 216, channel: "EMAIL", tone: "professional",
        subject: "No worries if timing isn't right",
        messageTemplate: "No worries if the timing isn't right, {{name}}. I'll leave this here and you can reach out when ready. In the meantime, here's our resource center: {{resourceLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 504, channel: "EMAIL", tone: "friendly",
        subject: "Circling back — {{productName}}",
        messageTemplate: "{{name}}, circling back after a few weeks. Has anything changed at {{company}}? Would love to reconnect if the timing is better now.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "SALES_INQUIRY",
    variantId: "sales-aggressive",
    variantName: "Aggressive",
    variantDescription: "High-touch 5-step sequence over 5 days with urgency",
    name: "Sales Inquiry (Fast Track)",
    description: "High-urgency lead conversion with daily touchpoints and FOMO triggers",
    icon: "search",
    color: "#3B82F6",
    channels: ["EMAIL", "WHATSAPP", "SMS"],
    successCondition: "Demo booked or proposal requested",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "{{name}}, quick question about {{company}}",
        messageTemplate: "Hi {{name}}, we have limited demo slots this week for {{productName}}. Based on what {{company}} does, I think you'd find this really valuable. Want me to save you a spot?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 12, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, just sent you an email about {{productName}}. Only 3 demo slots left this week. Want one?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 36, channel: "EMAIL", tone: "professional",
        subject: "{{company}} + {{productName}} — quick ROI analysis",
        messageTemplate: "{{name}}, I put together a quick ROI estimate for {{company}} using {{productName}}. The numbers are impressive. Can I walk you through it in 15 minutes?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 72, channel: "SMS", tone: "friendly",
        messageTemplate: "{{name}}, last chance to grab a demo slot for {{productName}} this week. Book here: {{calLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 120, channel: "EMAIL", tone: "professional",
        subject: "Moving on — unless you're still interested",
        messageTemplate: "{{name}}, I'll close this out unless I hear back. If {{company}} ever needs {{productName}}, my door is always open. Just hit reply.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── MEETING BOOKING ─────────────────
  {
    type: "MEETING_BOOKING",
    variantId: "meeting-standard",
    variantName: "Standard",
    variantDescription: "Friendly 4-step sequence over 1 week",
    name: "Meeting / Demo Booking",
    description: "Get prospects to book a meeting slot with persistent, friendly follow-ups",
    icon: "calendar",
    color: "#8B5CF6",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Calendar invite accepted",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "Let's schedule a quick call",
        messageTemplate: "Hi {{name}}, here's my calendar link to book a slot that works for you: {{calLink}}. Looking forward to connecting!",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 48, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Haven't seen a booking yet, {{name}}. Here are 3 slots that work for me: {{slot1}}, {{slot2}}, {{slot3}}. Which works?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 96, channel: "EMAIL", tone: "professional",
        subject: "Quick follow-up on scheduling",
        messageTemplate: "Quick follow-up, {{name}} — should I reach out at a better time? Happy to work around your schedule.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 168, channel: "EMAIL", tone: "professional",
        subject: "Last check-in on meeting",
        messageTemplate: "{{name}}, this is my final check-in about booking a call. If you're still interested, here's my calendar: {{calLink}}. Otherwise, no worries at all.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "MEETING_BOOKING",
    variantId: "meeting-aggressive",
    variantName: "Aggressive",
    variantDescription: "Persistent 5-step sequence over 3 days with urgency",
    name: "Meeting Booking (Persistent)",
    description: "Rapid-fire meeting scheduling with same-day and next-day touchpoints",
    icon: "calendar",
    color: "#8B5CF6",
    channels: ["EMAIL", "WHATSAPP", "SMS"],
    successCondition: "Calendar invite accepted",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "{{name}}, let's connect today",
        messageTemplate: "Hi {{name}}, I have a slot open today at {{slot1}} and tomorrow at {{slot2}}. Which works better? Here's my calendar: {{calLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 4, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, just sent you a calendar invite. Can you confirm one of these times? {{slot1}} or {{slot2}}. Only takes 15 min!",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 24, channel: "SMS", tone: "friendly",
        messageTemplate: "{{name}}, quick 15-min call? Book here: {{calLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 48, channel: "EMAIL", tone: "professional",
        subject: "One last try — 15 minutes that could change everything",
        messageTemplate: "{{name}}, I know you're busy. Just 15 minutes — if it's not valuable, I'll never bother you again. Pick a slot: {{calLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 72, channel: "WHATSAPP", tone: "professional",
        messageTemplate: "{{name}}, closing out my calendar hold for you. Last chance to grab a slot: {{calLink}}. Otherwise, reach out anytime you're ready.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── PROPOSAL FOLLOWUP ─────────────────
  {
    type: "PROPOSAL_FOLLOWUP",
    variantId: "proposal-standard",
    variantName: "Standard",
    variantDescription: "Professional 5-step sequence over 3 weeks",
    name: "Proposal Follow-up",
    description: "Follow up on sent proposals until feedback or acceptance is received",
    icon: "file-text",
    color: "#F59E0B",
    channels: ["EMAIL"],
    successCondition: "Proposal accepted or feedback received",
    steps: [
      {
        stepNumber: 1, delayHours: 48, channel: "EMAIL", tone: "professional",
        subject: "Following up on {{projectName}} proposal",
        messageTemplate: "Hi {{name}}, just checking you received the proposal for {{projectName}}. Happy to walk you through it or answer any questions.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 120, channel: "EMAIL", tone: "professional",
        subject: "Re: {{projectName}} proposal — common questions",
        messageTemplate: "{{name}}, I know proposals can raise questions. Here are a few common ones we hear: timeline flexibility, payment terms, and scope adjustments. Want to discuss any of these?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 240, channel: "EMAIL", tone: "friendly",
        subject: "Project pipeline update — {{projectName}}",
        messageTemplate: "{{name}}, we're finalizing our project pipeline for the month. Where are you on the decision for {{projectName}}?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 360, channel: "EMAIL", tone: "professional",
        subject: "Flexible options for {{projectName}}",
        messageTemplate: "{{name}}, if the current scope or pricing doesn't quite fit, I'm open to adjusting. Let's find something that works for {{company}}.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 504, channel: "EMAIL", tone: "professional",
        subject: "Should I close this? — {{projectName}}",
        messageTemplate: "Should I close this or is there still interest, {{name}}? No pressure either way — just want to keep things tidy on our end.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "PROPOSAL_FOLLOWUP",
    variantId: "proposal-aggressive",
    variantName: "Aggressive",
    variantDescription: "Tight 4-step sequence over 5 days with urgency",
    name: "Proposal Follow-up (Fast Close)",
    description: "Rapid proposal follow-up with urgency triggers and deadline pressure",
    icon: "file-text",
    color: "#F59E0B",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Proposal accepted or feedback received",
    steps: [
      {
        stepNumber: 1, delayHours: 12, channel: "EMAIL", tone: "professional",
        subject: "Quick question on {{projectName}} proposal",
        messageTemplate: "Hi {{name}}, wanted to check if you had a chance to review the {{projectName}} proposal. I have capacity to start next week if we can finalize this week.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 36, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, just checking in on the {{projectName}} proposal. Our pricing is locked in until {{expiryDate}}. Any questions I can answer?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 72, channel: "EMAIL", tone: "urgent",
        subject: "Proposal pricing expires soon — {{projectName}}",
        messageTemplate: "{{name}}, heads up — the pricing on the {{projectName}} proposal expires in 48 hours. After that, we'll need to re-quote based on current rates. Can we lock this in?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 120, channel: "EMAIL", tone: "professional",
        subject: "Final follow-up — {{projectName}}",
        messageTemplate: "{{name}}, I'm closing out the {{projectName}} proposal on my end. If you'd like to revisit later, just reach out and we'll put together a fresh quote for {{company}}.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── QUOTE FOLLOWUP ─────────────────
  {
    type: "QUOTE_FOLLOWUP",
    variantId: "quote-standard",
    variantName: "Standard",
    variantDescription: "Balanced 4-step sequence over 10 days",
    name: "Quote Follow-up",
    description: "Follow up on sent quotes until approval or PO is received",
    icon: "receipt",
    color: "#EC4899",
    channels: ["WHATSAPP", "EMAIL"],
    successCondition: "Quote approved or PO received",
    steps: [
      {
        stepNumber: 1, delayHours: 24, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Hi {{name}}, just wanted to confirm you received the quote for {{itemDescription}} — {{amount}}. Any questions?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 72, channel: "EMAIL", tone: "professional",
        subject: "Quote validity reminder — {{itemDescription}}",
        messageTemplate: "{{name}}, just a heads up that the quote for {{itemDescription}} is valid until {{expiryDate}}. Let me know if you'd like to proceed.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 144, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, I might be able to offer a small adjustment on the quote for {{itemDescription}} if that helps move things forward. Interested?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 240, channel: "EMAIL", tone: "professional",
        subject: "Final follow-up — {{itemDescription}} quote",
        messageTemplate: "{{name}}, this is my last follow-up on the quote for {{itemDescription}}. Let me know if you'd like to proceed or if circumstances have changed.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "QUOTE_FOLLOWUP",
    variantId: "quote-aggressive",
    variantName: "Aggressive",
    variantDescription: "Fast 4-step sequence over 4 days with discount incentives",
    name: "Quote Follow-up (Urgent Close)",
    description: "Quick-close quote follow-up with time-sensitive offers",
    icon: "receipt",
    color: "#EC4899",
    channels: ["WHATSAPP", "EMAIL", "SMS"],
    successCondition: "Quote approved or PO received",
    steps: [
      {
        stepNumber: 1, delayHours: 4, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, your quote for {{itemDescription}} at {{amount}} is ready. We can lock in this price if you confirm by end of day. Interested?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 24, channel: "EMAIL", tone: "professional",
        subject: "Limited time: Special pricing on {{itemDescription}}",
        messageTemplate: "{{name}}, we're offering priority pricing on {{itemDescription}} this week. Current quote: {{amount}}. This rate expires {{expiryDate}}. Ready to move forward?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 48, channel: "SMS", tone: "urgent",
        messageTemplate: "{{name}}, quote for {{itemDescription}} expires tomorrow. Confirm now to lock in {{amount}}.",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 96, channel: "EMAIL", tone: "professional",
        subject: "Quote expired — {{itemDescription}}",
        messageTemplate: "{{name}}, the special pricing on {{itemDescription}} has expired. If you're still interested, reach out and I'll see what I can do for {{company}}.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── ONBOARDING ─────────────────
  {
    type: "ONBOARDING",
    variantId: "onboarding-standard",
    variantName: "Standard",
    variantDescription: "Supportive 4-step sequence over 2 weeks",
    name: "Onboarding Follow-up",
    description: "Guide new users through setup with helpful nudges",
    icon: "rocket",
    color: "#06B6D4",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "User completes setup / first login / first transaction",
    steps: [
      {
        stepNumber: 1, delayHours: 24, channel: "EMAIL", tone: "friendly",
        subject: "Welcome to {{productName}} — let's get started!",
        messageTemplate: "Welcome aboard, {{name}}! Here's a quick setup guide to get you started with {{productName}}: {{setupLink}}. It only takes 5 minutes.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 72, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, need help getting started with {{productName}}? Here's a 5-minute setup walkthrough: {{setupLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 168, channel: "EMAIL", tone: "professional",
        subject: "We noticed you haven't logged in yet",
        messageTemplate: "We noticed you haven't logged in yet, {{name}}. Can I help with anything? Common setup questions: {{faqLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 336, channel: "EMAIL", tone: "friendly",
        subject: "Free onboarding call — {{productName}}",
        messageTemplate: "{{name}}, I'd love to offer you a free onboarding call to walk you through {{productName}}. Book a time here: {{calLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "ONBOARDING",
    variantId: "onboarding-aggressive",
    variantName: "Aggressive",
    variantDescription: "High-touch 5-step sequence over 5 days",
    name: "Onboarding (High Touch)",
    description: "Intensive onboarding with daily check-ins to ensure activation",
    icon: "rocket",
    color: "#06B6D4",
    channels: ["EMAIL", "WHATSAPP", "SMS"],
    successCondition: "User completes setup / first login / first transaction",
    steps: [
      {
        stepNumber: 1, delayHours: 1, channel: "EMAIL", tone: "friendly",
        subject: "You're in! Set up {{productName}} in 3 minutes",
        messageTemplate: "{{name}}, welcome! Your {{productName}} account is ready. Complete setup in just 3 minutes: {{setupLink}}. I'm here if you need any help.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 12, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, quick check — did you get set up with {{productName}}? If not, I can walk you through it right now. Just reply!",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 36, channel: "SMS", tone: "friendly",
        messageTemplate: "{{name}}, your {{productName}} setup is almost done! Finish here: {{setupLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 72, channel: "EMAIL", tone: "professional",
        subject: "Your account expires soon — complete setup",
        messageTemplate: "{{name}}, your {{productName}} trial setup window closes in 48 hours. Complete your setup now to keep your account active: {{setupLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 120, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, I noticed you haven't finished setup. Want me to schedule a quick call to help? It'll only take 10 minutes. {{calLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── CONTRACT RENEWAL ─────────────────
  {
    type: "CONTRACT_RENEWAL",
    variantId: "renewal-standard",
    variantName: "Standard",
    variantDescription: "Planned 5-step sequence starting 60 days before expiry",
    name: "Contract Renewal",
    description: "Proactively manage contract renewals with timely reminders",
    icon: "refresh-cw",
    color: "#10B981",
    channels: ["EMAIL"],
    successCondition: "Renewal confirmed or new contract signed",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "professional",
        subject: "Contract renewal for {{serviceName}} — {{renewalDate}}",
        messageTemplate: "{{name}}, your contract for {{serviceName}} renews on {{renewalDate}}. Let's discuss your options and any updates to your plan.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 720, channel: "EMAIL", tone: "professional",
        subject: "Renewal proposal — {{serviceName}}",
        messageTemplate: "{{name}}, I've prepared a renewal proposal for {{serviceName}} with updated terms. Please review and let me know your thoughts.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 1104, channel: "EMAIL", tone: "urgent",
        subject: "Renewal deadline approaching — {{serviceName}}",
        messageTemplate: "{{name}}, your {{serviceName}} contract expires in 14 days. We have a special offer for early renewal. Want to discuss?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 1272, channel: "EMAIL", tone: "urgent",
        subject: "7 days until expiry — {{serviceName}}",
        messageTemplate: "{{name}}, only 7 days left on your {{serviceName}} contract. Please confirm your renewal to avoid any service disruption.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 1440, channel: "EMAIL", tone: "urgent",
        subject: "URGENT: Contract expires today — {{serviceName}}",
        messageTemplate: "{{name}}, your {{serviceName}} contract expires today. Immediate action is needed to avoid service interruption. Please respond now.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "CONTRACT_RENEWAL",
    variantId: "renewal-aggressive",
    variantName: "Aggressive",
    variantDescription: "Urgent 4-step sequence in the final 2 weeks before expiry",
    name: "Contract Renewal (Last Minute)",
    description: "Urgent renewal push for contracts expiring within 2 weeks",
    icon: "refresh-cw",
    color: "#10B981",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Renewal confirmed or new contract signed",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "urgent",
        subject: "ACTION REQUIRED: {{serviceName}} expires in 14 days",
        messageTemplate: "{{name}}, your {{serviceName}} contract expires in 14 days. Renew now to keep your current rate and avoid service interruption.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 72, channel: "WHATSAPP", tone: "urgent",
        messageTemplate: "{{name}}, your {{serviceName}} contract expires in 11 days. We're offering a 10% early renewal discount. Want to lock it in?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 168, channel: "EMAIL", tone: "urgent",
        subject: "FINAL WEEK: {{serviceName}} contract ending",
        messageTemplate: "{{name}}, this is your final week on the current {{serviceName}} contract. After expiry, re-activation may take 5-7 business days. Please renew now.",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 312, channel: "WHATSAPP", tone: "urgent",
        messageTemplate: "{{name}}, your {{serviceName}} contract expires TOMORROW. Please respond immediately to avoid service disruption. I can process renewal right now.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── FEEDBACK REQUEST ─────────────────
  {
    type: "FEEDBACK_REQUEST",
    variantId: "feedback-standard",
    variantName: "Standard",
    variantDescription: "Light 3-step sequence over 8 days",
    name: "Feedback / Review Request",
    description: "Request reviews and feedback after service delivery",
    icon: "star",
    color: "#FBBF24",
    channels: ["WHATSAPP", "EMAIL"],
    successCondition: "Review submitted or feedback form completed",
    steps: [
      {
        stepNumber: 1, delayHours: 24, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Hi {{name}}, hope everything went well! Would you mind leaving us a quick review? It takes just 30 seconds: {{reviewLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 96, channel: "EMAIL", tone: "friendly",
        subject: "Your feedback means a lot to us",
        messageTemplate: "{{name}}, your feedback means a lot to us and helps us improve. Just 30 seconds of your time: {{reviewLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 192, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Last gentle ask, {{name}} — if you have a moment, we'd really appreciate your feedback: {{reviewLink}}. Thanks either way!",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "FEEDBACK_REQUEST",
    variantId: "feedback-aggressive",
    variantName: "Aggressive",
    variantDescription: "Incentivized 4-step sequence over 3 days",
    name: "Feedback Request (Incentivized)",
    description: "Fast feedback collection with incentives and multi-channel push",
    icon: "star",
    color: "#FBBF24",
    channels: ["WHATSAPP", "EMAIL", "SMS"],
    successCondition: "Review submitted or feedback form completed",
    steps: [
      {
        stepNumber: 1, delayHours: 2, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, how was your experience? Leave a 30-second review and get {{incentive}}: {{reviewLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 24, channel: "EMAIL", tone: "friendly",
        subject: "Earn {{incentive}} — share your feedback",
        messageTemplate: "{{name}}, we'd love your honest feedback. As a thank you, you'll receive {{incentive}} when you complete this 30-second review: {{reviewLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 48, channel: "SMS", tone: "friendly",
        messageTemplate: "{{name}}, last chance to earn {{incentive}}! Leave a quick review: {{reviewLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 72, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, your {{incentive}} offer expires today! Quick 30-second review here: {{reviewLink}}. We really value your opinion.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── RE-ENGAGEMENT ─────────────────
  {
    type: "RE_ENGAGEMENT",
    variantId: "reengagement-standard",
    variantName: "Standard",
    variantDescription: "Warm 3-step sequence over 12 days",
    name: "Re-engagement (Cold Leads)",
    description: "Re-engage dormant leads with fresh value and insights",
    icon: "snowflake",
    color: "#64748B",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Reply received or meeting booked",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "It's been a while — something new for {{company}}",
        messageTemplate: "{{name}}, it's been a while since we spoke. Thought I'd share something relevant to {{company}}: {{insight}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 120, channel: "EMAIL", tone: "professional",
        subject: "New update you might find interesting",
        messageTemplate: "{{name}}, we just launched something new that could be relevant to {{company}}. Here's a quick overview: {{updateLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 288, channel: "WHATSAPP", tone: "professional",
        messageTemplate: "Closing the loop, {{name}} — should I remove you from our list or is there still interest in exploring how we can help {{company}}?",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "RE_ENGAGEMENT",
    variantId: "reengagement-aggressive",
    variantName: "Aggressive",
    variantDescription: "Bold 4-step win-back over 5 days",
    name: "Re-engagement (Win Back)",
    description: "Aggressive win-back campaign with exclusive offers and urgency",
    icon: "snowflake",
    color: "#64748B",
    channels: ["EMAIL", "WHATSAPP", "SMS"],
    successCondition: "Reply received or meeting booked",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "{{name}}, we miss you at {{company}}",
        messageTemplate: "{{name}}, it's been a while! We've made some big improvements since we last talked. Here's an exclusive offer to come back: {{offerDetails}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 24, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, did you see the exclusive comeback offer we sent? It expires in 72 hours. Want me to walk you through what's new?",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 72, channel: "SMS", tone: "urgent",
        messageTemplate: "{{name}}, your exclusive offer expires today. Don't miss out: {{offerLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 120, channel: "EMAIL", tone: "professional",
        subject: "Last chance — exclusive offer for {{company}}",
        messageTemplate: "{{name}}, this is the final reminder about your exclusive offer. After today, we'll remove you from our active outreach list. If you'd like to reconnect, just reply to this email.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },

  // ───────────────── EVENT REGISTRATION ─────────────────
  {
    type: "EVENT_REGISTRATION",
    variantId: "event-standard",
    variantName: "Standard",
    variantDescription: "Engaging 3-step sequence over 1 week",
    name: "Event / Webinar Registration",
    description: "Drive event registrations with timely reminders and urgency",
    icon: "ticket",
    color: "#EF4444",
    channels: ["EMAIL", "WHATSAPP"],
    successCondition: "Registration confirmed",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "You're invited: {{eventName}} on {{eventDate}}",
        messageTemplate: "{{name}}, we're hosting {{eventName}} on {{eventDate}}. It's going to be packed with insights. Save your spot: {{registrationLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 72, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "Only {{spotsLeft}} spots left for {{eventName}}, {{name}}. Don't miss it! Register here: {{registrationLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 168, channel: "EMAIL", tone: "friendly",
        subject: "Tomorrow: {{eventName}} — don't forget!",
        messageTemplate: "Reminder: {{eventName}} is tomorrow, {{name}}! Here's your joining link: {{joiningLink}}. See you there!",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
  {
    type: "EVENT_REGISTRATION",
    variantId: "event-aggressive",
    variantName: "Aggressive",
    variantDescription: "High-urgency 5-step FOMO-driven sequence over 3 days",
    name: "Event Registration (FOMO)",
    description: "Scarcity-driven event registration with countdown and social proof",
    icon: "ticket",
    color: "#EF4444",
    channels: ["EMAIL", "WHATSAPP", "SMS"],
    successCondition: "Registration confirmed",
    steps: [
      {
        stepNumber: 1, delayHours: 0, channel: "EMAIL", tone: "friendly",
        subject: "{{name}}, exclusive invite: {{eventName}}",
        messageTemplate: "{{name}}, you're on the shortlist for {{eventName}} on {{eventDate}}. Only {{spotsLeft}} spots available. Register now: {{registrationLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 2, delayHours: 8, channel: "WHATSAPP", tone: "friendly",
        messageTemplate: "{{name}}, {{registeredCount}} people already registered for {{eventName}}. Spots are filling fast. Grab yours: {{registrationLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 3, delayHours: 24, channel: "SMS", tone: "urgent",
        messageTemplate: "{{name}}, only {{spotsLeft}} spots left for {{eventName}}! Register NOW: {{registrationLink}}",
        aiEnhance: false, stopIfReplied: true,
      },
      {
        stepNumber: 4, delayHours: 48, channel: "EMAIL", tone: "urgent",
        subject: "ALMOST FULL: {{eventName}} — last few spots",
        messageTemplate: "{{name}}, {{eventName}} is almost full. We saved you a spot but can only hold it for 24 more hours. Confirm here: {{registrationLink}}",
        aiEnhance: true, stopIfReplied: true,
      },
      {
        stepNumber: 5, delayHours: 72, channel: "WHATSAPP", tone: "urgent",
        messageTemplate: "Last call, {{name}}! {{eventName}} starts soon and your reserved spot expires today. Register: {{registrationLink}} or it goes to the waitlist.",
        aiEnhance: true, stopIfReplied: true,
      },
    ],
  },
]

/** Group templates by type for the template picker UI */
export function getTemplatesByType(): Record<string, UseCaseTemplate[]> {
  const grouped: Record<string, UseCaseTemplate[]> = {}
  for (const template of USE_CASE_TEMPLATES) {
    const existing = grouped[template.type] ?? []
    grouped[template.type] = [...existing, template]
  }
  return grouped
}

/** Get unique use case type metadata (icon, color, name) for the type grid */
export function getUseCaseTypeMeta(): Array<{
  type: string
  name: string
  description: string
  icon: string
  color: string
}> {
  const seen = new Set<string>()
  const result: Array<{ type: string; name: string; description: string; icon: string; color: string }> = []

  for (const template of USE_CASE_TEMPLATES) {
    if (!seen.has(template.type)) {
      seen.add(template.type)
      result.push({
        type: template.type,
        name: template.name.replace(/ \(.*\)$/, ""),
        description: template.description,
        icon: template.icon,
        color: template.color,
      })
    }
  }
  return result
}
