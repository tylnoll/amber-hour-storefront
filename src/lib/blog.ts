import fs from "node:fs/promises";
import path from "node:path";
import { getDataDir } from "@/lib/data-path";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  content: string[];
  createdAt: string;
  updatedAt?: string;
};

type BlogData = {
  posts: BlogPost[];
};

type RawBlogPost = Partial<BlogPost> & { date?: string };

const blogDataPath = path.join(getDataDir(), "blog-posts.json");

const seedPosts: BlogPost[] = [
  {
    slug: "banana-banshee-seed-sprouted-update",
    title: "Grow Update: Banana Banshee Seed Has Sprouted",
    excerpt: "Quick greenhouse update: the Banana Banshee seed has sprouted and we are watching early growth.",
    readingTime: "2 min read",
    content: [
      "Good news from the grow room: the Banana Banshee seed has officially sprouted.",
      "Right now we are monitoring root strength, leaf development, and stability over the next few days.",
      "If this run stays healthy, it will be considered for a future small-batch release.",
    ],
    createdAt: "2026-07-13T12:00:00.000Z",
  },
  {
    slug: "how-to-build-an-evening-ritual",
    title: "How To Build An Evening Ritual That Actually Sticks",
    excerpt: "Small sequence, same cue, low effort. Here is the framework we use in-house.",
    readingTime: "4 min read",
    content: [
      "Most routines fail because they ask too much too fast. Evening rituals work when they are sensory and repeatable.",
      "Pick one anchor hour first. Tea at 7pm. Keep it there for two weeks. Then stack the next step.",
      "You are not chasing perfection. You are building a signal your body can trust.",
    ],
    createdAt: "2026-06-30T12:00:00.000Z",
  },
  {
    slug: "what-a-coa-means",
    title: "What A COA Means, In Plain Language",
    excerpt: "A quick guide to batch numbers, THC percentages, and why third-party reports matter.",
    readingTime: "3 min read",
    content: [
      "A COA is a Certificate of Analysis issued by an independent lab. It verifies cannabinoid content and safety screening.",
      "Match the batch number on your product to the batch in our lab report library.",
      "If you ever have questions about a report, send us the batch number and we will walk through it with you.",
    ],
    createdAt: "2026-06-22T12:00:00.000Z",
  },
  {
    slug: "why-low-melt-wax",
    title: "Why We Formulate With Low-Melt Wax",
    excerpt: "Comfort is chemistry. Here is why our two-way candle melts differently.",
    readingTime: "5 min read",
    content: [
      "Our candle blend is tuned to melt just above body temperature. That allows a smooth spread without a greasy finish.",
      "We keep fragrance load restrained so scent supports the room instead of taking over it.",
      "The point is transition: light, breathe, then use the warm oil to close the loop.",
    ],
    createdAt: "2026-06-10T12:00:00.000Z",
  },
];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureBlogDataFile() {
  try {
    await fs.access(blogDataPath);
  } catch {
    await fs.mkdir(path.dirname(blogDataPath), { recursive: true });
    const initial: BlogData = { posts: seedPosts };
    await fs.writeFile(blogDataPath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readBlogData() {
  await ensureBlogDataFile();
  const raw = await fs.readFile(blogDataPath, "utf8");
  const parsed = JSON.parse(raw) as BlogData;
  if (!Array.isArray(parsed.posts)) return { posts: [] };

  const normalizedPosts = (parsed.posts as RawBlogPost[])
    .map((post) => {
      const slug = typeof post.slug === "string" ? normalizeSlug(post.slug) : "";
      const title = typeof post.title === "string" ? post.title.trim() : "";
      const excerpt = typeof post.excerpt === "string" ? post.excerpt.trim() : "";
      const content = Array.isArray(post.content)
        ? post.content.map((line) => String(line).trim()).filter(Boolean)
        : [];

      if (!slug || !title || !excerpt || content.length === 0) {
        return null;
      }

      const readingTime =
        typeof post.readingTime === "string" && post.readingTime.trim()
          ? post.readingTime.trim()
          : estimateReadingTime(content);

      const rawCreated =
        typeof post.createdAt === "string" && post.createdAt.trim()
          ? post.createdAt
          : typeof post.date === "string" && post.date.trim()
            ? `${post.date.trim()}T12:00:00.000Z`
            : new Date().toISOString();

      const createdDate = new Date(rawCreated);
      const createdAt = Number.isNaN(createdDate.getTime())
        ? new Date().toISOString()
        : createdDate.toISOString();

      let updatedAt: string | undefined;
      if (typeof post.updatedAt === "string" && post.updatedAt.trim()) {
        const updatedDate = new Date(post.updatedAt);
        if (!Number.isNaN(updatedDate.getTime())) {
          updatedAt = updatedDate.toISOString();
        }
      }

      return {
        slug,
        title,
        excerpt,
        readingTime,
        content,
        createdAt,
        updatedAt,
      } as BlogPost;
    })
    .filter((post): post is BlogPost => Boolean(post));

  return { posts: normalizedPosts };
}

async function writeBlogData(data: BlogData) {
  await ensureBlogDataFile();
  await fs.writeFile(blogDataPath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

function estimateReadingTime(content: string[]) {
  const words = content.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export async function getBlogPosts() {
  const data = await readBlogData();
  return data.posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBlogDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toISOString().slice(0, 10);
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function createBlogPost(input: {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  readingTime?: string;
}) {
  const data = await readBlogData();
  const slug = normalizeSlug(input.slug || input.title);
  if (!slug) throw new Error("Blog slug is required.");
  if (data.posts.some((post) => post.slug === slug)) {
    throw new Error("A blog post with that slug already exists.");
  }

  const now = new Date().toISOString();
  const next: BlogPost = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.map((line) => line.trim()).filter(Boolean),
    readingTime: input.readingTime?.trim() || estimateReadingTime(input.content),
    createdAt: now,
  };

  data.posts.push(next);
  await writeBlogData(data);
  return next;
}

export async function updateBlogPost(input: {
  currentSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  readingTime?: string;
}) {
  const data = await readBlogData();
  const target = data.posts.find((post) => post.slug === input.currentSlug);
  if (!target) throw new Error("Blog post not found.");

  const nextSlug = normalizeSlug(input.slug || input.title);
  if (!nextSlug) throw new Error("Blog slug is required.");
  if (data.posts.some((post) => post.slug === nextSlug && post.slug !== input.currentSlug)) {
    throw new Error("A blog post with that slug already exists.");
  }

  target.slug = nextSlug;
  target.title = input.title.trim();
  target.excerpt = input.excerpt.trim();
  target.content = input.content.map((line) => line.trim()).filter(Boolean);
  target.readingTime = input.readingTime?.trim() || estimateReadingTime(input.content);
  target.updatedAt = new Date().toISOString();

  await writeBlogData(data);
  return target;
}

export async function deleteBlogPost(slug: string) {
  const data = await readBlogData();
  const before = data.posts.length;
  data.posts = data.posts.filter((post) => post.slug !== slug);
  if (data.posts.length === before) throw new Error("Blog post not found.");
  await writeBlogData(data);
}
