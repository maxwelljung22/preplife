import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const CLUBS = [
  { name: "Model United Nations", slug: "model-un", emoji: "🌐", tagline: "Debate. Diplomacy. Impact.", description: "Represent nations at simulated UN conferences. Compete at Harvard HMUN, UPenn PMUNC, and regional circuits.", category: "HUMANITIES", commitment: "HIGH", gradientFrom: "#1a3a6e", gradientTo: "#0c2a52", meetingDay: "Tuesday & Thursday", meetingTime: "3:15 PM", meetingRoom: "Room 214", tags: ["competitive", "travel", "debate"], requiresApp: false },
  { name: "Robotics Club", slug: "robotics", emoji: "🤖", tagline: "Build. Code. Compete.", description: "FIRST Robotics Competition team. Design, build, and program robots to compete in regional and national championships.", category: "STEM", commitment: "HIGH", gradientFrom: "#1a1a2e", gradientTo: "#0d0d1a", meetingDay: "Monday & Wednesday", meetingTime: "3:15 PM", meetingRoom: "Engineering Lab", tags: ["engineering", "coding", "competitive"], requiresApp: false },
  { name: "Investment Club", slug: "investment-club", emoji: "📈", tagline: "Real portfolios. Real markets.", description: "Manage a paper portfolio, analyze equities, and hear from Wall Street alumni. Weekly stock pitches and DCF modeling workshops.", category: "BUSINESS", commitment: "MEDIUM", gradientFrom: "#0a3d2e", gradientTo: "#071f17", meetingDay: "Thursday", meetingTime: "3:15 PM", meetingRoom: "Room 302", tags: ["finance", "investing"], requiresApp: false },
  { name: "Hawk Literary Review", slug: "literary-review", emoji: "📖", tagline: "Stories worth telling.", description: "St. Joe's premier student literary publication. Submit poetry, prose, essays, and visual art. Published bi-annually.", category: "ARTS", commitment: "MEDIUM", gradientFrom: "#5c1010", gradientTo: "#3d0808", meetingDay: "Wednesday", meetingTime: "3:30 PM", meetingRoom: "Library", tags: ["writing", "creative", "publication"], requiresApp: false },
  { name: "National Honor Society", slug: "nhs", emoji: "🎓", tagline: "Scholarship. Leadership. Service.", description: "Recognizing academic excellence. Juniors and seniors with 3.5+ GPA coordinate service projects across Philadelphia.", category: "SERVICE", commitment: "LOW", gradientFrom: "#6a1c1c", gradientTo: "#3d0f0f", meetingDay: "Monthly", meetingTime: "7:00 AM", meetingRoom: "Chapel", tags: ["service", "honor", "leadership"], requiresApp: false },
  { name: "Prep Debate Team", slug: "debate-team", emoji: "🎤", tagline: "Argue better. Think faster.", description: "Competitive policy, LD, and public forum debate. State semifinalists 2023–24. Daily practice, weekend tournaments.", category: "HUMANITIES", commitment: "HIGH", gradientFrom: "#2d1b6e", gradientTo: "#1a0a4a", meetingDay: "Mon/Wed/Fri", meetingTime: "3:30 PM", meetingRoom: "Room 115", tags: ["competitive", "speaking", "travel"], requiresApp: false },
  { name: "Environmental Action", slug: "environmental", emoji: "🌿", tagline: "Philadelphia starts here.", description: "Lead sustainability initiatives on campus and in the city. Partner with Philadelphia Parks & Recreation.", category: "SERVICE", commitment: "LOW", gradientFrom: "#1b4332", gradientTo: "#0a2218", meetingDay: "Tuesday", meetingTime: "3:30 PM", meetingRoom: "Room 208", tags: ["service", "activism"], requiresApp: false },
  { name: "Jazz Ensemble", slug: "jazz", emoji: "🎷", tagline: "Swing. Standards. Originals.", description: "Selective jazz band performing standards, fusion, and originals. Spring concert + competition circuit. Audition required.", category: "ARTS", commitment: "MEDIUM", gradientFrom: "#3d2b00", gradientTo: "#1f1600", meetingDay: "Thursday", meetingTime: "3:15 PM", meetingRoom: "Music Hall", tags: ["music", "performance"], requiresApp: true },
];

const CHANGELOG = [
  { type: "FEATURE", title: "NHS Hours Integration — Live Airtable Sync", content: "<p>NHS hours now pulled <strong>directly from Airtable in real-time</strong>. Juniors and seniors see their total hours, required hours, and status on their dashboard.</p><ul><li>Progress bar with on-track / behind / complete status</li><li>Breakdown by activity</li><li>Admins can view all student NHS data</li></ul>", isFeatured: true },
  { type: "FEATURE", title: "Club Workspace — 6-Tab System", content: "<p>Every club now has a full workspace: Overview, Announcements, Events, Members, Resources, and Applications.</p>", isFeatured: false },
  { type: "IMPROVEMENT", title: "Dark Mode — Full Theme System", content: "<p>Full dark/light theming with persistent preference. Every component responds cleanly to both themes.</p>", isFeatured: false },
  { type: "FEATURE", title: "Application System — Form Builder", content: "<p>Admins and club leaders can build <strong>custom application forms</strong> for competitive clubs. Full submission tracking and review notes.</p>", isFeatured: false },
  { type: "BUG_FIX", title: "Membership state sync fixed", content: "<p>Resolved an issue where Join/Joined button state would not reflect correctly after navigating between pages.</p>", isFeatured: false },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Seed clubs
  for (const club of CLUBS) {
    await prisma.club.upsert({
      where:  { slug: club.slug },
      update: {},
      create: {
        ...(club as any),
        isActive: true,
      },
    });
    console.log(`  ✓ ${club.emoji} ${club.name}`);
  }

  // Seed changelog
  for (const entry of CHANGELOG) {
    await prisma.changelogEntry.create({
      data: {
        type:       entry.type as any,
        title:      entry.title,
        content:    entry.content,
        isFeatured: entry.isFeatured,
        isPublished: true,
      },
    });
    console.log(`  ✓ Changelog: ${entry.title}`);
  }

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
