export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-an-evening-ritual",
    title: "How To Build An Evening Ritual That Actually Sticks",
    excerpt: "Small sequence, same cue, low effort. Here is the framework we use in-house.",
    date: "2026-06-30",
    readingTime: "4 min read",
    content: [
      "Most routines fail because they ask too much too fast. Evening rituals work when they are sensory and repeatable.",
      "Pick one anchor hour first. Tea at 7pm. Keep it there for two weeks. Then stack the next step.",
      "You are not chasing perfection. You are building a signal your body can trust.",
    ],
  },
  {
    slug: "what-a-coa-means",
    title: "What A COA Means, In Plain Language",
    excerpt: "A quick guide to batch numbers, THC percentages, and why third-party reports matter.",
    date: "2026-06-22",
    readingTime: "3 min read",
    content: [
      "A COA is a Certificate of Analysis issued by an independent lab. It verifies cannabinoid content and safety screening.",
      "Match the batch number on your product to the batch in our lab report library.",
      "If you ever have questions about a report, send us the batch number and we will walk through it with you.",
    ],
  },
  {
    slug: "why-low-melt-wax",
    title: "Why We Formulate With Low-Melt Wax",
    excerpt: "Comfort is chemistry. Here is why our two-way candle melts differently.",
    date: "2026-06-10",
    readingTime: "5 min read",
    content: [
      "Our candle blend is tuned to melt just above body temperature. That allows a smooth spread without a greasy finish.",
      "We keep fragrance load restrained so scent supports the room instead of taking over it.",
      "The point is transition: light, breathe, then use the warm oil to close the loop.",
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
