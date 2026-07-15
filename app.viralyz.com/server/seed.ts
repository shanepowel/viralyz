import { db } from "./db";
import { users, content, tribes, courses, courseModules, courseLessons } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const [user1, user2, user3, user4] = await db.insert(users).values([
    {
      id: "user-nova",
      email: "nova@prism.io",
      firstName: "Nova",
      lastName: "Lee",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nova",
    },
    {
      id: "user-kai",
      email: "kai@prism.io",
      firstName: "Kai",
      lastName: "Tanaka",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai",
    },
    {
      id: "user-aria",
      email: "aria@prism.io",
      firstName: "Aria",
      lastName: "Nexus",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    },
    {
      id: "user-zara",
      email: "zara@prism.io",
      firstName: "Zara",
      lastName: "Quinn",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
    },
  ]).returning();

  console.log("✓ Created users");

  await db.insert(content).values([
    {
      userId: user1.id,
      type: "clip",
      title: "Neon Dreams",
      description: "Exploring the cyberpunk aesthetic through motion",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
      aspectRatio: "9:16",
      duration: 15,
      likes: 2400,
      views: 12500,
    },
    {
      userId: user2.id,
      type: "clip",
      title: "Future City Vibes",
      description: "Late night in Neo Tokyo",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400",
      aspectRatio: "9:16",
      duration: 22,
      likes: 1800,
      views: 9200,
    },
    {
      userId: user4.id,
      type: "clip",
      title: "Digital Art Process",
      description: "Watch me create holographic art",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      aspectRatio: "9:16",
      duration: 30,
      likes: 3200,
      views: 15600,
    },
    {
      userId: user2.id,
      type: "film",
      title: "Echoes of Tomorrow",
      description: "A sci-fi short exploring consciousness transfer in a post-singularity world",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      aspectRatio: "16:9",
      duration: 1200,
      likes: 8900,
      views: 45000,
    },
    {
      userId: user1.id,
      type: "film",
      title: "Chromatic Memories",
      description: "Visual poetry about digital existence",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800",
      aspectRatio: "16:9",
      duration: 900,
      likes: 6500,
      views: 32000,
    },
    {
      userId: user1.id,
      type: "flash",
      title: "Studio Setup",
      description: "",
      src: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600",
      aspectRatio: "9:16",
      duration: null,
      likes: 450,
      views: 2100,
    },
    {
      userId: user3.id,
      type: "flash",
      title: "Behind the Scenes",
      description: "",
      src: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600",
      aspectRatio: "9:16",
      duration: null,
      likes: 320,
      views: 1800,
    },
    {
      userId: user4.id,
      type: "still",
      title: "Neon Nights",
      description: "Digital photography series #1",
      src: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
      thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
      aspectRatio: "4:5",
      duration: null,
      likes: 1200,
      views: 5400,
    },
  ]);

  console.log("✓ Created content");

  const [tribe1, tribe2, tribe3] = await db.insert(tribes).values([
    {
      slug: "cyberpunk-aesthetics",
      name: "Cyberpunk Aesthetics",
      description: "For lovers of neon, dystopia, and high-tech low-life vibes",
      icon: "🌃",
      banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
      members: 24500,
    },
    {
      slug: "indie-filmmakers",
      name: "Indie Filmmakers",
      description: "Share your films, get feedback, collaborate on projects",
      icon: "🎬",
      banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200",
      members: 18200,
    },
    {
      slug: "creative-tech",
      name: "Creative Tech",
      description: "Where art meets technology - AI, VR, generative art & more",
      icon: "⚡",
      banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
      members: 32100,
    },
  ]).returning();

  console.log("✓ Created tribes");

  const [course1, course2] = await db.insert(courses).values([
    {
      title: "Digital Filmmaking Fundamentals",
      description: "Learn the complete workflow from pre-production to final export",
      instructorId: user3.id,
      thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600",
      level: "Beginner",
      duration: 480,
    },
    {
      title: "Advanced Motion Graphics",
      description: "Master After Effects and create stunning animated visuals",
      instructorId: user3.id,
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
      level: "Advanced",
      duration: 720,
    },
  ]).returning();

  const [module1] = await db.insert(courseModules).values([
    {
      courseId: course1.id,
      title: "Introduction to Digital Filmmaking",
      order: 1,
    },
    {
      courseId: course1.id,
      title: "Camera & Lighting Basics",
      order: 2,
    },
    {
      courseId: course2.id,
      title: "Motion Principles",
      order: 1,
    },
  ]).returning();

  await db.insert(courseLessons).values([
    {
      moduleId: module1.id,
      title: "Welcome & Course Overview",
      duration: 300,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      order: 1,
    },
    {
      moduleId: module1.id,
      title: "The Filmmaker's Toolkit",
      duration: 480,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      order: 2,
    },
  ]);

  console.log("✓ Created courses");
  console.log("🎉 Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
