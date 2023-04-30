import express from "express"
import client, { collectDefaultMetrics } from "prom-client"
const app = express()
const port = process.env.PORT || 9100

app.use(express.json())

export const startMetricsServer = () => {
  collectDefaultMetrics()

  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType)
    return res.send(await client.register.metrics())
  })
  app.listen(port, () => console.log(`Metric server started att http://localhost:${port}`))
}
