import express, { json, urlencoded, request, response } from "express"
import responseTime from "response-time"
import cors from "cors"
import compression from "compression"
// import mongoCrud from "./crud.js"
import { startMetricsServer, restResponseTimeHistogram } from "./metrics.js"

const app = express()
const port = process.env.PORT || 3000

app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cors())
app.use(compression())
app.use(
  responseTime(
    /**
     * @param {request} req
     * @param {response} res
     * @param {number} time
     */
    (req, res, time) => {
      if (req?.route?.path) {
        restResponseTimeHistogram.observe(
          {
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode,
          },
          time * 1000
        )
      }
    }
  )
)

// app.post("/find-all", mongoCrud.findAll)
// app.post("/find-one", mongoCrud.findOne)
// app.post("/create", mongoCrud.create)
// app.post("/create-many", mongoCrud.createMany)
// app.patch("/update", mongoCrud.update)
// app.put("/upsert", mongoCrud.upsert)
// app.put("/replace-one", mongoCrud.replaceOne)
// app.delete("/delete-one", mongoCrud.deleteOne)

startMetricsServer()

app.listen(port, () => console.log(`Server running on port ${port}`))
