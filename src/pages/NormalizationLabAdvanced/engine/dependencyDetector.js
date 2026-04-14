/**
 * Dependency Detector
 * Correctly identifies functional, partial, and transitive dependencies
 * using attribute closure computation.
 */

/**
 * Compute the closure of a set of attributes under given FDs.
 * @param {string[]} attrs - Set of attributes
 * @param {Array<{from: string[], to: string[]}>} fds - Functional dependencies
 * @returns {Set<string>} - Closure of attrs
 */
export function computeClosure(attrs, fds) {
  const closure = new Set(attrs)
  let changed = true

  while (changed) {
    changed = false
    for (const fd of fds) {
      if (fd.from.every(a => closure.has(a))) {
        for (const a of fd.to) {
          if (!closure.has(a)) {
            closure.add(a)
            changed = true
          }
        }
      }
    }
  }

  return closure
}

/**
 * Check if a set of attributes is a superkey.
 * @param {string[]} attrs
 * @param {string[]} allColumns
 * @param {Array<{from: string[], to: string[]}>} fds
 * @returns {boolean}
 */
export function isSuperkey(attrs, allColumns, fds) {
  const closure = computeClosure(attrs, fds)
  return allColumns.every(col => closure.has(col))
}

/**
 * Check if a set of attributes is a candidate key.
 * (Superkey where no proper subset is also a superkey)
 * @param {string[]} attrs
 * @param {string[]} allColumns
 * @param {Array<{from: string[], to: string[]}>} fds
 * @returns {boolean}
 */
export function isCandidateKey(attrs, allColumns, fds) {
  if (!isSuperkey(attrs, allColumns, fds)) return false

  // Check that no proper subset is a superkey
  for (let i = 0; i < attrs.length; i++) {
    const subset = [...attrs.slice(0, i), ...attrs.slice(i + 1)]
    if (subset.length > 0 && isSuperkey(subset, allColumns, fds)) {
      return false
    }
  }
  return true
}

/**
 * Find all partial dependencies.
 * A partial dependency exists when a non-prime attribute depends on
 * a proper subset of a candidate key.
 *
 * @param {string[]} primaryKey - The composite primary key
 * @param {string[]} allColumns - All columns
 * @param {Array<{from: string[], to: string[]}>} fds - Functional dependencies
 * @returns {Array<{from: string[], to: string[], type: string}>}
 */
export function findPartialDependencies(primaryKey, allColumns, fds) {
  if (primaryKey.length <= 1) return [] // No partial deps with simple key

  const pkSet = new Set(primaryKey)
  const partialDeps = []

  for (const fd of fds) {
    // Check if `from` is a proper subset of the primary key
    const isProperSubset =
      fd.from.length < primaryKey.length &&
      fd.from.every(a => pkSet.has(a))

    if (isProperSubset) {
      // Find non-prime attributes in `to`
      const nonPrimeToAttrs = fd.to.filter(a => !pkSet.has(a))
      if (nonPrimeToAttrs.length > 0) {
        partialDeps.push({
          from: fd.from,
          to: nonPrimeToAttrs,
          type: 'partial',
        })
      }
    }
  }

  return partialDeps
}

/**
 * Find all transitive dependencies.
 * A transitive dependency: A → B → C where A is the key,
 * B is non-prime, and C is non-prime.
 *
 * @param {string[]} primaryKey
 * @param {string[]} allColumns
 * @param {Array<{from: string[], to: string[]}>} fds
 * @returns {Array<{from: string[], to: string[], via: string[], type: string}>}
 */
export function findTransitiveDependencies(primaryKey, allColumns, fds) {
  const pkSet = new Set(primaryKey)
  const transitiveDeps = []

  for (const fd of fds) {
    // `from` must be non-prime attributes only
    const fromIsNonPrime = fd.from.every(a => !pkSet.has(a))
    // `to` must also be non-prime
    const toIsNonPrime = fd.to.every(a => !pkSet.has(a))

    if (fromIsNonPrime && toIsNonPrime) {
      // Verify there's a path: PK → from (via some other FD)
      const pkClosure = computeClosure(primaryKey, fds)
      if (fd.from.every(a => pkClosure.has(a))) {
        transitiveDeps.push({
          from: fd.from,
          to: fd.to,
          via: fd.from,
          type: 'transitive',
        })
      }
    }
  }

  return transitiveDeps
}

/**
 * Classify all dependencies in a table.
 * Returns an object with full, partial, and transitive dependencies.
 */
export function classifyDependencies(primaryKey, allColumns, fds) {
  const partial = findPartialDependencies(primaryKey, allColumns, fds)
  const transitive = findTransitiveDependencies(primaryKey, allColumns, fds)

  // Full dependencies: FDs from the complete key to non-key attributes
  // that aren't covered by partial or transitive
  const full = fds.filter(fd => {
    const pkSet = new Set(primaryKey)
    return fd.from.length === primaryKey.length &&
      fd.from.every(a => pkSet.has(a))
  }).map(fd => ({ ...fd, type: 'full' }))

  return { full, partial, transitive }
}

/**
 * Get dependency type label and color for a column.
 */
export function getColumnDepInfo(column, primaryKey, fds) {
  const pkSet = new Set(primaryKey)

  if (pkSet.has(column)) {
    return { type: 'primary_key', color: '#3B82F6', label: 'Primary Key' }
  }

  // Check if column is part of a partial dependency
  for (const fd of fds) {
    const isPartialFrom = fd.from.length < primaryKey.length &&
      fd.from.every(a => pkSet.has(a))
    if (isPartialFrom && fd.to.includes(column)) {
      return { type: 'partial', color: '#F59E0B', label: 'Partial Dependency' }
    }
  }

  // Check if column is part of a transitive dependency
  for (const fd of fds) {
    const fromIsNonPrime = fd.from.every(a => !pkSet.has(a))
    if (fromIsNonPrime && fd.to.includes(column)) {
      return { type: 'transitive', color: '#EF4444', label: 'Transitive Dependency' }
    }
  }

  return { type: 'normal', color: '#94A3B8', label: 'Regular Attribute' }
}
