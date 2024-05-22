const express = require('express')
const {open} = require('sqlite')
const sqlit3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
const app = express()
const bcrpt = require('bcrypt')
app.use(express.json())
let db = null
const convertTODBObj = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlit3.Database,
    })
    app.listen(3000, () => {
      console.log(`server is started`)
    })
  } catch (e) {
    console.log(`eror occures`)
  }
}
convertTODBObj()
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  let passle = password.length
  const encrppass = await bcrpt.hash(request.body.password, 10)
  const userquery = `SELECT * FROM user where username='${username}';`
  const runquery = await db.get(userquery)
  if (passle < 5) {
    response.status(400)
    response.send(`Password is too short`)
  } else if (runquery !== undefined) {
    response.status(400)
    response.send(`User already exists`)
  } else if (runquery === undefined) {
    const createquery = `INSERT INTO user(username,name,password,gender,location) VALUES ('${username}','${name}','${encrppass}','${gender}','${location}');`
    const runq = await db.run(createquery)
    response.status(200)
    response.send('User created successfully')
  }
})
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const sqlquery = `SELECT * FROM user WHERE username='${username}';`
  const excute = await db.get(sqlquery)
  if (excute === undefined) {
    response.status(400)
    response.send(`Invalid user`)
  } else {
    const ispassword = await bcrpt.compare(password, excute.password)
    if (ispassword === true) {
      response.status(200)
      response.send(`Login success!`)
    } else {
      response.status(400)
      response.send(`Invalid password`)
    }
  }
})
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const sqlqu = `SELECT * FROM user WHERE username='${username}';`

  const exr = await db.get(sqlqu)

  if (exr === undefined) {
    response.status(400)
    response.send(`INVALID USER`)
  } else {
    const verifypasss = await bcrpt.compare(oldPassword, exr.password)
    if (verifypasss === true) {
      let passl = newPassword.length
      if (passl < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const passhash = await bcrpt.hash(newPassword, 10)
        const sqlquer = `UPDATE user SET (password='${passhash}) WHERE username='${username}';`
        const qer = await db.run(sqlquer)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})
module.exports = app
