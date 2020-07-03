const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce( (sum, blog) => sum + blog.likes, 0 )
}

const favoriteBlog = (blogs) => {
  if (blogs && blogs.length > 0) {
    return blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
  }
  else {
    return null
  }
}

const mostBlogs = (blogs) => {
  let tally = _.reduce(blogs, (result, blog) => {
    result[blog.author] = (result[blog.author] || 0) + 1
    return result
  }, {})

  let winner = _.maxBy(_.keys(tally), (author) => tally[author])

  return {
    author: winner,
    blogs: tally[winner]
  }
}

const mostLikes = (blogs) => {
  let tally = _.reduce(blogs, (result, blog) => {
    result[blog.author] = (result[blog.author] || 0) + blog.likes
    return result
  }, {})

  let winner = _.maxBy(_.keys(tally), (author) => tally[author])

  return {
    author: winner,
    likes: tally[winner]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}