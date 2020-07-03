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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}