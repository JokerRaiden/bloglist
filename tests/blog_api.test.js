const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blog id is defined properly', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('blog can be added', async () => {
  const newBlog = {
    title: "New blog",
    author: "Testaaja",
    url: "www.google.fi",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContainEqual(
      newBlog.title
    )
})

test('likes default to zero', async () => {
  const newBlog = {
    title: "New blog",
    author: "Testaaja",
    url: "www.google.fi"
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const lastBlog = blogsAtEnd.pop()
    expect(lastBlog.likes).toEqual(0)
})

test('missing title or url returns bad request', async () => {
  const titleMissing = {
    author: "Testaaja",
    url: "www.google.fi",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(titleMissing)
    .expect(400)

  const urlMissing = {
    title: "Url missing",
    author: "Testaaja",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(urlMissing)
    .expect(400)

  const bothMissing = {
    author: "Testaaja",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(bothMissing)
    .expect(400)
})

test('blog is deleted', async () => {
  const blogs = await helper.blogsInDb()
  const blogToDelete = blogs[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd.length).toEqual(helper.initialBlogs.length - 1)
})

test('blog is updated', async () => {
  const blogs = await helper.blogsInDb()
  const blogToUpdate = blogs[0]

  const newValues = {
    author: blogToUpdate.author,
    title: blogToUpdate.title,
    url: blogToUpdate.url,
    likes: 100
  }

  await api.put(`/api/blogs/${blogToUpdate.id}`).send(newValues)

  const blogsAtEnd = await helper.blogsInDb()
  const updatedBlog = blogsAtEnd[0]

  expect(updatedBlog.likes).toEqual(newValues.likes)
})

afterAll(() => {
  mongoose.connection.close()
})