import express from "express"
import client, { collectDefaultMetrics } from "prom-client"
const app = express()
const port = process.env.PORT || 9100

app.use(express.json())

export const restResponseTimeHistogram = new client.Histogram({
  name: "rest_response_time_duration_seconds",
  help: "REST API response time in seconds.",
  labelNames: ["method", "route", "status_code"],
})

export const databaseResponseTimeHistogram = new client.Histogram({
  name: "db_response_time_duration_seconds",
  help: "Database response time in seconds.",
  labelNames: ["operation", "success"],
})

export const startMetricsServer = () => {
  collectDefaultMetrics()

  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType)
    return res.send(await client.register.metrics())
  })
  app.listen(port, () => console.log(`Metric server started att http://localhost:${port}`))
}
