const express = require('express')
const PORT = 8080

const app = express()
console.log(PORT,'port')

app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.listen(PORT, ()=>{
    console.log(`Server running at port ${PORT}`);
})