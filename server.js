import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { makePdfService } from './services/makePdf.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'



const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// app.get('/', (req, res) => res.send('Hello there!!'))

const port = 3030

app.listen(port, () => loggerService.info(`Server ready at http://127.0.0.1:${port}`))


app.get('/api/bug', (req, res) => {
    // makePdfService.makeBugPdf()
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        pageIdx: req.query.pageIdx,
        label: req.query.label || '',
        sortBy: req.query.sortBy ? JSON.parse(req.query.sortBy) : {}
    }
    console.log(filterBy)
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot load bugs')
        })
})

app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't add bug`)

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels,
        severity: req.body.severity
    }

    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* Edit
app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't add bug`)

    loggerService.info('req.body:', req.body)

    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels,
        createdAt: req.body.createdAt,
        severity: req.body.severity,
        owner: req.body.owner
    }
    // console.log('createdAt', bugToSave)
    // loggerService.info('bugToSave:', bugToSave)
    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const { visitedBugs = [] } = req.cookies

    if (visitedBugs.length >= 3) {
        return res.status(401).send('Wait for a bit')
    }

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 20 })
    loggerService.info(visitedBugs)


    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't remove bug`)
    console.log(loggedinUser)

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => {
            makePdfService.makeBugPdf()
            res.send(`Bug removed - ${bugId}`)
        })
        .catch(err => {
            console.log(err)
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})

////////////////////// Copy from inClass

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

//* Auth API
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    authService.checkLogin({ username, password })
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const { username, password, fullname } = req.body
    userService.add({ username, password, fullname })
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => {
            console.log('err:', err)
            res.status(400).send('Username taken.')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})