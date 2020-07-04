const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let testUser = null

describe('when there is two test users and six initial blogs', () => {
  beforeAll(async () => {
    await User.deleteMany({})
    await User.insertMany(await helper.testUsers())

    const login = {
      username: "testuser1",
      password: "password"
    }

    const loggedIn = await api
      .post('/api/login')
      .send(login)

    testUser = loggedIn.body
  })
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
      .set('Authorization', `bearer ${testUser.token}`)
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

  test('blog can\'t be added without token', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const newBlog = {
      title: "New blog",
      author: "Testaaja",
      url: "www.google.fi",
      likes: 6
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    
    expect(response.body.error).toContain('invalid token')
    
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
  
  test('likes default to zero', async () => {
    const newBlog = {
      title: "New blog",
      author: "Testaaja",
      url: "www.google.fi"
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testUser.token}`)
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
      .set('Authorization', `bearer ${testUser.token}`)
      .send(titleMissing)
      .expect(400)
  
    const urlMissing = {
      title: "Url missing",
      author: "Testaaja",
      likes: 6
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testUser.token}`)
      .send(urlMissing)
      .expect(400)
  
    const bothMissing = {
      author: "Testaaja",
      likes: 6
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testUser.token}`)
      .send(bothMissing)
      .expect(400)
  })
  
  test('blog is deleted', async () => {
    const blogToAdd = {
      title: "I'm deleted soon",
      author: "Testaaja",
      url: "www.google.fi"
    }
  
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testUser.token}`)
      .send(blogToAdd)
      .expect(201)

    const addedBlog = response.body

    await api
      .delete(`/api/blogs/${addedBlog.id}`)
      .set('Authorization', `bearer ${testUser.token}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd.length).toEqual(helper.initialBlogs.length)
  })
  
  test('blog is updated', async () => {
    const blogToAdd = {
      title: "I'm updated soon",
      author: "Testaaja",
      url: "www.google.fi"
    }
  
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testUser.token}`)
      .send(blogToAdd)
      .expect(201)

    const addedBlog = response.body

    const newValues = {
      author: addedBlog.author,
      title: addedBlog.title,
      url: addedBlog.url,
      likes: 100
    }
  
    const updatedResponse = await api
      .put(`/api/blogs/${addedBlog.id}`)
      .set('Authorization', `bearer ${testUser.token}`)
      .send(newValues)
  
    const updatedBlog = updatedResponse.body
  
    expect(updatedBlog.likes).toEqual(newValues.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})