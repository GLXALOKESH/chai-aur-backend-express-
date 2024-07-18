import "dotenv/config"
import express from "express"
const app = express()
const port = 3000

const names = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
    { id: 4, name: "David" },
    { id: 5, name: "Eve" },
    { id: 6, name: "Frank" }]

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/names',(req,res) =>{
    res.json(names)
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})