import type { MovieReview, MovieSummary } from './types'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? '/api'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${configuredBaseUrl}${path}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('The requested movie could not be found.')
    }

    throw new Error('The API request failed. Verify the MovieReviews.Api project is running.')
  }

  return (await response.json()) as T
}

export function getMovies() {
  return fetchJson<MovieSummary[]>('/movies')
}

export function getMovieById(movieId: number) {
  return fetchJson<MovieSummary>(`/movies/${movieId}`)
}

export function getMovieReviews(movieId: number) {
  return fetchJson<MovieReview[]>(`/movies/${movieId}/reviews`)
}