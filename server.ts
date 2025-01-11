//-----------------------------------------------------------
// get external dependencies
//-----------------------------------------------------------
import {
   join,
   registerClient,
   openWebsite,
   serveFile
} from "./dbService/deps.ts"

//-----------------------------------------------------------
// get internal dependencies
//-----------------------------------------------------------
import { DEV, corsResponse } from './dbService/context.ts'



/**
 *  Serve and handle all http requests
 */
Deno.serve({ port: 9099 },
   async (request: Request): Promise<Response> => {

      // Get and adjust the requested path name
      let { pathname } = new URL(request.url);
      if (pathname === '/') pathname = '/index.html';

      // build a full-path for the example app
      const fullPath = join(Deno.cwd() + "\\example\\" + pathname)
      if (DEV) console.log('Got server request!', fullPath)

      // if this is a Registration request, register our new RPC-client
      if (pathname.includes("RpcRegistration")) {
         if (DEV) console.log('got RpcRegistration request!')
         return registerClient(request)

      } // POST requests = (Remote Procedure Calls)    
      else if (request.method === 'POST') {
         if (DEV) console.log('handling POST request!')

         // extract the request packet
         const data = await request.json();

         // inform all interested parties about this RPC request
         const bc = new BroadcastChannel("sse-rpc");
         bc.postMessage(data);
         bc.close();

         // acknowledge the request
         return corsResponse()

      } // must be a file request - just serve it
      else {
         if (DEV) console.log(`Serving ${pathname}`);
         const resp = await serveFile(request, fullPath)
         resp.headers.append("Cache-Control", "no-store")
         return resp
      }
   }
)

/**
 * Finally, we open the example web app in the default browser
 */
openWebsite(`http://localhost:9099`)