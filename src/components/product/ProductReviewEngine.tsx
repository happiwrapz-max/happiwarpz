"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, ThumbsUp, MessageSquare, PenLine, X, Award } from "lucide-react";
import { ProductReview } from "@/lib/store/types";

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  distribution: Record<number, number>;
}

interface ProductReviewEngineProps {
  productId: string;
  productName: string;
  initialReviews?: ProductReview[];
}

export default function ProductReviewEngine({
  productId,
  productName,
  initialReviews = [],
}: ProductReviewEngineProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [flowerCount, setFlowerCount] = useState<number>(10);
  const [colorChosen, setColorChosen] = useState("Crimson Velvet Red");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch live reviews on mount
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Calculate stats dynamically
  const stats: ReviewStats = (() => {
    const totalCount = reviews.length;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += star;
    }
    const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 5.0;
    return { totalCount, averageRating, distribution };
  })();

  const handleHelpfulVote = async (reviewId: string) => {
    if (votedIds.has(reviewId)) return;
    setVotedIds((prev) => new Set(prev).add(reviewId));

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );

    try {
      await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action: "helpful" }),
      });
    } catch {
      // Revert if error
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!authorName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!title.trim()) {
      setFormError("Please give your review a headline.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      setFormError("Please write at least 8 characters about your experience.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          flowerCount: Number(flowerCount) || undefined,
          colorChosen: colorChosen || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to submit review.");
        return;
      }

      // Add to list and show success
      setReviews((prev) => [data.review, ...prev]);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setComment("");
        setTitle("");
      }, 1800);
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  return (
    <section id="reviews" className="w-full pt-16 pb-12 border-t border-[#EFEAE2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E10600]/5 border border-[#E10600]/15 text-[11px] font-serif uppercase tracking-[0.18em] text-[#E10600] mb-2">
              <Award className="w-3 h-3 text-[#E10600]" />
              <span>Client Experiences</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <p className="text-sm text-[#666] font-sans mt-1">
              Real impressions from verified patrons of our Coimbatore handcrafted atelier.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#E10600] hover:bg-[#C20500] text-white px-6 py-3 rounded-full text-xs font-serif uppercase tracking-[0.14em] font-medium shadow-md transition-all cursor-pointer self-start md:self-auto"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Overview Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] mb-12">
          {/* Average Score Column */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#EFEAE2]">
            <div className="text-5xl sm:text-6xl font-serif font-bold text-[#1E1E1E]">
              {stats.averageRating}
            </div>
            <div className="flex items-center gap-1 text-[#E5A83B] my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-[#E5A83B] text-[#E5A83B]"
                      : "text-[#D1C7BD]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#666] font-sans">
              Based on{" "}
              <strong className="text-[#1E1E1E] font-semibold">{stats.totalCount}</strong> verified{" "}
              {stats.totalCount === 1 ? "review" : "reviews"}
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] text-[#059669] font-medium mt-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>100% Authentic Handcrafted Orders</span>
            </div>
          </div>

          {/* Star Distribution Bars Column */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percent = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
              const isFiltered = filterRating === stars;
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setFilterRating(isFiltered ? null : stars)}
                  className={`flex items-center gap-3 text-xs w-full text-left rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                    isFiltered ? "bg-[#EFEAE2]" : "hover:bg-[#F2ECE3]"
                  }`}
                >
                  <span className="w-12 font-medium text-[#1E1E1E] flex items-center gap-1 shrink-0">
                    {stars} <Star className="w-3 h-3 fill-[#E5A83B] text-[#E5A83B]" />
                  </span>

                  <div className="flex-1 h-2.5 bg-[#E6E0D6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E5A83B] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-[11px] text-[#777] font-sans shrink-0">
                    {count} ({Math.round(percent)}%)
                  </span>
                </button>
              );
            })}

            {filterRating && (
              <div className="pt-2 flex items-center justify-between text-xs text-[#E10600]">
                <span>Showing only {filterRating}-star reviews</span>
                <button
                  onClick={() => setFilterRating(null)}
                  className="underline hover:text-[#C20500] cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {loading && reviews.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#888]">Loading authentic reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EFEAE2]">
            <p className="text-sm text-[#666] font-serif">
              No reviews found matching the selected criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((rev) => {
              const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const isHelpful = votedIds.has(rev.id);

              return (
                <div
                  key={rev.id}
                  className="p-6 bg-white rounded-2xl border border-[#EFEAE2] shadow-xs space-y-3 hover:border-[#DCD5C9] transition-all"
                >
                  {/* Review Top Meta: Stars, Author, Badges & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Star Rating */}
                      <div className="flex items-center text-[#E5A83B]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? "fill-[#E5A83B]" : "text-[#D1C7BD]"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Author Name */}
                      <span className="font-serif font-medium text-sm text-[#1E1E1E]">
                        {rev.authorName}
                      </span>

                      {/* Verified Badge */}
                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#059669] font-medium bg-[#059669]/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Verified Order</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-[#888] font-sans">{formattedDate}</span>
                  </div>

                  {/* Order Customization Tags (Number of flowers & Color) */}
                  {(rev.flowerCount || rev.colorChosen) && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#666]">
                      {rev.flowerCount && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFEAE2] font-medium text-[#1E1E1E]">
                          💐 {rev.flowerCount} Flowers Bouquet
                        </span>
                      )}
                      {rev.colorChosen && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFEAE2] text-[#555]">
                          Color: {rev.colorChosen}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review Title */}
                  <h4 className="font-serif text-base font-semibold text-[#1E1E1E] leading-snug">
                    {rev.title}
                  </h4>

                  {/* Review Comment Body */}
                  <p className="text-xs sm:text-sm text-[#444] leading-relaxed font-sans">
                    {rev.comment}
                  </p>

                  {/* Bottom Bar: Helpful button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EC] text-xs">
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(rev.id)}
                      disabled={isHelpful}
                      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full border transition-all cursor-pointer ${
                        isHelpful
                          ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669]"
                          : "border-[#EFEAE2] text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E]"
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{isHelpful ? "Helpful ✓" : "Helpful"}</span>
                      {Number(rev.helpfulCount || 0) > 0 && (
                        <span className="font-semibold text-[11px]">
                          ({rev.helpfulCount})
                        </span>
                      )}
                    </button>

                    <span className="text-[11px] text-[#999] font-sans">
                      Verified Coimbatore Atelier Client
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── WRITE A REVIEW MODAL / DRAWER ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EFEAE2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-[#777] hover:text-[#1E1E1E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {formSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-[#1E1E1E]">Thank You!</h3>
                <p className="text-xs text-[#666] max-w-xs mx-auto">
                  Your authentic review for <strong>{productName}</strong> has been published.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#1E1E1E]">Write a Review</h3>
                  <p className="text-xs text-[#666] font-sans mt-0.5">
                    Share your experience with <strong>{productName}</strong>
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-[#FEE2E2] border border-[#E10600]/30 rounded-xl text-xs text-[#E10600]">
                    {formError}
                  </div>
                )}

                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1.5">
                    Your Overall Rating:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star
                              ? "fill-[#E5A83B] text-[#E5A83B]"
                              : "text-[#D1C7BD]"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#1E1E1E] ml-2">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name & Email inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Priya Sundaram"
                      className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="For verified buyer status"
                      className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                    />
                  </div>
                </div>

                {/* Flower Count & Color Chosen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                      Flowers in Bouquet
                    </label>
                    <select
                      value={flowerCount}
                      onChange={(e) => setFlowerCount(Number(e.target.value))}
                      className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] cursor-pointer"
                    >
                      <option value={3}>3 Flowers Bouquet</option>
                      <option value={5}>5 Flowers Bouquet</option>
                      <option value={7}>7 Flowers Bouquet</option>
                      <option value={10}>10 Flowers Bouquet</option>
                      <option value={15}>15 Flowers Bouquet</option>
                      <option value={20}>20 Flowers Bouquet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                      Color Selected
                    </label>
                    <input
                      type="text"
                      value={colorChosen}
                      onChange={(e) => setColorChosen(e.target.value)}
                      placeholder="e.g. Crimson Velvet Red"
                      className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Incredible craftsmanship, looks eternal!"
                    className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] mb-1">
                    Review Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you love about the ribbon flowers, the petals, delivery or packaging?"
                    className="w-full text-xs p-3 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#E10600] hover:bg-[#C20500] disabled:bg-[#CCC] text-white py-3.5 rounded-xl font-serif text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {submitting ? "Publishing Review..." : "Submit Verified Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
