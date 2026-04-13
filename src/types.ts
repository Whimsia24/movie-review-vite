export interface MovieSummary {
  id: number
  title: string
  synopsis: string
  genre: string
  contentRating: string
  userRating: number
  averageCriticScore: number
  publishedReviewCount: number
  runtime: string
  releaseDate: string
  posterUrl: string | null
}

export interface MovieReview {
  id: number
  title: string
  body: string
  score: number
  publishedAt: string | null
  criticName: string
}