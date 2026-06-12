// packages/database/seed/index.ts
// Demo credentials: demo@scribbleforms.dev / Demo@1234
import "dotenv/config";
import { createHmac, randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import db from "../index";
import {
  usersTable, formsTable, formVersionsTable, fieldsTable,
  responsesTable, responseAnswersTable,
  analyticsDailyTable, themesTable,
} from "../schema";
import { sql } from "drizzle-orm";

function hashPassword(password: string, salt: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 60);
}

function randDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d;
}

const SYSTEM_THEMES = [
  {
    name: "Anime Dreams", slug: "anime-dreams", category: "anime",
    colors: ["#FF6B9D", "#C084FC", "#818CF8"],
    tokensJson: {
      "--sf-bg":     "#0F0A1E",
      "--sf-surface":"#1A1035",
      "--sf-primary":"#FF6B9D",
      "--sf-text":   "#F0E6FF",
      "--sf-accent": "#C084FC",
      "--sf-radius": "1rem",
    },
  },
  {
    name: "Cyber Punk", slug: "cyber-punk", category: "gaming",
    colors: ["#00FFFF", "#FF00FF", "#FFFF00"],
    tokensJson: {
      "--sf-bg":     "#000000",
      "--sf-surface":"#0D0D0D",
      "--sf-primary":"#00FFFF",
      "--sf-text":   "#E0E0E0",
      "--sf-accent": "#FF00FF",
      "--sf-radius": "0",
    },
  },
  {
    name: "Nature Walk", slug: "nature-walk", category: "minimal",
    colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
    tokensJson: {
      "--sf-bg":     "#F1F8E9",
      "--sf-surface":"#FFFFFF",
      "--sf-primary":"#388E3C",
      "--sf-text":   "#1B5E20",
      "--sf-accent": "#8BC34A",
      "--sf-radius": "0.5rem",
    },
  },
  {
    name: "Sticky Notes", slug: "sticky-notes", category: "fun",
    colors: ["#FFEB3B", "#FF9800", "#F44336"],
    tokensJson: {
      "--sf-bg":     "#FFF9C4",
      "--sf-surface":"#FFFFFF",
      "--sf-primary":"#F57F17",
      "--sf-text":   "#212121",
      "--sf-accent": "#FF6F00",
      "--sf-radius": "0.25rem",
    },
  },
  {
    name: "Ocean Breeze", slug: "ocean-breeze", category: "minimal",
    colors: ["#0288D1", "#0097A7", "#00BCD4"],
    tokensJson: {
      "--sf-bg":     "#E0F7FA",
      "--sf-surface":"#FFFFFF",
      "--sf-primary":"#0288D1",
      "--sf-text":   "#01579B",
      "--sf-accent": "#00BCD4",
      "--sf-radius": "0.75rem",
    },
  },
];

const DEMO_FORMS: Array<{
  title: string;
  description: string;
  visibility: "public" | "unlisted";
  themeSlug: string;
  password?: string;
  fields: Array<{ type: string; label: string; required: boolean; order: number; config?: any }>;
}> = [
  {
    title: "Anime Fan Survey 🎌",
    description: "Tell us about your favourite anime series and characters!",
    visibility: "public" as const,
    themeSlug: "anime-dreams",
    fields: [
      { type: "short_text", label: "Your favourite anime series", required: true, order: 0 },
      { type: "single_select", label: "Which genre do you prefer?", required: true, order: 1,
        config: { options: ["Shonen", "Shojo", "Isekai", "Mecha", "Slice of Life", "Horror"] } },
      { type: "rating", label: "How would you rate anime overall?", required: true, order: 2,
        config: { max: 5 } },
      { type: "multi_select", label: "Platforms you watch on", required: false, order: 3,
        config: { options: ["Crunchyroll", "Netflix", "Disney+", "HiDive", "YouTube"] } },
      { type: "long_text", label: "What makes a great anime?", required: false, order: 4 },
      { type: "email", label: "Email for our anime newsletter", required: false, order: 5 },
    ],
  },
  {
    title: "Gaming Tournament Sign-up 🎮",
    description: "Register for the ScribbleForms Gaming Cup 2025",
    visibility: "public" as const,
    themeSlug: "cyber-punk",
    fields: [
      { type: "short_text",   label: "Gamer tag / Username",       required: true, order: 0 },
      { type: "email",        label: "Contact email",               required: true, order: 1 },
      { type: "single_select", label: "Platform",                  required: true, order: 2,
        config: { options: ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch", "Mobile"] } },
      { type: "single_select", label: "Preferred game",            required: true, order: 3,
        config: { options: ["Valorant", "Fortnite", "League of Legends", "CS2", "Apex Legends", "Other"] } },
      { type: "number",       label: "Hours played per week",       required: false, order: 4 },
      { type: "checkbox",     label: "I agree to the tournament rules", required: true, order: 5 },
    ],
  },
  {
    title: "Startup Onboarding 🚀",
    description: "Help us understand your startup and what you need",
    visibility: "public" as const,
    themeSlug: "ocean-breeze",
    fields: [
      { type: "short_text",   label: "Startup / Company name",       required: true,  order: 0 },
      { type: "email",        label: "Founder email",                required: true,  order: 1 },
      { type: "single_select", label: "Stage",                       required: true,  order: 2,
        config: { options: ["Idea", "MVP", "Pre-Seed", "Seed", "Series A+"] } },
      { type: "multi_select", label: "What do you need most?",       required: false, order: 3,
        config: { options: ["Funding", "Mentorship", "Talent", "Customers", "Tech infrastructure"] } },
      { type: "number",       label: "Team size",                    required: false, order: 4 },
      { type: "long_text",    label: "Describe your product in 2 sentences", required: true, order: 5 },
      { type: "single_select", label: "How did you hear about us?",  required: false, order: 6,
        config: { options: ["Twitter/X", "LinkedIn", "Friend", "Google", "ProductHunt", "Other"] } },
    ],
  },
  {
    title: "Dev Tools Feedback 🛠️",
    description: "What developer tools do you love or hate?",
    visibility: "public" as const,
    themeSlug: "sticky-notes",
    fields: [
      { type: "short_text",   label: "Your primary programming language", required: true, order: 0 },
      { type: "multi_select", label: "Frameworks you use",               required: false, order: 1,
        config: { options: ["React", "Vue", "Next.js", "Express", "FastAPI", "Django", "Rails", "Spring"] } },
      { type: "rating",       label: "How satisfied are you with your tooling?", required: true, order: 2,
        config: { max: 10 } },
      { type: "long_text",    label: "What tool would you build if you had a month?", required: false, order: 3 },
      { type: "single_select", label: "Preferred editor",              required: false, order: 4,
        config: { options: ["VS Code", "Neovim", "JetBrains IDE", "Emacs", "Other"] } },
      { type: "email",        label: "Email for early access updates",   required: false, order: 5 },
    ],
  },
  {
    title: "Solar Vibes Music Poll ☀️",
    description: "An unlisted form for our community members — share via direct link",
    visibility: "unlisted" as const,
    themeSlug: "nature-walk",
    fields: [
      { type: "short_text",   label: "Your favourite artist right now", required: true, order: 0 },
      { type: "single_select", label: "Top genre",                     required: true, order: 1,
        config: { options: ["Hip-Hop", "Pop", "R&B", "Electronic", "Rock", "Jazz", "Classical", "Other"] } },
      { type: "rating",       label: "Rate your current mood in music (1-5)", required: false, order: 2,
        config: { max: 5 } },
      { type: "long_text",    label: "Recommend a song and why",        required: false, order: 3 },
    ],
  },
  {
    title: "VIP Creator Application 🔐",
    description: "Password-protected form — password is: hackathon2025",
    visibility: "unlisted" as const,
    themeSlug: "cyber-punk",
    password: "hackathon2025",
    fields: [
      { type: "short_text",   label: "Full name",               required: true,  order: 0 },
      { type: "email",        label: "Business email",          required: true,  order: 1 },
      { type: "single_select", label: "Your role",              required: true,  order: 2,
        config: { options: ["Founder", "Engineer", "Designer", "Product", "Marketing", "Other"] } },
      { type: "long_text",    label: "Why do you want VIP access?", required: true, order: 3 },
      { type: "number",       label: "Team size",               required: false, order: 4 },
      { type: "checkbox",     label: "I agree to the NDA terms", required: true, order: 5 },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  // 1 — Themes
  console.log("  Seeding themes...");
  for (const t of SYSTEM_THEMES) {
    await db.insert(themesTable).values({
      ...t,
      isSystem: true,
      isActive: true,
      colors:   t.colors,
      tokensJson: t.tokensJson,
    }).onConflictDoNothing();
  }

  // 2 — Demo user
  const salt     = randomBytes(16).toString("hex");
  const password = hashPassword("Demo@1234", salt);
  const [user]   = await db
    .insert(usersTable)
    .values({
      email:         "demo@scribbleforms.dev",
      fullName:      "Demo Creator",
      password,
      salt,
      plan:          "studio",
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning({ id: usersTable.id });

  // If user already exists, fetch it
  const demoUser = user ?? (await db.query.usersTable.findFirst({
    where: (t, { eq }) => eq(t.email, "demo@scribbleforms.dev"),
  }));

  if (!demoUser) throw new Error("Could not create demo user");
  console.log(`  Demo user: ${demoUser.id}`);

  // Get theme map
  const themes = await db.select().from(themesTable);
  const themeMap = new Map(themes.map((t) => [t.slug, t.id]));

  // 3 — Forms + fields + responses
  for (const formDef of DEMO_FORMS) {
    const formSlug = slug(formDef.title) + "-" + randomBytes(3).toString("hex");
    const themeId  = themeMap.get(formDef.themeSlug);

    const [form] = await db
      .insert(formsTable)
      .values({
        userId:         demoUser.id,
        title:          formDef.title,
        description:    formDef.description,
        slug:           formSlug,
        visibility:     formDef.visibility,
        themeId,
        status:         "published",
        publishedAt:    new Date(),
        totalResponses: 0,
        totalViews:     0,
        // bcrypt hash for password-protected forms
        passwordHash:   formDef.password ? hashSync(formDef.password, 10) : null,
      })
      .returning();

    console.log(`  Created form: ${form!.title}`);

    // Insert fields
    const insertedFields: any[] = [];
    for (const f of formDef.fields) {
      const [field] = await db
        .insert(fieldsTable)
        .values({ formId: form!.id, ...f } as any)
        .returning();
      insertedFields.push(field);
    }

    // Create version snapshot
    const [version] = await db
      .insert(formVersionsTable)
      .values({
        formId:      form!.id,
        version:     1,
        fieldsJson:  insertedFields,
        publishedBy: demoUser.id,
      })
      .returning();

    // Update form with version
    await db
      .update(formsTable)
      .set({ currentVersionId: version!.id })
      .where(sql`id = ${form!.id}`);

    // 4 — Generate responses (200–400 per form)
    const responseCount = 200 + Math.floor(Math.random() * 200);
    console.log(`    Seeding ${responseCount} responses...`);

    for (let i = 0; i < responseCount; i++) {
      const [response] = await db
        .insert(responsesTable)
        .values({
          formId:           form!.id,
          formVersionId:    version!.id,
          ipHash:           randomBytes(32).toString("hex"),
          isComplete:       true,
          timeToCompleteMs: 30_000 + Math.floor(Math.random() * 120_000),
          createdAt:        randDate(30),
        })
        .returning({ id: responsesTable.id });

      // Insert sample answers
      for (const field of insertedFields) {
        if (field.type === "divider" || field.type === "section_title") continue;

        let valueText:   string | null = null;
        let valueNumber: string | null = null;
        let valueArray:  unknown[]  | null = null;

        switch (field.type) {
          case "short_text":
            valueText = ["Alice Johnson", "Bob Smith", "Carol White", "Dan Brown", "Eve Davis"][i % 5]!;
            break;
          case "email":
            valueText = `user${i}@example.com`;
            break;
          case "long_text":
            valueText = "This is sample feedback text for the seeded response.";
            break;
          case "number":
            valueNumber = String(1 + Math.floor(Math.random() * 100));
            break;
          case "rating":
            valueNumber = String(1 + Math.floor(Math.random() * (field.config?.max ?? 5)));
            break;
          case "checkbox":
            valueText = Math.random() > 0.3 ? "true" : "false";
            break;
          case "single_select": {
            const opts = (field.config?.options ?? []) as string[];
            valueText  = opts[Math.floor(Math.random() * opts.length)] ?? "Option A";
            break;
          }
          case "multi_select": {
            const opts  = (field.config?.options ?? []) as string[];
            const picks = opts.slice(0, 1 + Math.floor(Math.random() * Math.min(3, opts.length)));
            valueArray  = picks;
            break;
          }
          case "date":
            valueText = randDate(365).toISOString().split("T")[0]!;
            break;
        }

        await db.insert(responseAnswersTable).values({
          responseId: response!.id,
          fieldId:    field.id,
          fieldType:  field.type,
          valueText,
          valueNumber,
          valueArray,
        } as any);
      }
    }

    // Update total counter
    await db
      .update(formsTable)
      .set({ totalResponses: responseCount, totalViews: responseCount + Math.floor(Math.random() * 500) })
      .where(sql`id = ${form!.id}`);

    // 5 — Daily analytics for past 30 days
    const today = new Date();
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0]!;

      const views   = 5 + Math.floor(Math.random() * 60);
      const starts  = Math.floor(views * (0.5 + Math.random() * 0.3));
      const comps   = Math.floor(starts * (0.4 + Math.random() * 0.4));
      const abandons = starts - comps;

      await db
        .insert(analyticsDailyTable)
        .values({
          formId:      form!.id,
          date:        dateStr,
          views,
          starts,
          completions: comps,
          abandons:    Math.max(0, abandons),
          avgTimeMs:   60_000 + Math.floor(Math.random() * 60_000),
        })
        .onConflictDoNothing();
    }
  }

  console.log("\n✅ Seed complete!");
  console.log("   Demo credentials: demo@scribbleforms.dev / Demo@1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
