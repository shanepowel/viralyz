import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookBody = {
  tags?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookBody>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true,
    );

    if (!isValidSignature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const tags = body?.tags?.filter(Boolean) ?? [];
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }

    return NextResponse.json({ revalidated: true, tags });
  } catch (err) {
    console.error(err);
    return new NextResponse("Error revalidating", { status: 500 });
  }
}
