import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useMutation as useGraphQLMutation } from '@apollo/client/react/index.js'
import {
  TOGGLE_LIKE_POST,
  GET_POSTS,
  GET_POSTS_BY_AUTHOR,
} from '../api/graphql/posts.js'
import { useAuth } from '../contexts/AuthContext.jsx'

import slug from 'slug'

export function Post({
  title,
  contents,
  ingredient = [],
  author,
  image,
  id,
  fullPost = false,
  likesCount = 0,
  likedByMe = false,
}) {
  const ingredients = Array.isArray(ingredient)
    ? ingredient
    : typeof ingredient === 'string' && ingredient.trim()
      ? [ingredient]
      : []

  const [token] = useAuth()

  // Local state for LIKE UI only
  const [localLiked, setLocalLiked] = useState(likedByMe)
  const [localCount, setLocalCount] = useState(likesCount)

  useEffect(() => {
    setLocalLiked(likedByMe)
    setLocalCount(likesCount)
  }, [token, id])

  const [toggleLike] = useGraphQLMutation(TOGGLE_LIKE_POST, {
    variables: { postId: id },
    context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    // You can keep these if you want lists to refresh, but they won't
    // affect this component's local state anymore:
    refetchQueries: [GET_POSTS, GET_POSTS_BY_AUTHOR],
  })

  const handleLikeClick = async () => {
    if (!token) return

    // Save old values in case we want to revert on error
    const prevLiked = localLiked
    const prevCount = localCount

    // Optimistically update local UI
    const nextLiked = !prevLiked
    const nextCount = prevCount + (nextLiked ? 1 : -1)
    setLocalLiked(nextLiked)
    setLocalCount(nextCount)

    try {
      await toggleLike()
    } catch (err) {
      console.error('Error toggling like', err)
      // Revert UI if server call failed
      setLocalLiked(prevLiked)
      setLocalCount(prevCount)
    }
  }

  return (
    <article>
      {fullPost ? (
        <h3>{title}</h3>
      ) : (
        <Link to={`/posts/${id}/${slug(title)}`}>
          <h3>{title}</h3>
        </Link>
      )}
      {fullPost && <div>{contents}</div>}

      {fullPost && image && image.trim() !== '' && (
        <div style={{ margin: '10px 0' }}>
          <img
            src={image}
            alt='Post illustration'
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              borderRadius: '6px',
            }}
            onError={(e) => {
              // Hide element if URL is broken
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {fullPost && ingredients.length > 0 && (
        <ul>
          {ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '8px' }}>
        {fullPost ? (
          <>
            <button
              type='button'
              onClick={handleLikeClick}
              disabled={!token}
              style={{ marginRight: '8px' }}
            >
              {localLiked ? 'Unlike' : 'Like'} ({localCount ?? 0})
            </button>
            {!token && <small>Log in to like this post.</small>}
          </>
        ) : (
          <small>
            {localCount ?? 0} {localCount === 1 ? 'like' : 'likes'}
          </small>
        )}
      </div>

      {author && (
        <em>
          {fullPost && <br />}
          Written by <User {...author} />
        </em>
      )}
    </article>
  )
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  ingredient: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  image: PropTypes.string,
  author: PropTypes.shape(User.propTypes),
  id: PropTypes.string.isRequired,
  fullPost: PropTypes.bool,
  likesCount: PropTypes.number,
  likedByMe: PropTypes.bool,
}
