
import { getTreeObj } from './TreeNodes.ts'
import { DEV } from "./context.ts"
import {
   deleteRow,
   getRow,
   getAll,
   setRow,
} from './kvdb.ts'

import { load } from "./data/utils.ts"

/** 
 * SSE stream headers 
 */
const StreamHeaders = {
   "content-type": "text/event-stream",
   "Access-Control-Allow-Origin": "*",
   "Cache-Control": "no-cache"
}
/** 
 * Subscribes a client to a Server Sent Event stream    
 * This stream supports remote DB transaction procedures (SSE-RPC)     
 * @param (Request) req - the original http request object    
 */
export function registerClient(req: Request): Response {

   if (DEV) console.info('Started SSE Stream! - ', req.url)

   /** 
    * each client gets its own BroadcastChannel instance
    */
   const thisChannel = new BroadcastChannel("sse-rpc");


   const stream = new ReadableStream({
      start: (controller) => {

         // listening for RPC or mutation-event messages
         thisChannel.onmessage = async (e) => {
            const { txID, procedure, params } = e.data
            if (DEV) console.log(`sse got - txID: ${txID}, procedure: ${procedure}, params: ${JSON.stringify(params)}`)

            let thisError: string | null = null
            let thisResult = null
            const { collection, id, vs } = params
            const key = [collection, id]

            // calling Snapshot procedures
            switch (procedure) {

               /** A mutation event - fired by kvdb.ts */
               case "MUTATION": {
                  if (DEV) console.log(`MUTATION event - id: ${txID}, row: ${params.rowID}, type: ${params.type}`)
                  thisError = null
                  thisResult = params
                  break;
               }

               /** delete a row */
               case "DELETE": {
                  await deleteRow(key)
                     thisError = null
                     thisResult = "ok"
                  break;
               }

               /** Fetch a row */
               case "GET": {
                  const result = await getRow(key, vs)
                  thisError = null
                  thisResult = result
                  break;
               }

               /**
                * Set the value for the given key in the database. 
                * If a value already exists for the key, it will be overwritten.
                */
               case "SET": {
                  const result = await setRow(key, params.value);
                  if (result.versionstamp === null) {
                     thisError = 'Oooppps!'
                     thisResult = null
                  } else {
                     thisError = null
                     thisResult = result.versionstamp
                  }
                  break;
               }

               /** Return all records */
               case 'GETALL': {
                  await load()
                  const result = await getAll()
                  const to = getTreeObj(result)
                  thisResult = JSON.stringify(to)
                  break;
               }

               /** default fall through */
               default: {
                  console.log('handling - default')
                  thisError = 'Unknown procedure called!';
                  thisResult = null
                  break;
               }
            }

            /** Build & stream SSE reply */
            const reply = JSON.stringify({
               txID: txID,
               error: thisError,
               result: thisResult
            })
            controller.enqueue('data: ' + reply + '\n\n');
         }
      },

      cancel() {
         thisChannel.close();
      }
   })

   return new Response(
      stream.pipeThrough(
         new TextEncoderStream()),
      { headers: StreamHeaders }
   )
}
