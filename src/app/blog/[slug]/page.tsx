import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="px-[5vw] py-16">
      <div className="mx-auto w-[min(800px,100%)]">
        <p className="eyebrow">Blog</p>
        <h1 className="mt-2 text-6xl">{post.title}</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.14em] text-[var(--cream-dim)]">
          {post.date} · {post.readingTime}
        </p>
        <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--cream-dim)]">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
