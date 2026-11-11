import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, addProductReview, voteReviewHelpful, getProductById } from "@/lib/server/db";
import { sanitizeString, sanitizeEmail } from "@/lib/server/sanitize";
import { getClientIp } from "@/lib/server/rateLimit";

interface ReviewRateLimit {
  count: number;
  resetAt: number;
}
const reviewLimits = new Map<string, ReviewRateLimit>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = reviewLimits.get(ip);
  if (!record || now > record.resetAt) {
    reviewLimits.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return false;
  }
  if (record.count >= 10) {
    return true;
  }
  record.count += 1;
  return false;
}

function calculateStats(reviews: Array<{ rating: number }>) {
  const totalCount = reviews.length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    sum += star;
  }

  const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 5.0;

  return {
    totalCount,
    averageRating,
    distribution,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reviews = await getProductReviews(id);
    const stats = calculateStats(reviews);

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    });
  } catch (error) {
    console.error("API GET /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many review submissions. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { authorName, authorEmail, rating, title, comment, flowerCount, colorChosen } = body;

    if (!authorName || typeof authorName !== "string" || authorName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (minimum 2 characters)" },
        { status: 400 }
      );
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid rating between 1 and 5 stars" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Please provide a headline for your review" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: "Please write a thoughtful review (minimum 8 characters)" },
        { status: 400 }
      );
    }

    const cleanAuthorName = sanitizeString(authorName, 60);
    const cleanAuthorEmail = authorEmail ? sanitizeEmail(authorEmail) : undefined;
    const cleanTitle = sanitizeString(title, 120);
    const cleanComment = sanitizeString(comment, 2000);
    const cleanColorChosen = colorChosen ? sanitizeString(colorChosen, 60) : undefined;
    const parsedFlowerCount = flowerCount ? Number(flowerCount) : undefined;

    const newReview = await addProductReview({
      productId: id,
      authorName: cleanAuthorName,
      authorEmail: cleanAuthorEmail,
      rating: parsedRating,
      title: cleanTitle,
      comment: cleanComment,
      flowerCount: parsedFlowerCount,
      colorChosen: cleanColorChosen,
      verifiedBuyer: true,
    });

    const updatedReviews = await getProductReviews(id);
    const stats = calculateStats(updatedReviews);

    return NextResponse.json({
      success: true,
      review: newReview,
      stats,
    });
  } catch (error) {
    console.error("API POST /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish review" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (action === "helpful" && reviewId) {
      const res = await voteReviewHelpful(reviewId);
      if (!res) {
        return NextResponse.json(
          { success: false, error: "Review not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, helpfulCount: res.helpfulCount });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API PATCH /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}
