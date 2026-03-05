/**
 * Graph utility functions for ER diagrams, deadlock detection, etc.
 */

// Layout nodes in a tree-like structure
export function layoutTree(root, width, startY = 80, levelHeight = 100) {
    if (!root) return []
    const positions = []
    const queue = [{ node: root, x: width / 2, y: startY, level: 0 }]
    const levelCounts = {}

    // Count nodes per level
    function countLevels(node, level = 0) {
        if (!node) return
        levelCounts[level] = (levelCounts[level] || 0) + 1
        node.children?.forEach(c => countLevels(c, level + 1))
    }
    countLevels(root)

    // Assign positions
    const levelIndexes = {}
    function assignPositions(node, level = 0) {
        if (!node) return
        if (!levelIndexes[level]) levelIndexes[level] = 0
        const count = levelCounts[level]
        const spacing = width / (count + 1)
        const x = spacing * (levelIndexes[level] + 1)
        const y = startY + level * levelHeight
        levelIndexes[level]++

        positions.push({ id: node.id, x, y, keys: node.keys, isLeaf: node.isLeaf })
        node.children?.forEach(c => assignPositions(c, level + 1))
    }
    assignPositions(root)
    return positions
}

// Detect cycles in a directed graph (for deadlock detection)
export function detectCycle(adjacency) {
    const visited = new Set()
    const recStack = new Set()
    const cycle = []

    function dfs(node, path) {
        visited.add(node)
        recStack.add(node)
        path.push(node)

        for (const neighbor of (adjacency[node] || [])) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor, path)) return true
            } else if (recStack.has(neighbor)) {
                const cycleStart = path.indexOf(neighbor)
                cycle.push(...path.slice(cycleStart), neighbor)
                return true
            }
        }

        path.pop()
        recStack.delete(node)
        return false
    }

    for (const node of Object.keys(adjacency)) {
        if (!visited.has(node)) {
            if (dfs(node, [])) return cycle
        }
    }
    return null
}

// Generate edges between parent-child nodes
export function generateEdges(root) {
    if (!root) return []
    const edges = []
    function traverse(node) {
        if (!node || !node.children) return
        node.children.forEach(child => {
            edges.push({ from: node.id, to: child.id })
            traverse(child)
        })
    }
    traverse(root)
    return edges
}
