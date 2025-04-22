import { utilService } from './util.service.js'
import PDFDocument from 'pdfkit-table'
import fs from 'fs'

export const makePdfService = {
    makeBugPdf
}

function makeBugPdf() {
    const bugInfo = utilService.readJsonFile('data/bug.json')

    const rows = bugInfo.map(bug => {
        const title = bug.title;
        const description = bug.description;
        const severity = bug.severity;
        return [title, description, severity];
    })

    // init document
    let doc = new PDFDocument({ margin: 30, size: 'A4' })
    // connect to a write stream
    doc.pipe(fs.createWriteStream('./bugs.pdf'))
    createPdf(doc)
        .then(() => doc.end()) // close document
    function createPdf() {
        const table = {
            title: 'bugs',
            subtitle: 'Sorted by bugs',
            headers: ['Title', 'Description', 'Title'],
            rows: rows,
        }
        return doc.table(table, { columnsSize: [200, 200, 100] })
    }
}