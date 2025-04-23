import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { makePdfService } from './services/makePdf.service.js'



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


// app.get('/api/bug/save', (req, res) => {
//     const bugToSave = {
//         _id: req.query._id,
//         title: req.query.title,
//         description: req.query.description,
//         severity: req.query.severity

//     }
//     bugService.save(bugToSave)
//         .then(savedBug => {
//             makePdfService.makeBugPdf()
//             res.send(savedBug)
//         })
//         .catch(err => {
//             loggerService.error('Cannot save bug', err)
//             res.status(400).send('Cannot save bug')
//         })
// })

app.post('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels,
        severity: req.body.severity
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* Edit
app.put('/api/bug/:bugId', (req, res) => {
    // const { carId } = req.params
    loggerService.info('req.body:', req.body)

    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels,
        severity: req.body.severity
    }
    loggerService.info('bugToSave:', bugToSave)
    bugService.save(bugToSave)
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
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            makePdfService.makeBugPdf()
            res.send(`Bug removed - ${bugId}`)
        })
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})

//  app.get('/cookies', (req, res) => {
//     let visitedBugs = req.cookies.visitedBugs || 0
//     visitedBugs++
//     // console.log('visitedCount:', visitedCount)
//     res.cookie('visitedCount', visitedCount, { maxAge: 20 * 1000 })
//     console.log('visitedCount:', visitedCount)
//     // res.send(`Hello Puki - ${visitedCount}`)
// })

