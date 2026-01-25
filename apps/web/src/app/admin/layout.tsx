import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>管理画面</h1>
        <div className="admin-header-right">
          <span className="user-email">{session.user.email}</span>
          <LogoutButton />
          <Link href="/" className="back-link">← フィードに戻る</Link>
        </div>
      </header>
      {children}
    </div>
  )
}
