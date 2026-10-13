import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

const ReviewModal = ({ isOpen, onClose, product, orderId, onReviewSubmitted }) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      error('Please select a star rating between 1 and 5');
      return;
    }

    try {
      setLoading(true);
      await reviewService.submitReview(product.id || product.productId, {
        orderId,
        rating,
        comment: comment.trim(),
      });
      success('Thank you! Your verified purchase review has been submitted.');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            Verified Purchase Review
          </span>
          <h3 className="text-xl font-black text-stone-900 mt-2">
            Rate {product.title || product.productTitleSnapshot}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Share your authentic feedback to support your local farmer and help fellow consumers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating stars */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Overall Quality Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-stone-300 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-stone-700 ml-2">
                {rating === 5 ? '5 - Outstanding' : rating === 4 ? '4 - Very Fresh' : rating === 3 ? '3 - Average' : rating === 2 ? '2 - Below Expectation' : '1 - Poor'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How fresh was the produce? How was the natural fragrance, texture, and taste?"
              className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" loading={loading} variant="primary">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
