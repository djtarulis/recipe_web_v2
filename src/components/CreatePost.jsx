import { useState } from 'react'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutation as useGraphQLMutation } from '@apollo/client/react/index.js'
import {
  CREATE_POST,
  GET_POSTS,
  GET_POSTS_BY_AUTHOR,
} from '../api/graphql/posts.js'
import { useAuth } from '../contexts/AuthContext.jsx'
// import { createPost } from '../api/posts.js'
import { Link } from 'react-router-dom'
import slug from 'slug'

export function CreatePost() {
  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [token] = useAuth()
  const [ingredient, setIngredient] = useState(['']) // array, not string
  const [imageUrl, setImageUrl] = useState('')
  const [createPost, { loading, data }] = useGraphQLMutation(CREATE_POST, {
    variables: {
      title,
      contents,
      ingredient: ingredient.map((i) => i.trim()).filter(Boolean),
      image: imageUrl.trim() || undefined,
    },
    context: { headers: { Authorization: `Bearer ${token}` } },
    refetchQueries: [GET_POSTS, GET_POSTS_BY_AUTHOR],
  })
  /* const queryClient = useQueryClient()
  const createPostMutation = useMutation({
    mutationFn: () => createPost(token, { title, contents }),
    onSuccess: () => queryClient.invalidateQueries(['posts']),
  }) */
  const handleSubmit = (e) => {
    e.preventDefault()
    //createPostMutation.mutate()
    createPost()
  }

  const handleIngredientChange = (idx, value) => {
    setIngredient((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const addIngredientRow = () => setIngredient((prev) => [...prev, ''])

  if (!token) return <div>Please log in to create new posts.</div>
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='create-title'>Title: </label>
        <input
          type='text'
          name='create-title'
          id='create-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <br />

      <div>
        <label htmlFor='create-ingredient'>Ingredients: </label>
        <br />
        {ingredient.map((value, idx) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <input
              type='text'
              value={value}
              onChange={(e) => handleIngredientChange(idx, e.target.value)}
              placeholder={`Ingredient ${idx + 1}`}
            />
          </div>
        ))}
        <button
          type='button'
          onClick={addIngredientRow}
          style={{ marginTop: '4px' }}
        >
          + Add ingredient
        </button>
        <br />
      </div>

      <textarea
        value={contents}
        onChange={(e) => setContents(e.target.value)}
      />
      <br />

      <div>
        <label htmlFor='create-image-url'>Image URL (optional): </label>
        <br />
        <input
          type='text'
          name='create-image-url'
          id='create-image-url'
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder='https://example.com/my-image.jpg'
        />
        {imageUrl.trim() && (
          <div style={{ marginTop: '8px' }}>
            <span>Preview:</span>
            <br />
            <img
              src={imageUrl}
              alt='Post preview'
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                marginTop: '4px',
              }}
              onError={(e) => {
                // hide broken preview
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      <br />
      <input
        type='submit'
        value={loading ? 'Creating....' : 'Create'}
        disabled={!title || loading}
      />
      {data?.createPost ? (
        <>
          <br />
          Post{' '}
          <Link
            to={`/posts/${data.createPost.id}/${slug(data.createPost.title)}`}
          >
            {data.createPost.title}
          </Link>{' '}
          created successfully!
        </>
      ) : null}
    </form>
  )
}
