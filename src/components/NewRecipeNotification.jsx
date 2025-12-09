import { useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketIOContext.jsx'
import '../style/NewRecipeNotification.css'

export function NewRecipeNotification() {
  const { socket, status } = useSocket()
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    // Only listen when socket is connected
    if (!socket || status !== 'connected') return

    const handleNewRecipe = (recipeData) => {
      setNotification(recipeData)

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setNotification(null)
      }, 8000)
    }

    socket.on('new-recipe', handleNewRecipe)

    return () => {
      socket.off('new-recipe', handleNewRecipe)
    }
  }, [socket, status])

  const handleClose = (e) => {
    e.stopPropagation() // Prevent navigation when clicking close button
    setNotification(null)
  }

  const handleClick = () => {
    if (notification?.id) {
      window.location.href = `/posts/${notification.id}`
    }
  }

  if (!notification) return null

  return (
    <div
      className='new-recipe-notification'
      onClick={handleClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className='notification-content'>
        <div className='notification-header'>
          <span className='notification-icon'>🍳</span>
          <h3>New Recipe Posted!</h3>
          <button
            className='close-btn'
            onClick={handleClose}
            aria-label='Close'
          >
            ×
          </button>
        </div>
        <p className='notification-title'>{notification.title}</p>
        <p className='notification-time'>Just now · Click to view</p>
      </div>
    </div>
  )
}
