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

    function onTogglePagination() {
        setFilterBy(prevFilter => {
            return {
                ...prevFilter,
                pageIdx: (prevFilter.pageIdx === undefined) ? 0 : undefined
            }
        })
    }

    function onChangePage(diff) {
        if (filterBy.pageIdx === undefined) return
        setFilterBy(prevFilter => {
            let nextPageIdx = prevFilter.pageIdx + diff
            if (nextPageIdx < 0) nextPageIdx = 0
            return { ...prevFilter, pageIdx: nextPageIdx }
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
        setFilterBy(prevFilter => {
            if (prevFilter.pageIdx !== undefined) prevFilter.pageIdx = 0
            return { ...prevFilter, ...filterBy }
        })
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <BugSort onSetSort={onSetSort} sortBy={sortBy} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>

        <section>
            <button onClick={onTogglePagination}>Toggle Pagination</button>
            <button onClick={() => onChangePage(-1)}>-</button>
            {filterBy.pageIdx + 1 || 'No Pagination'}
            <button onClick={() => onChangePage(1)}>+</button>
        </section>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}
