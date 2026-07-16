import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createBlogPost, deleteBlogPost, getBlogPosts, updateBlogPost } from "@/lib/blog";

type ActionBody =
  | {
      action: "create";
      post: {
        slug: string;
        title: string;
        excerpt: string;
        readingTime?: string;
        content: string[];
      };
    }
  | {
      action: "update";
      currentSlug: string;
      post: {
        slug: string;
        title: string;
        excerpt: string;
        readingTime?: string;
        content: string[];
      };
    }
  | { action: "delete"; slug: string };

export async function GET() {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const posts = await getBlogPosts();
  return NextResponse.json({ ok: true, posts });
}

export async function POST(request: Request) {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json()) as ActionBody;

  try {
    if (body.action === "create") {
      await createBlogPost(body.post);
    } else if (body.action === "update") {
      await updateBlogPost({ currentSlug: body.currentSlug, ...body.post });
    } else if (body.action === "delete") {
      await deleteBlogPost(body.slug);
    } else {
      return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }

    const posts = await getBlogPosts();
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Blog action failed." },
      { status: 400 },
    );
  }
}
