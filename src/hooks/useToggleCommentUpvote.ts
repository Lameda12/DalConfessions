import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken } from '@/lib/deviceToken'

interface ToggleCommentUpvoteInput {
  commentId: string
  postId: string
}

export function useToggleCommentUpvote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId }: ToggleCommentUpvoteInput) => {
      const { data, error } = await supabase.rpc('toggle_comment_upvote', {
        p_comment_id: commentId,
        p_client_token: getDeviceToken(),
      })
      if (error) throw error
      return data?.[0] as { active: boolean; upvotes: number } | undefined
    },
    onSettled: (_data, _error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
