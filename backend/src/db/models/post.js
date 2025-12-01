import mongoose, { Schema } from 'mongoose'
const postSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    ingredient: { type: [String], default: [] },
    contents: { type: String, required: true },
    image: { type: String },
    tags: [String],
    likes: { type: [Schema.Types.ObjectId], ref: 'user', default: [] },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)
export const Post = mongoose.model('post', postSchema)
