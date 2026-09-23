export type CategorySlug =
  | 'campus-stories'
  | 'crushes-missed-connections'
  | 'killam-study-rants'
  | 'funny-encounters'
  | 'unpopular-opinions'
  | 'questions-advice'
  | 'campus-tea'

export type ReactionKind = 'upvote' | 'downvote' | 'tiger' | 'dead' | 'missed_connection' | 'spill'

export type ReportReason = 'doxxing_names' | 'harassment' | 'hate_speech' | 'spam'

export interface Post {
  id: string
  content: string
  tag: string | null
  category: CategorySlug
  spoiler: boolean
  upvotes: number
  downvotes: number
  report_count: number
  is_hidden: boolean
  client_token: string
  created_at: string
  net_score?: number
  trending_score?: number
  reaction_counts?: Partial<Record<ReactionKind, number>>
  expires_at?: string
}

export interface Comment {
  id: string
  post_id: string
  parent_id: string | null
  content: string
  pseudonym: string
  upvotes: number
  report_count: number
  is_hidden: boolean
  client_token: string
  created_at: string
}

export type FeedTab = 'trending' | 'latest'
