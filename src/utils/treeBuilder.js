/**
 * B+ Tree builder for Index Visualization
 */
export class BPlusTree {
    constructor(order = 3) {
        this.order = order
        this.root = null
    }

    insert(key) {
        if (!this.root) {
            this.root = { keys: [key], children: [], isLeaf: true, id: this._id() }
            return this._snapshot('insert', key)
        }
        const result = this._insertInternal(this.root, key)
        if (result.split) {
            const newRoot = {
                keys: [result.splitKey],
                children: [this.root, result.newNode],
                isLeaf: false,
                id: this._id(),
            }
            this.root = newRoot
        }
        return this._snapshot('insert', key)
    }

    _insertInternal(node, key) {
        if (node.isLeaf) {
            node.keys.push(key)
            node.keys.sort((a, b) => a - b)
            if (node.keys.length >= this.order) {
                return this._splitLeaf(node)
            }
            return {}
        }
        let i = 0
        while (i < node.keys.length && key >= node.keys[i]) i++
        const result = this._insertInternal(node.children[i], key)
        if (result.split) {
            node.keys.splice(i, 0, result.splitKey)
            node.children.splice(i + 1, 0, result.newNode)
            if (node.keys.length >= this.order) {
                return this._splitInternal(node)
            }
        }
        return {}
    }

    _splitLeaf(node) {
        const mid = Math.ceil(node.keys.length / 2)
        const newNode = {
            keys: node.keys.splice(mid),
            children: [],
            isLeaf: true,
            id: this._id(),
        }
        return { split: true, splitKey: newNode.keys[0], newNode }
    }

    _splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2)
        const splitKey = node.keys[mid]
        const newNode = {
            keys: node.keys.splice(mid + 1),
            children: node.children.splice(mid + 1),
            isLeaf: false,
            id: this._id(),
        }
        node.keys.splice(mid, 1)
        return { split: true, splitKey, newNode }
    }

    search(key) {
        const path = []
        let node = this.root
        while (node) {
            path.push({ node, keys: [...node.keys] })
            if (node.isLeaf) {
                const found = node.keys.includes(key)
                return { found, path }
            }
            let i = 0
            while (i < node.keys.length && key >= node.keys[i]) i++
            node = node.children[i]
        }
        return { found: false, path }
    }

    delete(key) {
        if (!this.root) return this._snapshot('delete', key)
        this._deleteInternal(this.root, key)
        if (!this.root.isLeaf && this.root.keys.length === 0) {
            this.root = this.root.children[0] || null
        }
        return this._snapshot('delete', key)
    }

    _deleteInternal(node, key) {
        if (node.isLeaf) {
            const idx = node.keys.indexOf(key)
            if (idx !== -1) node.keys.splice(idx, 1)
            return
        }
        let i = 0
        while (i < node.keys.length && key >= node.keys[i]) i++
        this._deleteInternal(node.children[i], key)
    }

    toJSON() {
        return this.root ? this._nodeToJSON(this.root) : null
    }

    _nodeToJSON(node) {
        return {
            id: node.id,
            keys: [...node.keys],
            isLeaf: node.isLeaf,
            children: node.children.map(c => this._nodeToJSON(c)),
        }
    }

    _snapshot(op, key) {
        return { operation: op, key, tree: this.toJSON() }
    }

    _id() {
        return 'n_' + Math.random().toString(36).substr(2, 9)
    }
}
