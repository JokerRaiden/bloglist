const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [{
	title: "React patterns",
	author: "Michael Chan",
	url: "https://reactpatterns.com/",
	likes: 7
},
{
	title: "Go To Statement Considered Harmful",
	author: "Edsger W. Dijkstra",
	url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
	likes: 5
},
{
	title: "Canonical string reduction",
	author: "Edsger W. Dijkstra",
	url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
	likes: 12
},
{
	title: "First class tests",
	author: "Robert C. Martin",
	url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
	likes: 10
},
{
	title: "TDD harms architecture",
	author: "Robert C. Martin",
	url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
	likes: 0
},
{
	title: "Type wars",
	author: "Robert C. Martin",
	url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
	likes: 2
}]

const testUsers = async () => {
	const saltRounds = 10
	const passwordHash = await bcrypt.hash('password', saltRounds)

	return [
		{
			name: 'tero testaaja',
			username: 'testuser1',
			passwordHash
		},
		{
			name: 'tiina testaaja',
			username: 'testuser2',
			passwordHash
		}
	]
}

const nonExistingId = async () => {
  const blog = new Blog({
    title: "remove",
    author: "test",
    url: "google.fi",
    likes: 0
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(user => user.toJSON())
}

module.exports = {
	initialBlogs,
	nonExistingId,
	blogsInDb,
	usersInDb,
	testUsers
}