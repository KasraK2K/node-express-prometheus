import { MongoClient, ObjectId } from "mongodb"
import { request, response } from "express"
import { databaseResponseTimeHistogram } from "./metrics.js"

const mongoClient = new MongoClient("mongodb://0.0.0.0:27017")
mongoClient
  .on("connect", () => console.log("MongoDB connected"))
  .on("close", () => console.log("MongoDB connection closed"))
  .on("error", (err) => {
    console.log("MongoDB Error")
    console.error(err)
    process.exit(1)
  })

class MongoCrud {
  /**
   * @param {request} req
   * @param {response} res
   */
  async findAll(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector } = req.body
      if ("_id" in selector) selector._id = new ObjectId(selector._id)
      const result = await mongoClient.db(database).collection(collection).find(selector).toArray()
      timer({ operation: "findAll", success: "true" })
      return res.json({ count: result.length, result })
    } catch (error) {
      timer({ operation: "findAll", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async findOne(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector } = req.body
      if ("_id" in selector) selector._id = new ObjectId(selector._id)
      const result = await mongoClient.db(database).collection(collection).findOne(selector)
      timer({ operation: "findOne", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "findOne", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async create(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, doc } = req.body
      const result = await mongoClient.db(database).collection(collection).insertOne(doc)
      timer({ operation: "create", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "create", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async createMany(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, docs } = req.body
      const result = await mongoClient.db(database).collection(collection).insertMany(docs)
      timer({ operation: "createMany", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "createMany", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async update(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector, doc } = req.body
      if ("_id" in selector) selector._id = new ObjectId(selector._id)
      const result = await mongoClient
        .db(database)
        .collection(collection)
        .updateOne(selector, { $set: doc }, { upsert: false })
      timer({ operation: "update", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "update", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async upsert(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector, doc } = req.body
      if (selector && Object.keys(selector).length) {
        if ("_id" in selector) selector._id = new ObjectId(selector._id)
        const row = await mongoClient.db(database).collection(collection).findOne(selector)
        // Update if selector find a row
        if (row) {
          const result = await mongoClient
            .db(database)
            .collection(collection)
            .updateOne(selector, { $set: doc }, { upsert: false })
          timer({ operation: "upsert", success: "true" })
          return res.json({ result })
        }
        // Upsert if selector is wrong
        else {
          const result = await mongoClient
            .db(database)
            .collection(collection)
            .updateOne(selector, { $set: doc }, { upsert: true })
          timer({ operation: "upsert", success: "true" })
          return res.json({ result })
        }
      }
      // Create if selector is empty
      else {
        const result = await mongoClient.db(database).collection(collection).insertOne(doc)
        timer({ operation: "upsert", success: "true" })
        return res.json({ result })
      }
    } catch (error) {
      timer({ operation: "upsert", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async replaceOne(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector, doc } = req.body
      if ("_id" in selector) selector._id = new ObjectId(selector._id)
      const result = await mongoClient.db(database).collection(collection).replaceOne(selector, doc)
      timer({ operation: "replaceOne", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "replaceOne", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }

  /**
   * @param {request} req
   * @param {response} res
   */
  async deleteOne(req, res) {
    const timer = databaseResponseTimeHistogram.startTimer()
    try {
      const { database, collection, selector } = req.body
      if ("_id" in selector) selector._id = new ObjectId(selector._id)
      const result = await mongoClient.db(database).collection(collection).deleteOne(selector)
      timer({ operation: "deleteOne", success: "true" })
      return res.json({ result })
    } catch (error) {
      timer({ operation: "deleteOne", success: "false" })
      return res.status(500).json({ error: error.message })
    }
  }
}

export default new MongoCrud()
