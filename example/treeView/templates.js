
/** returns a collapsed tree element */
export function collapsedTemplate(params = {}) {
   const { key, value, type } = params;
   return `
     <div class="line">
       <div class="empty-icon"></div>
       <div class="json-key">${key}</div>
       <div class="json-separator">:</div>
       <div class="json-value json-${type}">${value}</div>
     </div>
   `;
}

/** returns a expanded tree element  */
export function expandedTemplate(params = {}) {
   const { key, size } = params;
   return `
     <div class="line">
       <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
       <div class="json-key">${key}</div>
       <div class="json-size">${size}</div>
     </div>
   `;
 }
 
 /** CSS classes for the tree node caret */
export const Classes = {
   HIDDEN: 'hidden',
   CARET_ICON: 'caret-icon',
   CARET_RIGHT: 'fa-caret-right',
   CARET_DOWN: 'fa-caret-down',
   ICON: 'fas'
}
