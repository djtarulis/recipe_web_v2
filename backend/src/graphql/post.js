import { getUserInfoById } from '../services/users.js'
export const postSchema = `#graphql
type Post {
            id: ID!
            title: String!
            author: User
            image: String
            ingredient: [String!]
            contents: String
            tags: [String!]
            createdAt: Float
            updatedAt: Float
            likesCount: Int!
            likedByMe: Boolean!
        }
        `

export const postResolver = {
  Post: {
    author: async (post) => {
      return await getUserInfoById(post.author)
    },
    // whether the *current* user has liked this post
    likedByMe: (post, args, { auth }) => {
      if (!auth) return false
      if (!post.likes) return false
      return post.likes.some((id) => id.toString() === auth.sub.toString())
    },
  },
}
