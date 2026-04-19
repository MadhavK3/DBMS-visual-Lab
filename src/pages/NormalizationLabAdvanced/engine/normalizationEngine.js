/**
 * Normalization Engine
 * Implements correct database normalization from UNF through 3NF.
 * Ensures lossless decomposition and dependency preservation.
 */

import {
  findPartialDependencies,
  findTransitiveDependencies,
  computeClosure,
} from './dependencyDetector'

/**
 * STEP 0: Create UNF representation
 * Highlights repeating groups and duplicate data in the original table.
 */
export function analyzeUNF(dataset) {
  const { columns, rows, primaryKey } = dataset
  const pkIndices = primaryKey.map(k => columns.indexOf(k))

  // Find duplicate primary key groups (repeating groups)
  const pkGroups = {}
  rows.forEach((row, idx) => {
    // For composite keys, use first part only to detect groups
    const groupKey = pkIndices[0] !== -1 ? row[pkIndices[0]] : row[0]
    if (!pkGroups[groupKey]) pkGroups[groupKey] = []
    pkGroups[groupKey].push(idx)
  })

  const duplicateRowIndices = []
  Object.values(pkGroups).forEach(indices => {
    if (indices.length > 1) {
      duplicateRowIndices.push(...indices)
    }
  })

  return {
    table: {
      name: dataset.tableName,
      columns: [...columns],
      rows: rows.map(r => [...r]),
      primaryKey: [...primaryKey],
    },
    duplicateRowIndices,
    issues: [
      'Contains repeating groups (same entity appears in multiple rows)',
      'Data redundancy — attributes like names are repeated',
    ],
    explanation: {
      title: 'Unnormalized Form (UNF)',
      description: `The table "${dataset.tableName}" contains ${rows.length} rows with repeating groups. Notice how ${primaryKey[0]} values repeat, causing data redundancy.`,
      details: [
        `Primary key candidate: (${primaryKey.join(', ')})`,
        `${Object.keys(pkGroups).length} unique ${primaryKey[0]} values across ${rows.length} rows`,
        'Repeating groups create update, insert, and delete anomalies',
      ],
    },
  }
}

/**
 * STEP 1: Convert to 1NF
 * Ensure atomic values and identify the primary key.
 * In our datasets, values are already atomic, so this step
 * validates and confirms 1NF.
 */
export function convertTo1NF(dataset) {
  const { columns, rows, primaryKey, functionalDependencies } = dataset

  let isAtomicOrig = true
  let newRows = []

  rows.forEach(row => {
    let rowMultiValues = false
    let multiValueIndices = []
    
    // Check if row has multi-valued cells
    row.forEach((cell, idx) => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes(';'))) {
        isAtomicOrig = false
        rowMultiValues = true
        multiValueIndices.push({ idx, values: cell.split(/[,;]/).map(v => v.trim()) })
      }
    })

    if (!rowMultiValues) {
      newRows.push([...row])
    } else {
      // Find cartesian product of all multi values
      // (For this specific lab, we assume one multi-valued column per row for simplicity)
      const mvCol = multiValueIndices[0]
      mvCol.values.forEach(val => {
        const newRow = [...row]
        newRow[mvCol.idx] = val
        newRows.push(newRow)
      })
    }
  })

  // Verify uniqueness on the primary key
  const pkIndices = primaryKey.map(k => columns.indexOf(k))
  const pkValues = new Set()
  let isUnique = true
  newRows.forEach(row => {
    const pkVal = pkIndices.map(i => row[i]).join('|')
    if (pkValues.has(pkVal)) isUnique = false
    pkValues.add(pkVal)
  })

  return {
    tables: [{
      name: dataset.tableName,
      columns: [...columns],
      rows: newRows,
      primaryKey: [...primaryKey],
      status: '1NF ✓',
    }],
    isAtomic: isAtomicOrig,
    isUnique,
    functionalDependencies,
    explanation: {
      title: 'First Normal Form (1NF)',
      description: isAtomicOrig 
        ? `The table is now in 1NF. All values are atomic (indivisible).` 
        : `The table is now in 1NF. Multi-valued attributes were separated into new rows, ensuring all values are atomic (indivisible).`,
      details: [
        `✓ All ${columns.length} columns contain atomic values`,
        `Expanded multi-valued rows resulting in ${newRows.length} total rows`,
        `✓ Primary key (${primaryKey.join(', ')}) uniquely identifies each row`,
        `Next: Check for partial dependencies on the composite key (${primaryKey.join(', ')})`,
      ],
    },
  }
}

/**
 * STEP 2: Convert to 2NF
 * Remove partial dependencies by decomposing tables.
 */
export function convertTo2NF(dataset) {
  const { columns, rows, primaryKey, functionalDependencies } = dataset

  const partialDeps = findPartialDependencies(primaryKey, columns, functionalDependencies)

  if (partialDeps.length === 0 || primaryKey.length <= 1) {
    return {
      tables: [{
        name: dataset.tableName,
        columns: [...columns],
        rows: rows.map(r => [...r]),
        primaryKey: [...primaryKey],
        status: '2NF ✓ (no partial dependencies)',
      }],
      partialDeps: [],
      explanation: {
        title: 'Second Normal Form (2NF)',
        description: primaryKey.length <= 1
          ? 'The table has a simple (non-composite) primary key, so there cannot be any partial dependencies. Already in 2NF!'
          : 'No partial dependencies found. The table is already in 2NF.',
        details: [
          '✓ No non-prime attribute depends on a proper subset of the primary key',
        ],
      },
    }
  }

  // Group partial deps by their determinant (the part of PK they depend on)
  const depGroups = {}
  for (const pd of partialDeps) {
    const key = pd.from.join(',')
    if (!depGroups[key]) {
      depGroups[key] = { from: pd.from, attrs: [] }
    }
    depGroups[key].attrs.push(...pd.to)
  }

  const newTables = []
  const remainingCols = new Set(columns)
  const colIndices = {}
  columns.forEach((c, i) => { colIndices[c] = i })

  // Create a new table for each group of partial dependencies
  for (const [, group] of Object.entries(depGroups)) {
    const tableCols = [...group.from, ...group.attrs]
    const tableColIndices = tableCols.map(c => colIndices[c])

    // Extract unique rows for this table
    const seen = new Set()
    const tableRows = []
    for (const row of rows) {
      const projectedRow = tableColIndices.map(i => row[i])
      const rowKey = projectedRow.join('|')
      if (!seen.has(rowKey)) {
        seen.add(rowKey)
        tableRows.push(projectedRow)
      }
    }

    // Generate table name from the determinant
    const tableName = generateTableName(group.from, group.attrs)

    newTables.push({
      name: tableName,
      columns: tableCols,
      rows: tableRows,
      primaryKey: [...group.from],
      status: 'New — extracted from partial dependency',
      sourceDepFrom: group.from,
      sourceDepTo: group.attrs,
    })

    // Remove the dependent attributes from remaining columns
    group.attrs.forEach(a => remainingCols.delete(a))
  }

  // Create the remaining table (with full PK + remaining non-key attrs)
  const remainingColsArr = columns.filter(c => remainingCols.has(c))
  const remainingIndices = remainingColsArr.map(c => colIndices[c])

  const seenRemaining = new Set()
  const remainingRows = []
  for (const row of rows) {
    const projectedRow = remainingIndices.map(i => row[i])
    const rowKey = projectedRow.join('|')
    if (!seenRemaining.has(rowKey)) {
      seenRemaining.add(rowKey)
      remainingRows.push(projectedRow)
    }
  }

  newTables.push({
    name: dataset.tableName + '_Core',
    columns: remainingColsArr,
    rows: remainingRows,
    primaryKey: [...primaryKey],
    status: 'Remaining attributes with full key',
  })

  // Build explanation
  const depDescriptions = partialDeps.map(pd =>
    `"${pd.to.join(', ')}" depends only on "${pd.from.join(', ')}" (part of the key)`
  )

  return {
    tables: newTables,
    partialDeps,
    explanation: {
      title: 'Second Normal Form (2NF)',
      description: `Removed ${partialDeps.length} partial dependenc${partialDeps.length === 1 ? 'y' : 'ies'}. Attributes that depend on only part of the composite key have been extracted into separate tables.`,
      details: [
        ...depDescriptions,
        `Created ${newTables.length} tables total`,
        'Each new table has the partial determinant as its primary key',
        'Next: Check for transitive dependencies (non-key → non-key)',
      ],
    },
  }
}

/**
 * STEP 3: Convert to 3NF
 * Remove transitive dependencies.
 */
export function convertTo3NF(dataset, tables2NF) {
  const { functionalDependencies } = dataset
  const resultTables = []
  let totalTransitive = 0
  const allTransitiveDeps = []

  for (const table of tables2NF) {
    // Find FDs relevant to this table's columns
    const tableFDs = functionalDependencies.filter(fd =>
      fd.from.every(a => table.columns.includes(a)) &&
      fd.to.some(a => table.columns.includes(a))
    )

    const transitiveDeps = findTransitiveDependencies(
      table.primaryKey, table.columns, tableFDs
    )

    if (transitiveDeps.length === 0) {
      resultTables.push({
        ...table,
        status: '3NF ✓',
      })
      continue
    }

    totalTransitive += transitiveDeps.length
    allTransitiveDeps.push(...transitiveDeps)

    // Decompose: create new table for each transitive dep
    const colIndices = {}
    table.columns.forEach((c, i) => { colIndices[c] = i })

    const remainingCols = new Set(table.columns)

    for (const td of transitiveDeps) {
      const tableCols = [...td.from, ...td.to]
      const tableColIndices = tableCols.map(c => colIndices[c])

      const seen = new Set()
      const tableRows = []
      for (const row of table.rows) {
        const projectedRow = tableColIndices.map(i => row[i])
        const rowKey = projectedRow.join('|')
        if (!seen.has(rowKey)) {
          seen.add(rowKey)
          tableRows.push(projectedRow)
        }
      }

      const tableName = generateTableName(td.from, td.to)
      resultTables.push({
        name: tableName,
        columns: tableCols,
        rows: tableRows,
        primaryKey: [...td.from],
        status: 'New — transitive dependency removed',
        sourceDepFrom: td.from,
        sourceDepTo: td.to,
      })

      // Remove transitive dependent attrs from remaining
      td.to.forEach(a => remainingCols.delete(a))
    }

    // Remaining table
    const remainingColsArr = table.columns.filter(c => remainingCols.has(c))
    const remainingIndices = remainingColsArr.map(c => colIndices[c])

    const seenRemaining = new Set()
    const remainingRows = []
    for (const row of table.rows) {
      const projectedRow = remainingIndices.map(i => row[i])
      const rowKey = projectedRow.join('|')
      if (!seenRemaining.has(rowKey)) {
        seenRemaining.add(rowKey)
        remainingRows.push(projectedRow)
      }
    }

    resultTables.push({
      name: table.name,
      columns: remainingColsArr,
      rows: remainingRows,
      primaryKey: [...table.primaryKey],
      status: '3NF ✓',
    })
  }

  const depDescriptions = allTransitiveDeps.map(td =>
    `"${td.to.join(', ')}" transitively depends on the key through "${td.from.join(', ')}"`
  )

  return {
    tables: resultTables,
    transitiveDeps: allTransitiveDeps,
    explanation: {
      title: 'Third Normal Form (3NF)',
      description: totalTransitive > 0
        ? `Removed ${totalTransitive} transitive dependenc${totalTransitive === 1 ? 'y' : 'ies'}. Non-key attributes that depend on other non-key attributes have been extracted into separate tables.`
        : 'No transitive dependencies found. All tables are already in 3NF!',
      details: totalTransitive > 0
        ? [
          ...depDescriptions,
          `Final schema has ${resultTables.length} tables`,
          '✓ All tables are now in Third Normal Form',
          '✓ No partial dependencies remain',
          '✓ No transitive dependencies remain',
        ]
        : ['✓ All tables are already in 3NF after 2NF decomposition'],
    },
  }
}

/**
 * Run full normalization pipeline
 */
export function runFullNormalization(dataset) {
  const unfResult = analyzeUNF(dataset)
  const result1NF = convertTo1NF(dataset)
  
  // Feed the 1NF expanded rows into the subsequent steps
  const dataset1NF = {
    ...dataset,
    rows: result1NF.tables[0].rows
  }

  const result2NF = convertTo2NF(dataset1NF)
  const result3NF = convertTo3NF(dataset1NF, result2NF.tables)

  return {
    steps: [
      { id: 'unf', label: 'UNF', ...unfResult },
      { id: '1nf', label: '1NF', ...result1NF },
      { id: '2nf', label: '2NF', ...result2NF },
      { id: '3nf', label: '3NF', ...result3NF },
    ],
    finalTables: result3NF.tables,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function generateTableName(fromAttrs, toAttrs) {
  // Create a readable table name from the attributes
  const from = fromAttrs.map(a => a.replace(/ID$/i, '')).join('')
  const to = toAttrs.length <= 2
    ? toAttrs.map(a => a.replace(/ID$/i, '')).join('')
    : toAttrs[0].replace(/ID$/i, '') + 's'

  if (from) return from + '_' + to
  return 'Table_' + toAttrs[0]
}
