import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { Link } from 'react-router-dom'

import slug from 'slug'

export function Post({
  title,
  contents,
  ingredient = [],
  author,
  image,
  id,
  fullPost = false,
}) {
  const ingredients = Array.isArray(ingredient)
    ? ingredient
    : typeof ingredient === 'string' && ingredient.trim()
      ? [ingredient]
      : []

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
}
