import Link from "next/link";
import { blogPosts } from "@/lib/blog";

export default function BlogPage() {
  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1000px,100%)]">
        <p className="eyebrow">Journal</p>
        <h1 className="mt-2 text-6xl">Amber Hour Blog</h1>
        <div className="mt-8 space-y-4">
          {blogPosts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-[var(--line)] p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--cream-dim)]">
                {post.date} · {post.readingTime}
              </p>
              <h2 className="mt-2 text-3xl">
                <Link href={`/blog/${post.slug}`} className="focus-ring">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-[var(--cream-dim)]">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
