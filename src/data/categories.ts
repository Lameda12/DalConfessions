import type { CategorySlug, ReactionKind } from '@/types'

export interface CategoryMeta {
  slug: CategorySlug
  label: string
  emoji: string
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: 'campus-stories', label: 'Campus Stories', emoji: '🏛️' },
  { slug: 'crushes-missed-connections', label: 'Crushes & Missed Connections', emoji: '💌' },
  { slug: 'killam-study-rants', label: 'Killam & Study Rants', emoji: '📚' },
  { slug: 'funny-encounters', label: 'Funny Encounters', emoji: '😂' },
  { slug: 'unpopular-opinions', label: 'Unpopular Opinions', emoji: '🔥' },
  { slug: 'questions-advice', label: 'Questions & Advice', emoji: '🧭' },
  { slug: 'campus-tea', label: 'Campus Tea', emoji: '🍵' },
]

export const CATEGORY_BY_SLUG: Record<CategorySlug, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, CategoryMeta>

export interface ReactionMeta {
  type: ReactionKind
  emoji: string
  label: string
}

export const CAMPUS_REACTIONS: ReactionMeta[] = [
  { type: 'tiger', emoji: '🐯', label: 'Tiger Roar' },
  { type: 'dead', emoji: '💀', label: 'Dead' },
  { type: 'missed_connection', emoji: '💔', label: 'Missed Connection' },
  { type: 'spill', emoji: '☕', label: 'Spill' },
]

export const FEED_TABS = [
  { id: 'trending', label: 'Trending' },
  { id: 'latest', label: 'Latest' },
] as const

export const REPORT_REASONS = [
  { value: 'doxxing_names', label: 'Doxxing / Names' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'spam', label: 'Spam' },
] as const
