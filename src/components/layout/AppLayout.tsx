import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { ComposeFab } from './ComposeFab'
import { Sidebar } from './Sidebar'
import { StandardsPopup } from '@/components/common/StandardsPopup'
import { ComposeModal } from '@/components/compose/ComposeModal'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 pb-28 pt-5 md:px-6 md:pb-10 lg:gap-10">
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
        <Sidebar />
      </div>
      <ComposeFab />
      <BottomNav />
      <StandardsPopup />
      <ComposeModal />
    </div>
  )
}
