"use client"

export interface Review {
  id: string
  houseId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  createdAt: string
  updatedAt: string
}

export class ReviewService {
  private static instance: ReviewService

  static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService()
    }
    return ReviewService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSampleReviews()
    }
  }

  private initializeSampleReviews() {
    const existingReviews = localStorage.getItem("reviews")
    if (!existingReviews) {
      // Create some sample reviews
      const sampleReviews: Review[] = [
        {
          id: "review-1",
          houseId: "house-1",
          userId: "user-sample-1",
          userName: "Ahmed Al-Baghdadi",
          rating: 5,
          title: "Perfect Mountain Getaway!",
          comment:
            "Amazing villa with breathtaking views! The house was exactly as described and the host was very responsive. Perfect for our family vacation from Baghdad. The cool weather was such a relief from the summer heat!",
          createdAt: "2024-06-15T10:30:00Z",
          updatedAt: "2024-06-15T10:30:00Z",
        },
        {
          id: "review-2",
          houseId: "house-1",
          userId: "user-sample-2",
          userName: "Fatima Hassan",
          rating: 4,
          title: "Great Family House",
          comment:
            "Very comfortable house with all amenities. The kids loved the garden and the mountain air was so refreshing. Only minor issue was the WiFi was a bit slow, but overall excellent stay!",
          createdAt: "2024-06-20T14:15:00Z",
          updatedAt: "2024-06-20T14:15:00Z",
        },
        {
          id: "review-3",
          houseId: "house-1",
          userId: "user-sample-3",
          userName: "Omar Khalil",
          rating: 5,
          title: "Highly Recommended!",
          comment:
            "This place exceeded our expectations. Clean, spacious, and the location is perfect. We came from Basra and it was worth every mile. The host provided great recommendations for local attractions.",
          createdAt: "2024-07-01T09:45:00Z",
          updatedAt: "2024-07-01T09:45:00Z",
        },
        {
          id: "review-4",
          houseId: "house-2",
          userId: "user-sample-4",
          userName: "Layla Mohammed",
          rating: 4,
          title: "Cozy and Authentic",
          comment:
            "Loved the traditional Kurdish architecture! The house has character and charm. Great for couples or small families. The kitchen was well-equipped and we enjoyed cooking local dishes.",
          createdAt: "2024-06-25T16:20:00Z",
          updatedAt: "2024-06-25T16:20:00Z",
        },
        {
          id: "review-5",
          houseId: "house-2",
          userId: "user-sample-5",
          userName: "Yusuf Ali",
          rating: 3,
          title: "Good but could be better",
          comment:
            "The house is nice and the location is good, but some maintenance issues need attention. The bathroom faucet was leaky and the AC in one room wasn't working properly. Still had a decent stay overall.",
          createdAt: "2024-07-05T11:10:00Z",
          updatedAt: "2024-07-05T11:10:00Z",
        },
      ]
      localStorage.setItem("reviews", JSON.stringify(sampleReviews))
    }
  }

  getAllReviews(): Review[] {
    return JSON.parse(localStorage.getItem("reviews") || "[]")
  }

  getHouseReviews(houseId: string): Review[] {
    const reviews = this.getAllReviews()
    return reviews
      .filter((review) => review.houseId === houseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getUserReviews(userId: string): Review[] {
    const reviews = this.getAllReviews()
    return reviews
      .filter((review) => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getHouseRatingStats(houseId: string): {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  } {
    const reviews = this.getHouseReviews(houseId)

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    }
  }

  addReview(review: Omit<Review, "id" | "createdAt" | "updatedAt">): { success: boolean; message: string } {
    try {
      const reviews = this.getAllReviews()

      // Check if user already reviewed this house
      const existingReview = reviews.find((r) => r.houseId === review.houseId && r.userId === review.userId)
      if (existingReview) {
        return { success: false, message: "You have already reviewed this house" }
      }

      const newReview: Review = {
        ...review,
        id: `review-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      reviews.push(newReview)
      localStorage.setItem("reviews", JSON.stringify(reviews))

      return { success: true, message: "Review added successfully" }
    } catch (error) {
      return { success: false, message: "Failed to add review" }
    }
  }

  updateReview(
    reviewId: string,
    updates: Partial<Pick<Review, "rating" | "title" | "comment">>,
  ): { success: boolean; message: string } {
    try {
      const reviews = this.getAllReviews()
      const reviewIndex = reviews.findIndex((r) => r.id === reviewId)

      if (reviewIndex === -1) {
        return { success: false, message: "Review not found" }
      }

      reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem("reviews", JSON.stringify(reviews))
      return { success: true, message: "Review updated successfully" }
    } catch (error) {
      return { success: false, message: "Failed to update review" }
    }
  }

  deleteReview(reviewId: string, userId: string): { success: boolean; message: string } {
    try {
      const reviews = this.getAllReviews()
      const review = reviews.find((r) => r.id === reviewId)

      if (!review) {
        return { success: false, message: "Review not found" }
      }

      if (review.userId !== userId) {
        return { success: false, message: "You can only delete your own reviews" }
      }

      const filteredReviews = reviews.filter((r) => r.id !== reviewId)
      localStorage.setItem("reviews", JSON.stringify(filteredReviews))

      return { success: true, message: "Review deleted successfully" }
    } catch (error) {
      return { success: false, message: "Failed to delete review" }
    }
  }

  canUserReview(houseId: string, userId: string): boolean {
    const reviews = this.getAllReviews()
    return !reviews.some((r) => r.houseId === houseId && r.userId === userId)
  }
}
