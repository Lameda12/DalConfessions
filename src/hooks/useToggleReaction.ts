import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken } from '@/lib/deviceToken'
import type { Post, ReactionKind } from '@/types'

interface ToggleReactionInput {
  postId: string
  reaction: ReactionKind
}

interface TogglePostReactionRow {
  active: boolean
  upvotes: number
  downvotes: number
}

function applyVoteDelta(post: Post, upvotes: number, downvotes: number): Post {
  return { ...post, upvotes, downvotes, net_score: upvotes - downvotes }
}

function applyReactionCountDelta(post: Post, reaction: ReactionKind, delta: number): Post {
  const current = post.reaction_counts?.[reaction] ?? 0
  return {
    ...post,
    reaction_counts: { ...post.reaction_counts, [reaction]: Math.max(current + delta, 0) },
  }
}

export function useToggleReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, reaction }: ToggleReactionInput) => {
      const { data, error } = await supabase.rpc('toggle_post_reaction', {
        p_post_id: postId,
        p_reaction: reaction,
        p_client_token: getDeviceToken(),
      })
      if (error) throw error
      return (data as TogglePostReactionRow[])[0]
    },
    onMutate: async ({ postId, reaction }) => {
      const isVote = reaction === 'upvote' || reaction === 'downvote'
      const mySet = queryClient.getQueryData<Set<ReactionKind>>(['myReactions', postId])
      const wasActive = mySet?.has(reaction) ?? false

      const nextSet = new Set(mySet ?? [])
      if (wasActive) {
        nextSet.delete(reaction)
      } else {
        if (isVote) {
          nextSet.delete(reaction === 'upvote' ? 'downvote' : 'upvote')
        }
        nextSet.add(reaction)
      }
      queryClient.setQueryData(['myReactions', postId], nextSet)

      if (isVote) {
        const delta = wasActive ? -1 : 1

        queryClient.setQueryData<Post>(['post', postId], (old) =>
          old
            ? applyVoteDelta(
                old,
                reaction === 'upvote' ? old.upvotes + delta : old.upvotes,
                reaction === 'downvote' ? old.downvotes + delta : old.downvotes,
              )
            : old,
        )

        queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) =>
          old?.map((p) =>
            p.id === postId
              ? applyVoteDelta(
                  p,
                  reaction === 'upvote' ? p.upvotes + delta : p.upvotes,
                  reaction === 'downvote' ? p.downvotes + delta : p.downvotes,
                )
              : p,
          ),
        )
      } else {
        const delta = wasActive ? -1 : 1

        queryClient.setQueryData<Post>(['post', postId], (old) =>
          old ? applyReactionCountDelta(old, reaction, delta) : old,
        )
        queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) =>
          old?.map((p) => (p.id === postId ? applyReactionCountDelta(p, reaction, delta) : p)),
        )
      }
    },
    onSettled: (_data, _error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['myReactions', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
