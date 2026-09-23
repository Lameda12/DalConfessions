import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getDeviceToken } from '@/lib/deviceToken'
import type { ReportReason } from '@/types'

interface ReportInput {
  targetType: 'post' | 'comment'
  targetId: string
  reason: ReportReason
  postId?: string
}

export function useReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ targetType, targetId, reason }: ReportInput) => {
      const { error } = await supabase.rpc('submit_report', {
        p_target_type: targetType,
        p_target_id: targetId,
        p_reason: reason,
        p_client_token: getDeviceToken(),
      })
      if (error) throw error
    },
    onSettled: (_data, _error, variables) => {
      if (variables.targetType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        queryClient.invalidateQueries({ queryKey: ['post', variables.targetId] })
      } else if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      }
    },
  })
}
