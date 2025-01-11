
/**
 * Create the Tree object with children
 * @param {object | string} kvData 
 * @return {object} a root node object with children
 */
export function create(kvData) {
   const rootNode = createNode({
      value: kvData,
      key: 'kv-prefix:',
      type: getDataType(kvData)
   });
   createSubnode(kvData, rootNode);
   return rootNode;
}

/**
 * Create node object
 * @param {object} opt options
 * @return {object} a tree object
 */
function createNode(opt = {}) {
   let value = opt['value'] ?? null;
   
   if (isEmptyObject(value)) value = "{ }";
   
   //console.info(`createNode type: ${opt.type} value: ${value}`)
   
   if (opt.type === 'string') value = `"${value}"`
   return {
      key: opt.key || null,
      parent: opt.parent || null,
      value: value,
      isExpanded: opt.isExpanded || false,
      type: opt.type || null,
      children: opt.children || [],
      el: opt.el || null,
      depth: opt.depth || 0,
      dispose: null
   }
}

/**
 * Create subnode for node (recursive)
 * @param {object} data
 * @param {object} node
 */
function createSubnode(data, node) {
   if (typeof data === 'object') {
      for (const key in data) {
         const child = createNode({
            value: data[key],
            key: key,
            depth: node.depth + 1,
            type: getDataType(data[key]),
            parent: node,
         });
         //ndh recursive
         node.children.push(child);
         createSubnode(data[key], child);
      }
   }
}

/** 
 * Get a values data type 
 */
function getDataType(value) {
   if (Array.isArray(value)) return 'array';
   if (value === null) return 'null';
   return typeof value;
 }
 
 /** 
  * tests for an empty object 
  */
 const isEmptyObject = (value) => {
   return (
      getDataType(value) === 'object' &&
      Object.keys(value).length === 0
   )
}
