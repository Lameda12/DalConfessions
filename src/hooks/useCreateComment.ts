import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken, recordPost } from '@/lib/deviceToken'
import { computePseudonym } from '@/lib/pseudonym'
import type { Comment, Post } from '@/types'

interface NewCommentInput {
  post: Post
  content: string
  parentId?: string | null
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ post, content, parentId }: NewCommentInput) => {
      const clientToken = getDeviceToken()
      const existing = (queryClient.getQueryData<Comment[]>(['comments', post.id]) ?? []) as Comment[]
      const pseudonym = computePseudonym(existing, post.client_token, clientToken)

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          parent_id: parentId ?? null,
          content: content.trim(),
          pseudonym,
          client_token: clientToken,
        })
        .select()
        .single()

      if (error) throw error
      recordPost()
      return data as Comment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.post.id] })
    },
  })
}
