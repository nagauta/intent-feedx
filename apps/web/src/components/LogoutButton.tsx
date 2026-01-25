'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  )
}
