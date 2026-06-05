import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import knowledgeRoutes from './routes/knowledgeRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3000)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/knowledge', knowledgeRoutes)

app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Server error'
  })
})

app.listen(port, () => {
  console.log(`Network internship backend listening on port ${port}`)
})
