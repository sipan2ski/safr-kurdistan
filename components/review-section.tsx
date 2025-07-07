"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, MessageSquare, Edit, Trash2, Plus, User } from "lucide-react"
import { ReviewService, type Review } from "@/lib/review"
import { AuthService, type AuthState } from "@/lib/auth"
import type { Language } from "@/lib/translations"

interface ReviewSectionProps {
  houseId: string
  language: Language
  onAuthRequired: () => void
}

export function ReviewSection({ houseId, language, onAuthRequired }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [showAddReview, setShowAddReview] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [message, setMessage] = useState("")

  const reviewService = ReviewService.getInstance()
  const authService = AuthService.getInstance()

  useEffect(() => {
    setAuthState(authService.getAuthState())
    const unsubscribe = authService.subscribe(setAuthState)
    loadReviews()
    return unsubscribe
  }, [houseId])

  const loadReviews = () => {
    const houseReviews = reviewService.getHouseReviews(houseId)
    const stats = reviewService.getHouseRatingStats(houseId)
    setReviews(houseReviews)
    setRatingStats(stats)
  }

  const handleAddReview = () => {
    if (!authState.isAuthenticated) {
      onAuthRequired()
      return
    }
    setShowAddReview(true)
  }

  const handleDeleteReview = (reviewId: string) => {
    if (!authState.user) return

    if (
      confirm(
        language === "ar"
          ? "هل أنت متأكد من حذف هذا التقييم؟"
          : language === "ku"
            ? "دڵنیایت لە سڕینەوەی ئەم هەڵسەنگاندنە؟"
            : "Are you sure you want to delete this review?",
      )
    ) {
      const result = reviewService.deleteReview(reviewId, authState.user.id)
      setMessage(result.message)
      if (result.success) {
        loadReviews()
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const canUserReview = authState.user ? reviewService.canUserReview(houseId, authState.user.id) : false

  const getRatingText = (rating: number) => {
    const texts = {
      en: ["Terrible", "Poor", "Average", "Good", "Excellent"],
      ar: ["سيء جداً", "سيء", "متوسط", "جيد", "ممتاز"],
      ku: ["زۆر خراپ", "خراپ", "مامناوەند", "باش", "نایاب"],
    }
    return texts[language][rating - 1]
  }

  const isRTL = language === "ar"

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {language === "ar"
              ? "التقييمات والمراجعات"
              : language === "ku"
                ? "هەڵسەنگاندن و پێداچوونەوەکان"
                : "Ratings & Reviews"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(ratingStats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {ratingStats.totalReviews} {language === "ar" ? "تقييم" : language === "ku" ? "هەڵسەنگاندن" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution]
                const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Review Button */}
          <div className="mt-6 text-center">
            {authState.isAuthenticated ? (
              canUserReview ? (
                <Button onClick={handleAddReview} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "ar" ? "إضافة تقييم" : language === "ku" ? "هەڵسەنگاندن زیادبکە" : "Add Review"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === "ar"
                    ? "لقد قمت بتقييم هذا المنزل بالفعل"
                    : language === "ku"
                      ? "تۆ پێشتر ئەم خانووەت هەڵسەنگاندووە"
                      : "You have already reviewed this house"}
                </p>
              )
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "ar"
                    ? "يجب تسجيل الدخول لإضافة تقييم"
                    : language === "ku"
                      ? "بۆ زیادکردنی هەڵسەنگاندن دەبێت بچیتە ژوورەوە"
                      : "Please login to add a review"}
                </p>
                <Button variant="outline" onClick={onAuthRequired}>
                  <User className="w-4 h-4 mr-2" />
                  {language === "ar" ? "تسجيل الدخول" : language === "ku" ? "چوونەژوورەوە" : "Login"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div
          className={`text-center text-sm p-3 rounded ${
            message.includes("success")
              ? "text-green-700 bg-green-50 border border-green-200"
              : "text-red-700 bg-red-50 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === "ar" ? "جميع التقييمات" : language === "ku" ? "هەموو هەڵسەنگاندنەکان" : "All Reviews"} (
          {reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === "ar"
                  ? "لا توجد تقييمات بعد"
                  : language === "ku"
                    ? "هێشتا هیچ هەڵسەنگاندنێک نییە"
                    : "No reviews yet"}
              </h3>
              <p className="text-gray-500">
                {language === "ar"
                  ? "كن أول من يقيم هذا المنزل"
                  : language === "ku"
                    ? "یەکەمین کەس بە کە ئەم خانووە هەڵبسەنگێنێت"
                    : "Be the first to review this house"}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="secondary">{getRatingText(review.rating)}</Badge>
                    </div>
                    <h4 className="font-medium">{review.title}</h4>
                  </div>

                  {/* Edit/Delete buttons for own reviews */}
                  {authState.user && authState.user.id === review.userId && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingReview(review)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
                {review.updatedAt !== review.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "تم التحديث في" : language === "ku" ? "نوێکراوەتەوە لە" : "Updated on"}:{" "}
                    {new Date(review.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={showAddReview}
        onClose={() => setShowAddReview(false)}
        houseId={houseId}
        userId={authState.user?.id || ""}
        userName={authState.user?.name || ""}
        language={language}
        onSuccess={() => {
          loadReviews()
          setShowAddReview(false)
          setMessage(
            language === "ar"
              ? "تم إضافة التقييم بنجاح"
              : language === "ku"
                ? "هەڵسەنگاندن بە سەرکەوتوویی زیادکرا"
                : "Review added successfully",
          )
          setTimeout(() => setMessage(""), 3000)
        }}
      />

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          review={editingReview}
          language={language}
          onSuccess={() => {
            loadReviews()
            setEditingReview(null)
            setMessage(
              language === "ar"
                ? "تم تحديث التقييم بنجاح"
                : language === "ku"
                  ? "هەڵسەنگاندن بە سەرکەوتوویی نوێکرایەوە"
                  : "Review updated successfully",
            )
            setTimeout(() => setMessage(""), 3000)
          }}
        />
      )}
    </div>
  )
}

// Add Review Modal Component
function AddReviewModal({
  isOpen,
  onClose,
  houseId,
  userId,
  userName,
  language,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  houseId: string
  userId: string
  userName: string
  language: Language
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const reviewService = ReviewService.getInstance()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    if (rating === 0) {
      setMessage(
        language === "ar"
          ? "يرجى اختيار تقييم"
          : language === "ku"
            ? "تکایە هەڵسەنگاندنێک هەڵبژێرە"
            : "Please select a rating",
      )
      setIsLoading(false)
      return
    }

    if (!title.trim()) {
      setMessage(
        language === "ar"
          ? "يرجى إدخال عنوان للتقييم"
          : language === "ku"
            ? "تکایە ناونیشانێک بۆ هەڵسەنگاندن بنووسە"
            : "Please enter a review title",
      )
      setIsLoading(false)
      return
    }

    if (!comment.trim()) {
      setMessage(
        language === "ar" ? "يرجى إدخال تعليق" : language === "ku" ? "تکایە کۆمێنتێک بنووسە" : "Please enter a comment",
      )
      setIsLoading(false)
      return
    }

    const result = reviewService.addReview({
      houseId,
      userId,
      userName,
      rating,
      title: title.trim(),
      comment: comment.trim(),
    })

    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onSuccess()
        setRating(0)
        setTitle("")
        setComment("")
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "إضافة تقييم" : language === "ku" ? "هەڵسەنگاندن زیادبکە" : "Add Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label>{language === "ar" ? "التقييم" : language === "ku" ? "هەڵسەنگاندن" : "Rating"} *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="transition-colors">
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({rating}/5 -{" "}
                  {rating === 1
                    ? language === "ar"
                      ? "سيء جداً"
                      : language === "ku"
                        ? "زۆر خراپ"
                        : "Terrible"
                    : rating === 2
                      ? language === "ar"
                        ? "سيء"
                        : language === "ku"
                          ? "خراپ"
                          : "Poor"
                      : rating === 3
                        ? language === "ar"
                          ? "متوسط"
                          : language === "ku"
                            ? "مامناوەند"
                            : "Average"
                        : rating === 4
                          ? language === "ar"
                            ? "جيد"
                            : language === "ku"
                              ? "باش"
                              : "Good"
                          : language === "ar"
                            ? "ممتاز"
                            : language === "ku"
                              ? "نایاب"
                              : "Excellent"}
                  )
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title">
              {language === "ar" ? "عنوان التقييم" : language === "ku" ? "ناونیشانی هەڵسەنگاندن" : "Review Title"} *
            </Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === "ar"
                  ? "مثال: إقامة رائعة!"
                  : language === "ku"
                    ? "نموونە: مانەوەیەکی نایاب!"
                    : "e.g., Amazing stay!"
              }
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="review-comment">
              {language === "ar" ? "التعليق" : language === "ku" ? "کۆمێنت" : "Comment"} *
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === "ar"
                  ? "شاركنا تجربتك مع هذا المنزل..."
                  : language === "ku"
                    ? "ئەزموونەکەت لەگەڵ ئەم خانووە لەگەڵمان بەشدارە..."
                    : "Share your experience with this house..."
              }
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? language === "ar"
                ? "جاري الإضافة..."
                : language === "ku"
                  ? "زیادکردن..."
                  : "Adding..."
              : language === "ar"
                ? "إضافة التقييم"
                : language === "ku"
                  ? "هەڵسەنگاندن زیادبکە"
                  : "Add Review"}
          </Button>
        </form>

        {message && (
          <div
            className={`text-center text-sm p-3 rounded ${
              message.includes("success")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Edit Review Modal Component
function EditReviewModal({
  isOpen,
  onClose,
  review,
  language,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  review: Review
  language: Language
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(review.rating)
  const [title, setTitle] = useState(review.title)
  const [comment, setComment] = useState(review.comment)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const reviewService = ReviewService.getInstance()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    if (rating === 0) {
      setMessage(
        language === "ar"
          ? "يرجى اختيار تقييم"
          : language === "ku"
            ? "تکایە هەڵسەنگاندنێک هەڵبژێرە"
            : "Please select a rating",
      )
      setIsLoading(false)
      return
    }

    if (!title.trim()) {
      setMessage(
        language === "ar"
          ? "يرجى إدخال عنوان للتقييم"
          : language === "ku"
            ? "تکایە ناونیشانێک بۆ هەڵسەنگاندن بنووسە"
            : "Please enter a review title",
      )
      setIsLoading(false)
      return
    }

    if (!comment.trim()) {
      setMessage(
        language === "ar" ? "يرجى إدخال تعليق" : language === "ku" ? "تکایە کۆمێنتێک بنووسە" : "Please enter a comment",
      )
      setIsLoading(false)
      return
    }

    const result = reviewService.updateReview(review.id, {
      rating,
      title: title.trim(),
      comment: comment.trim(),
    })

    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onSuccess()
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "تعديل التقييم" : language === "ku" ? "هەڵسەنگاندن دەستکاریبکە" : "Edit Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label>{language === "ar" ? "التقييم" : language === "ku" ? "هەڵسەنگاندن" : "Rating"} *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="transition-colors">
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="edit-review-title">
              {language === "ar" ? "عنوان التقييم" : language === "ku" ? "ناونیشانی هەڵسەنگاندن" : "Review Title"} *
            </Label>
            <Input
              id="edit-review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="edit-review-comment">
              {language === "ar" ? "التعليق" : language === "ku" ? "کۆمێنت" : "Comment"} *
            </Label>
            <Textarea
              id="edit-review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? language === "ar"
                ? "جاري التحديث..."
                : language === "ku"
                  ? "نوێکردنەوە..."
                  : "Updating..."
              : language === "ar"
                ? "تحديث التقييم"
                : language === "ku"
                  ? "هەڵسەنگاندن نوێبکەرەوە"
                  : "Update Review"}
          </Button>
        </form>

        {message && (
          <div
            className={`text-center text-sm p-3 rounded ${
              message.includes("success")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
