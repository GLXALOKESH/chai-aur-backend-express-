import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from "axios"
import './App.css'

function App() {
  const [data, setData] = useState([])
  useEffect(() => {
    axios.get("/api/names")
    .then((responce)=>{
        setData(responce.data)
    })
    .catch((err)=>{
      console.log(err)
    })
  }, [])
    

  return (
    <>
      <h1>There is the names</h1>
      {data.map((item,index)=>{
        return <div key={item.id}>{item.name}</div>
        
      })}
    </>
  )
}

export default App
