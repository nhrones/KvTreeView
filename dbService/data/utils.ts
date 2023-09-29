const DBPath = './db.db'

/** load test data set */
export async function load() {
   const db = await Deno.openKv(DBPath)
   await db.set(["env", "cwd"], "./")
   await db.set(["env", "host"], "http://localhost")
   await db.set(["env", "port"], 9099)
   await db.set(["cfg", "target"], "./dist")
   await db.set(["cfg", "include"], "./src")
   await db.set(["cfg", "options"], { debug: true, useKv: true, dbFile: "./data/db.db" })
   await db.set(["users", 1], { id: 1, first: "John", last: "Doe", age: 25, address: { street: '123 Main st.', city: 'Gotham', state: "CA", zip: 45927 } })
   await db.set(["users", 2], { id: 2, first: "Jim", last: "Smith", age: 35, address: { street: '456 A st.', city: 'Fremont', state: "CA", zip: 45938 } })
   await db.set(["users", 3], { id: 3, first: "Joe", last: "Smoe", age: 45, address: { street: '789 B st.', city: 'Hayward', state: "CA", zip: 45941 } })
   db.close()
}
load()
/** delete all rows from the db */
export async function clear() {
   const db = await Deno.openKv(DBPath);
   getAllKeys()
      .then((keys) => {
         keys.forEach( (key) => {
            db.delete(key)
         })
      })
   db.close 
}

/**  bulk fetch - get record collections */
export async function getAllKeys() {
   const allKeys = []
   const db = await Deno.openKv(DBPath);
   const entries = db.list({ prefix: [] })
   for await (const entry of entries) {
      allKeys.push(entry.key)
   }
   db.close()
   return allKeys
}
