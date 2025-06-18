class BPlusTree {
  constructor(order = 3) {
    this.order = order;
    this.root = new LeafNode();
    this.storageKey = 'bplus-tree-data';
    
    // Load data from localStorage on initialization
    this.loadFromStorage();
  }

  insert(key, value) {
    const result = this.root.insert(key, value, this.order);
    if (result.newNode) {
      // Root split, create new root
      const newRoot = new InternalNode();
      newRoot.keys = [result.key];
      newRoot.children = [this.root, result.newNode];
      this.root = newRoot;
    }
    
    // Save to localStorage after insertion
    this.saveToStorage();
  }

  search(key) {
    return this.root.search(key);
  }

  getAll() {
    const result = [];
    let current = this.findFirstLeaf();
    
    while (current) {
      for (let i = 0; i < current.keys.length; i++) {
        result.push({ key: current.keys[i], value: current.values[i] });
      }
      current = current.next;
    }
    
    return result;
  }

  findFirstLeaf() {
    let current = this.root;
    while (current instanceof InternalNode) {
      current = current.children[0];
    }
    return current;
  }

  getTreeStructure() {
    return this.serializeNode(this.root, 0);
  }

  serializeNode(node, level) {
    const nodeData = {
      id: Math.random().toString(36).substr(2, 9),
      type: node instanceof LeafNode ? 'leaf' : 'internal',
      keys: [...node.keys],
      level: level,
      children: []
    };

    if (node instanceof LeafNode) {
      nodeData.values = [...node.values];
      nodeData.hasNext = !!node.next;
    } else {
      nodeData.children = node.children.map(child => 
        this.serializeNode(child, level + 1)
      );
    }

    return nodeData;
  }

  // Save current tree data to localStorage
  saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const allData = this.getAll();
        localStorage.setItem(this.storageKey, JSON.stringify(allData));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  // Load tree data from localStorage
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem(this.storageKey);
        if (storedData) {
          const data = JSON.parse(storedData);
          
          // Rebuild tree from stored data
          this.root = new LeafNode();
          data.forEach(item => {
            this.insertWithoutSave(item.key, item.value);
          });
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        // If loading fails, start with empty tree
        this.root = new LeafNode();
      }
    }
  }

  // Insert without saving to storage (used during loading)
  insertWithoutSave(key, value) {
    const result = this.root.insert(key, value, this.order);
    if (result.newNode) {
      const newRoot = new InternalNode();
      newRoot.keys = [result.key];
      newRoot.children = [this.root, result.newNode];
      this.root = newRoot;
    }
  }

  // Clear all data and localStorage
  clear() {
    this.root = new LeafNode();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  // Get storage info
  getStorageInfo() {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem(this.storageKey);
        return {
          hasStoredData: !!storedData,
          itemCount: storedData ? JSON.parse(storedData).length : 0,
          storageSize: storedData ? new Blob([storedData]).size : 0
        };
      } catch (error) {
        return { hasStoredData: false, itemCount: 0, storageSize: 0 };
      }
    }
    return { hasStoredData: false, itemCount: 0, storageSize: 0 };
  }
}

class Node {
  constructor() {
    this.keys = [];
  }
}

class InternalNode extends Node {
  constructor() {
    super();
    this.children = [];
  }

  insert(key, value, order) {
    // Find the correct child to insert into
    let i = 0;
    while (i < this.keys.length && key > this.keys[i]) {
      i++;
    }

    const result = this.children[i].insert(key, value, order);
    
    if (result.newNode) {
      // Child split, need to add new key and child
      this.keys.splice(i, 0, result.key);
      this.children.splice(i + 1, 0, result.newNode);

      // Check if this node needs to split
      if (this.keys.length >= order) {
        return this.split(order);
      }
    }

    return { newNode: null };
  }

  split(order) {
    const mid = Math.floor(order / 2);
    const newNode = new InternalNode();
    
    // Move half the keys and children to new node
    newNode.keys = this.keys.splice(mid + 1);
    newNode.children = this.children.splice(mid + 1);
    
    const promotedKey = this.keys.pop();

    return {
      newNode: newNode,
      key: promotedKey
    };
  }

  search(key) {
    let i = 0;
    while (i < this.keys.length && key > this.keys[i]) {
      i++;
    }
    return this.children[i].search(key);
  }
}

class LeafNode extends Node {
  constructor() {
    super();
    this.values = [];
    this.next = null;
  }

  insert(key, value, order) {
    // Find insertion position
    let i = 0;
    while (i < this.keys.length && key > this.keys[i]) {
      i++;
    }

    // If key already exists, update value
    if (i < this.keys.length && this.keys[i] === key) {
      this.values[i] = value;
      return { newNode: null };
    }

    // Insert key-value pair
    this.keys.splice(i, 0, key);
    this.values.splice(i, 0, value);

    // Check if split is needed
    if (this.keys.length >= order) {
      return this.split(order);
    }

    return { newNode: null };
  }

  split(order) {
    const mid = Math.ceil(order / 2);
    const newNode = new LeafNode();
    
    // Move half the keys and values to new node
    newNode.keys = this.keys.splice(mid);
    newNode.values = this.values.splice(mid);
    
    // Link the leaf nodes
    newNode.next = this.next;
    this.next = newNode;

    return {
      newNode: newNode,
      key: newNode.keys[0]
    };
  }

  search(key) {
    const index = this.keys.indexOf(key);
    return index !== -1 ? this.values[index] : null;
  }
}

// Global tree instance
let globalTree = new BPlusTree();

export { BPlusTree, globalTree };