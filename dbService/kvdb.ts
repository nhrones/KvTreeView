// deno-lint-ignore-file no-explicit-any
import { DBPath } from './context.ts'

/** A cache of a KvDb-collection.    
 *  This is a consistant cache,   
 *  It's kept in sync with a specific collection 
 *  in a Deno.Kv database.   
 *  We load it once on cold start.
 */
export let shadowCache: Map<any, any>

/**
 * load an in-memory dataset            
 */
export const loadCache = async () => {
   if (!shadowCache) {
      const result = await getAll()
      shadowCache = new Map(result)
   }
   fireMutationEvent(-0, "cacheLoaded")
}

/**
 * delete a record
 */
export async function deleteRow(key: any[]) {
   const db = await Deno.openKv(DBPath);
   const result = await db.delete(key);
   shadowCache.delete(key[1])
   fireMutationEvent(key[1], "RowDeleted")
   db.close()
   return result
}

/**
 * get a record
 */
export async function getRow(key: any[], _version: string) {
   const db = await Deno.openKv(DBPath);
   const result = await db.get(key)
   db.close()
   return result
}

/**
 * set a record
 */
export async function setRow(key: any[], value: any) {
   console.info('called setRow with key = ', key)
   const db = await Deno.openKv(DBPath);
   const result = await db.set(key, value);
   if (result.versionstamp) {
      console.log(`set shadowCache id ${key[1]} = ${JSON.stringify(value)}`)
      shadowCache.set(key[1], value)
      fireMutationEvent(key[1], "SetRow")
   } else {
      console.error('kvdb.setRow failed!')
   }

   db.close()
   return result
}

/**
 *  bulk fetch - get record collection 
 */
export async function getAll() {
   const fetchStart = performance.now()
   shadowCache = new Map()
   const db = await Deno.openKv(DBPath);
   const entries = db.list({ prefix: [] })
   for await (const entry of entries) {
      console.info(`key:${entry.key}. val:`, entry.value)
      shadowCache.set(entry.key, entry.value)
   }
   const fetchTime = (performance.now() - fetchStart).toFixed(2)
   console.log(`Loading ${shadowCache.size} records in cache took -  ${fetchTime}ms`)
   db.close()
   return Array.from(shadowCache.entries())
}

/**
 * Fire an event reporting a DenoKv record mutation
 */
const fireMutationEvent = (rowID: number, type: string) => {
   const bc = new BroadcastChannel("sse-rpc")
   bc.postMessage({ txID: -1, procedure: "MUTATION", params: { rowID, type } })
   bc.close();
}