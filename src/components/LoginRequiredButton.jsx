'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginRequiredButton({ 
  children, 
  onClick, 
  className = '', 
  message = 'Please sign in to access this feature' 
}) {
  const { user } = useAuth()
  const router = useRouter()

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault()
      alert(message)
      router.push('/login')
      return
    }
    
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button 
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}


