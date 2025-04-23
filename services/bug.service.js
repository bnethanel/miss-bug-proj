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

function query(filterBy = { txt: '', minSeverity: 0, sortBy: {} }) {

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
        bugToSave.labels = ['noncritical', 'no-CR', 'dev-branch-admin']
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