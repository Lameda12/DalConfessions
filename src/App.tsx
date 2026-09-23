import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ComposeProvider } from '@/context/ComposeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { FeedPage } from '@/pages/FeedPage'
import { PostDetailPage } from '@/pages/PostDetailPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { SearchPage } from '@/pages/SearchPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ComposeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<FeedPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<FeedPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ComposeProvider>
    </QueryClientProvider>
  )
}

export default App
