/**
 * Simple SQL query parser for visualization purposes.
 * Parses SELECT, INSERT, UPDATE, DELETE queries into structured steps.
 */

export function parseQuery(sql) {
    const trimmed = sql.trim().toUpperCase()

    if (trimmed.startsWith('SELECT')) return parseSelect(sql)
    if (trimmed.startsWith('INSERT')) return parseInsert(sql)
    if (trimmed.startsWith('UPDATE')) return parseUpdate(sql)
    if (trimmed.startsWith('DELETE')) return parseDelete(sql)

    return { type: 'UNKNOWN', error: 'Unsupported query type', steps: [] }
}

function parseSelect(sql) {
    const upper = sql.toUpperCase()
    const steps = []

    // Extract table name
    const fromMatch = upper.match(/FROM\s+(\w+)/i)
    const table = fromMatch ? fromMatch[1] : 'unknown'

    // Extract columns
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i)
    const columns = selectMatch ? selectMatch[1].split(',').map(c => c.trim()) : ['*']

    // Extract WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|\s*;?\s*$)/i)
    const whereClause = whereMatch ? whereMatch[1].trim() : null

    // Extract ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s*;?\s*$)/i)
    const orderBy = orderMatch ? orderMatch[1].trim() : null

    steps.push({
        id: 'scan',
        name: 'Table Scan',
        description: `Scanning table "${table}" to read all rows`,
        icon: '🔍',
    })

    if (whereClause) {
        steps.push({
            id: 'filter',
            name: 'Filtering',
            description: `Applying filter: WHERE ${whereClause}`,
            icon: '🔽',
        })
    }

    if (orderBy) {
        steps.push({
            id: 'sort',
            name: 'Sorting',
            description: `Sorting results by ${orderBy}`,
            icon: '↕️',
        })
    }

    steps.push({
        id: 'project',
        name: 'Projection',
        description: `Selecting columns: ${columns.join(', ')}`,
        icon: '📋',
    })

    steps.push({
        id: 'result',
        name: 'Result Generation',
        description: 'Building final result set',
        icon: '✅',
    })

    return { type: 'SELECT', table, columns, whereClause, orderBy, steps }
}

function parseInsert(sql) {
    const tableMatch = sql.match(/INTO\s+(\w+)/i)
    const table = tableMatch ? tableMatch[1] : 'unknown'

    return {
        type: 'INSERT',
        table,
        steps: [
            { id: 'parse', name: 'Parse Values', description: 'Parsing insert values', icon: '📝' },
            { id: 'validate', name: 'Validate Constraints', description: 'Checking constraints and data types', icon: '✔️' },
            { id: 'write', name: 'Write Row', description: `Inserting new row into "${table}"`, icon: '💾' },
            { id: 'index', name: 'Update Indexes', description: 'Updating table indexes', icon: '📇' },
            { id: 'result', name: 'Confirmation', description: 'Row inserted successfully', icon: '✅' },
        ],
    }
}

function parseUpdate(sql) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i)
    const table = tableMatch ? tableMatch[1] : 'unknown'
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*;?\s*$)/i)

    return {
        type: 'UPDATE',
        table,
        steps: [
            { id: 'scan', name: 'Table Scan', description: `Scanning "${table}" for matching rows`, icon: '🔍' },
            { id: 'filter', name: 'Filter Rows', description: whereMatch ? `WHERE ${whereMatch[1]}` : 'All rows', icon: '🔽' },
            { id: 'lock', name: 'Acquire Locks', description: 'Acquiring write locks on matching rows', icon: '🔒' },
            { id: 'update', name: 'Apply Changes', description: 'Modifying column values', icon: '✏️' },
            { id: 'result', name: 'Commit', description: 'Changes committed successfully', icon: '✅' },
        ],
    }
}

function parseDelete(sql) {
    const tableMatch = sql.match(/FROM\s+(\w+)/i)
    const table = tableMatch ? tableMatch[1] : 'unknown'

    return {
        type: 'DELETE',
        table,
        steps: [
            { id: 'scan', name: 'Table Scan', description: `Scanning "${table}"`, icon: '🔍' },
            { id: 'filter', name: 'Identify Rows', description: 'Finding rows to delete', icon: '🔽' },
            { id: 'lock', name: 'Acquire Locks', description: 'Acquiring exclusive locks', icon: '🔒' },
            { id: 'delete', name: 'Remove Rows', description: 'Deleting matched rows', icon: '🗑️' },
            { id: 'cleanup', name: 'Cleanup', description: 'Updating indexes and freeing space', icon: '🧹' },
            { id: 'result', name: 'Confirmation', description: 'Rows deleted successfully', icon: '✅' },
        ],
    }
}
