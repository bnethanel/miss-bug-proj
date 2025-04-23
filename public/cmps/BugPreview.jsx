export function BugPreview({ bug }) {
    return <article className="bug-preview">
        <p className="title">{bug.title}</p>
        <p>Severity: <span>{bug.severity}</span></p>
        <p>Description: <span>{bug.description}</span></p>
        <p>
            Created At: <span>{new Date(bug.createdAt).toLocaleDateString('he')}</span>
        </p>
    </article>
}