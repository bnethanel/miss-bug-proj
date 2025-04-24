import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'
const BASE_URL = '/api/bug/'

// _createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getDefaultSortBy
}

function query(filterBy = {}, sortBy = {}) {
    const filterAndSort = { ...filterBy, sortBy }
    return axios.get(BASE_URL, { params: filterAndSort })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    // return axios.get(BASE_URL + 'save', { params: bug }).then(res => res.data)

    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug).then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data)
    }
}

// function _createBugs() {
//     let bugs = utilService.loadFromStorage(STORAGE_KEY)
//     if (bugs && bugs.length > 0) return

//     bugs = [
//         {
//             title: "Infinite Loop Detected",
//             severity: 4,
//             _id: "1NF1N1T3"
//         },
//         {
//             title: "Keyboard Not Found",
//             severity: 3,
//             _id: "K3YB0RD"
//         },
//         {
//             title: "404 Coffee Not Found",
//             severity: 2,
//             _id: "C0FF33"
//         },
//         {
//             title: "Unexpected Response",
//             severity: 1,
//             _id: "G0053"
//         }
//     ]
//     utilService.saveToStorage(STORAGE_KEY, bugs)
// }

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, label: '' }
}

function getDefaultSortBy() {
    return { type: '', desc: 1 }
}