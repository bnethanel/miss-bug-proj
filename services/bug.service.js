import fs from 'fs'
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bug.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = { txt: '', label: '', minSeverity: 0, sortBy: {} }) {
    console.log(filterBy)

    const filterLabels = filterBy.label.split(',') || []

    let bugToDisplay = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugToDisplay = bugToDisplay.filter(bug => regExp.test(bug.title))
    }
    if (filterBy.minSeverity) {
        bugToDisplay = bugToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE // 0,3,6,9
        bugToDisplay = bugToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
    }
    if (filterBy.label) {
        // const regExp = new RegExp(filterBy.label, 'i')

        const splitLabels = filterBy.label.split(',')
        // console.log(splitLabels, filterBy.label)

        bugToDisplay = bugToDisplay.filter(bug => {
            return bug.labels.some(label => {
                return splitLabels.includes(label)
                // console.log('label: ', label)
                // console.log('splitLabels: ', splitLabels)
                // splitLabels.includes(label) ? console.log('true') : console.log('false')
            })
            // console.log(bugToDisplay)
            // console.log(bug.labels)
        }

        )



    }

    const sortBy = filterBy.sortBy.type
    const sortDir = +filterBy.sortBy.desc

    if (sortBy === 'createdAt') {
        bugToDisplay.sort((a, b) => (a.createdAt - b.createdAt) * sortDir)
    } else if (sortBy === 'title') {
        bugToDisplay.sort((a, b) => a.title.localeCompare(b.title) * sortDir)
    } else if (sortBy === 'severity') {
        bugToDisplay.sort((a, b) => (a.severity - b.severity) * sortDir)
    }
    console.log('sortBy:', sortBy, '| sortDir:', sortDir)


    return Promise.resolve(bugToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    if (!loggedinUser.isAdmin &&
        loggedinUser._id !== bugs[bugIdx].owner._id) {
        return Promise.reject(`Not your bug`)
    }
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave, loggedinUser) {
    console.log(loggedinUser)
    const { fullname, _id } = loggedinUser
    if (bugToSave._id) {

        if (!loggedinUser.isAdmin &&
            loggedinUser._id !== bugToSave.owner._id) {
            return Promise.reject(`Not your bug`)
        }
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, earum sed corrupti voluptatum voluptatem at.'
        bugToSave.labels = ['noncritical', 'no-CR', 'dev-branch-admin']
        bugToSave.owner = { fullname, _id }
        bugs.push(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}