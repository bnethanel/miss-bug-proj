const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { BugSort } from '../cmps/BugSort.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState(bugService.getDefaultSortBy())

    useEffect(() => {
        loadBugs()
    }, [filterBy, sortBy])

    function loadBugs() {
        bugService.query(filterBy, sortBy)
            .then(bugs => {
                setBugs(bugs)
            })
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3),
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onSetSort(sortBy) {
        setSortBy(prevSort => ({ ...prevSort, ...sortBy }))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <BugSort onSetSort={onSetSort} sortBy={sortBy} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}
