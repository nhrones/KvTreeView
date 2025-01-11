import { DbClient } from './dbClient.js'
export const DEV = true

export const thisDB = new DbClient()

thisDB.init()
