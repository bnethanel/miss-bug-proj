import fs from 'fs'
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {

    let bugToDisplay = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugToDisplay = bugToDisplay.filter(bug => regExp.test(bug.title))
    }
    if (filterBy.minSeverity) {
        bugToDisplay = bugToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    const sortBy = filterBy.sortBy
    if (sortBy.type === 'createdAt') {
        bugToDisplay.sort((b1, b2) => (sortBy.desc) * (b1.createdAt - b2.createdAt))
    } else if (sortBy.type === 'title') {
        bugToDisplay.sort((b1, b2) => (sortBy.desc) * (b1.title.localeCompare(b2.title)))
    } else if (sortBy.type === 'severity') {
        bugToDisplay.sort((b1, b2) => (sortBy.desc) * (b1.severity.localeCompare(b2.severity)))
    }


    return Promise.resolve(bugToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, earum sed corrupti voluptatum voluptatem at.'
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