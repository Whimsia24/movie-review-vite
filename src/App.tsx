import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import { getMovieById, getMovieReviews, getMovies } from './api'
import type { MovieReview, MovieSummary } from './types'
import './App.css'

type LoadStatus = 'loading' | 'ready' | 'error'

const releaseDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <div className="container py-4">
            <div className="site-header__bar">
              <Link to="/" className="brand-mark text-decoration-none">
                <span className="brand-mark__eyebrow">Whimsia24</span>
                <span className="brand-mark__title">Movie Reviews</span>
              </Link>
              <nav>
                <Link to="/" className="btn btn-outline-dark rounded-pill px-4">
                  Browse movies
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<MovieIndexPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function MovieIndexPage() {
  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    let isMounted = true

    async function loadMovies() {
      try {
        setStatus('loading')
        const data = await getMovies()

        if (!isMounted) {
          return
        }

        setMovies(data)
        setStatus('ready')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(getErrorMessage(error, 'Unable to load the movie catalogue.'))
        setStatus('error')
      }
    }

    void loadMovies()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredMovies = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return movies
    }

    return movies.filter((movie) => {
      const fields = [movie.title, movie.genre, movie.contentRating, movie.synopsis]
      return fields.some((field) => field.toLowerCase().includes(normalizedQuery))
    })
  }, [deferredQuery, movies])

  const featuredMovie = useMemo(() => {
    return [...movies].sort((left, right) => {
      if (right.averageCriticScore !== left.averageCriticScore) {
        return right.averageCriticScore - left.averageCriticScore
      }

      return right.publishedReviewCount - left.publishedReviewCount
    })[0]
  }, [movies])

  return (
    <>
      <section className="hero-banner">
        <div className="container py-5 py-lg-6">
          <div className="row g-4 align-items-end">
            <div className="col-lg-7">
              <div className="hero-banner__panel">
                <p className="hero-banner__eyebrow">Public critic picks</p>
                <h1 className="hero-banner__title">Find the next movie worth your time.</h1>
                <p className="hero-banner__summary">
                  Browse every title in the Whimsia catalogue, compare critic scores, and open
                  each film to read published reviews from named critics.
                </p>
                <div className="hero-banner__actions">
                  <label className="search-field" htmlFor="movie-search">
                    <span className="search-field__label">Search titles, genres, or ratings</span>
                    <input
                      id="movie-search"
                      className="form-control form-control-lg border-0"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Try sci-fi, drama, PG-13..."
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="featured-card">
                <p className="featured-card__label">Top critic average</p>
                {featuredMovie ? (
                  <>
                    <h2>{featuredMovie.title}</h2>
                    <p className="featured-card__meta">
                      {featuredMovie.genre} · {featuredMovie.contentRating} · {featuredMovie.runtime}
                    </p>
                    <ScoreBadge
                      score={featuredMovie.averageCriticScore}
                      reviewCount={featuredMovie.publishedReviewCount}
                    />
                    <Link
                      className="btn btn-dark rounded-pill px-4 align-self-start"
                      to={`/movies/${featuredMovie.id}`}
                    >
                      Read featured reviews
                    </Link>
                  </>
                ) : (
                  <p className="mb-0 text-body-secondary">Movies will appear here once the API responds.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="catalogue-section pb-5">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">Now showing</p>
              <h2 className="section-heading__title">All movies</h2>
            </div>
            <p className="section-heading__count mb-0">
              {filteredMovies.length} of {movies.length} titles
            </p>
          </div>

          {status === 'loading' && <MovieGridSkeleton />}
          {status === 'error' && <ErrorState message={errorMessage} />}
          {status === 'ready' && filteredMovies.length === 0 && (
            <EmptyState
              title="No movies match that search"
              message="Try a broader genre, rating, or part of a title."
            />
          )}
          {status === 'ready' && filteredMovies.length > 0 && (
            <div className="row g-4">
              {filteredMovies.map((movie) => (
                <div className="col-sm-6 col-xl-4" key={movie.id}>
                  <article className="movie-card card border-0 h-100">
                    <PosterImage movie={movie} className="movie-card__poster" />
                    <div className="card-body d-flex flex-column gap-3 p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <p className="movie-card__genre">{movie.genre}</p>
                          <h3 className="movie-card__title">{movie.title}</h3>
                        </div>
                        <span className="badge text-bg-light rounded-pill px-3 py-2">
                          {movie.contentRating}
                        </span>
                      </div>

                      <p className="movie-card__synopsis">{movie.synopsis}</p>

                      <div className="movie-card__meta">
                        <span>{releaseDateFormatter.format(new Date(movie.releaseDate))}</span>
                        <span>{movie.runtime}</span>
                      </div>

                      <ScoreBadge
                        score={movie.averageCriticScore}
                        reviewCount={movie.publishedReviewCount}
                      />

                      <div className="mt-auto pt-2">
                        <Link className="btn btn-outline-dark rounded-pill w-100" to={`/movies/${movie.id}`}>
                          View details and reviews
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function MovieDetailsPage() {
  const { id } = useParams()
  const movieId = Number(id)
  const hasValidMovieId = Number.isInteger(movieId) && movieId > 0
  const [movie, setMovie] = useState<MovieSummary | null>(null)
  const [reviews, setReviews] = useState<MovieReview[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!hasValidMovieId) {
      return
    }

    let isMounted = true

    async function loadMovieDetails() {
      try {
        setStatus('loading')
        const [movieResult, reviewResults] = await Promise.all([
          getMovieById(movieId),
          getMovieReviews(movieId),
        ])

        if (!isMounted) {
          return
        }

        setMovie(movieResult)
        setReviews(reviewResults)
        setStatus('ready')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(getErrorMessage(error, 'Unable to load that movie right now.'))
        setStatus('error')
      }
    }

    void loadMovieDetails()

    return () => {
      isMounted = false
    }
  }, [hasValidMovieId, movieId])

  if (!hasValidMovieId) {
    return (
      <section className="container py-5">
        <Link to="/" className="btn btn-link px-0 mb-4 back-link">
          Back to all movies
        </Link>
        <ErrorState message="The selected movie could not be found." />
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="container py-5">
        <div className="loading-panel">
          <div className="spinner-border text-dark" role="status" aria-hidden="true"></div>
          <p className="mb-0">Loading movie details and critic reviews...</p>
        </div>
      </section>
    )
  }

  if (status === 'error' || movie === null) {
    return (
      <section className="container py-5">
        <Link to="/" className="btn btn-link px-0 mb-4 back-link">
          Back to all movies
        </Link>
        <ErrorState message={errorMessage} />
      </section>
    )
  }

  return (
    <section className="movie-detail pb-5">
      <div className="container py-4 py-lg-5">
        <Link to="/" className="btn btn-link px-0 mb-4 back-link">
          Back to all movies
        </Link>

        <div className="movie-detail__hero row g-4 align-items-stretch">
          <div className="col-lg-4">
            <PosterImage movie={movie} className="movie-detail__poster" />
          </div>
          <div className="col-lg-8">
            <div className="movie-detail__panel h-100">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge text-bg-light rounded-pill px-3 py-2">{movie.genre}</span>
                <span className="badge text-bg-light rounded-pill px-3 py-2">{movie.contentRating}</span>
                <span className="badge text-bg-light rounded-pill px-3 py-2">{movie.runtime}</span>
              </div>
              <h1 className="movie-detail__title">{movie.title}</h1>
              <p className="movie-detail__release">
                Released {releaseDateFormatter.format(new Date(movie.releaseDate))}
              </p>
              <p className="movie-detail__summary">{movie.synopsis}</p>

              <div className="movie-detail__metrics row g-3 mt-2">
                <div className="col-md-6">
                  <div className="metric-card">
                    <span className="metric-card__label">Average critic score</span>
                    <strong>{formatScore(movie.averageCriticScore)}</strong>
                    <small>{movie.publishedReviewCount} published reviews</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="metric-card">
                    <span className="metric-card__label">Community rating</span>
                    <strong>{movie.userRating.toFixed(1)} / 10</strong>
                    <small>Imported from the admin catalogue</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reviews-section mt-5">
          <div className="section-heading mb-4">
            <div>
              <p className="section-heading__eyebrow">Published reactions</p>
              <h2 className="section-heading__title">Critic reviews</h2>
            </div>
          </div>

          {reviews.length === 0 ? (
            <EmptyState
              title="No published critic reviews yet"
              message="This movie is in the catalogue, but no critic has published a review for it yet."
            />
          ) : (
            <div className="row g-4">
              {reviews.map((review) => (
                <div className="col-12" key={review.id}>
                  <article className="review-card">
                    <div className="review-card__header">
                      <div>
                        <p className="review-card__critic">{review.criticName}</p>
                        <h3 className="review-card__title">{review.title}</h3>
                      </div>
                      <div className="review-card__score">
                        <strong>{formatScore(review.score)}</strong>
                        <span>{formatPublishedAt(review.publishedAt)}</span>
                      </div>
                    </div>
                    <p className="review-card__body">{review.body}</p>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PosterImage({ movie, className }: { movie: MovieSummary; className: string }) {
  const [hasLoadError, setHasLoadError] = useState(false)

  if (!movie.posterUrl || hasLoadError) {
    return (
      <div className={`${className} poster-fallback`}>
        <span>{getPosterMonogram(movie.title)}</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={movie.posterUrl}
      alt={`${movie.title} poster`}
      onError={() => setHasLoadError(true)}
    />
  )
}

function ScoreBadge({ score, reviewCount }: { score: number; reviewCount: number }) {
  const scoreWidth = `${Math.max(0, Math.min(100, (score / 5) * 100))}%`

  return (
    <div className="score-badge">
      <div className="score-badge__track" aria-hidden="true">
        <span className="score-badge__fill" style={{ width: scoreWidth }}></span>
      </div>
      <div className="score-badge__text">
        <strong>{reviewCount === 0 ? 'No reviews yet' : formatScore(score)}</strong>
        <span>{reviewCount === 1 ? '1 critic review' : `${reviewCount} critic reviews`}</span>
      </div>
    </div>
  )
}

function MovieGridSkeleton() {
  return (
    <div className="row g-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="col-sm-6 col-xl-4" key={index}>
          <div className="movie-card movie-card--skeleton card border-0 h-100">
            <div className="placeholder-glow movie-card__poster movie-card__poster--placeholder">
              <span className="placeholder col-12 h-100"></span>
            </div>
            <div className="card-body p-4">
              <p className="placeholder-glow mb-2">
                <span className="placeholder col-4"></span>
              </p>
              <p className="placeholder-glow mb-3">
                <span className="placeholder col-8"></span>
              </p>
              <p className="placeholder-glow mb-2">
                <span className="placeholder col-12"></span>
              </p>
              <p className="placeholder-glow mb-2">
                <span className="placeholder col-10"></span>
              </p>
              <p className="placeholder-glow mb-0">
                <span className="placeholder col-6"></span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="status-panel">
      <h3>{title}</h3>
      <p className="mb-0">{message}</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="status-panel status-panel--error">
      <h3>Something went wrong</h3>
      <p className="mb-0">{message}</p>
    </div>
  )
}

function formatScore(score: number) {
  return `${score.toFixed(1)} / 5`
}

function formatPublishedAt(publishedAt: string | null) {
  if (!publishedAt) {
    return 'Publication date unavailable'
  }

  return `Published ${releaseDateFormatter.format(new Date(publishedAt))}`
}

function getPosterMonogram(title: string) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallbackMessage
}

export default App
