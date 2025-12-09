import { Post } from '../db/models/post.js'
import { User } from '../db/models/user.js'
import { broadcastNewRecipe } from '../socket.js'

export async function createPost(
  userId,
  { title, contents, ingredient, image, tags },
) {
  const post = new Post({
    title,
    author: userId,
    ingredient,
    image,
    contents,
    tags,
  })
  const savedPost = await post.save()
  // Broadcast new recipe to all connected clients
  broadcastNewRecipe(savedPost)

  return savedPost
}

async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Post.find(query).sort({ [sortBy]: sortOrder })
}

export async function listAllPosts(options) {
  return await listPosts({}, options)
}

export async function listPostsbyLikes(options = {}) {
  const mergedOptions = {
    sortBy: 'likesCount',
    sortOrder: 'descending',
    ...options,
  }
  return await listPosts({}, mergedOptions)
}

export async function listPostsByAuthor(authorUsername, options) {
  const user = await User.findOne({ username: authorUsername })
  if (!user) return []
  return await listPosts({ author: user._id }, options)
}

export async function listPostsByTag(tags, options) {
  return await listPosts({ tags }, options)
}

export async function getPostById(postId) {
  return await Post.findById(postId)
}

export async function updatePost(
  userId,
  postId,
  { title, author, ingredient, image, contents, tags },
) {
  return await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    { $set: { title, author, ingredient, image, contents, tags } },
    { new: true },
  )
}

export async function deletePost(userId, postId) {
  return await Post.deleteOne({ _id: postId, author: userId })
}

export async function toggleLikePost(userId, postId) {
  const post = await Post.findById(postId)
  if (!post) {
    throw new Error('Post not found')
  }

  const userIdStr = userId.toString()

  const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr)

  if (alreadyLiked) {
    // unlike
    post.likes = post.likes.filter((id) => id.toString() !== userIdStr)
  } else {
    // like
    post.likes.push(userId)
  }

  post.likesCount = post.likes.length
  await post.save()

  return post
}
