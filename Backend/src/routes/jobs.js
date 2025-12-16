import express from "express";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ddb } from "../client/dynamodb.js";

const router = express.Router();
const TABLE_NAME = "videoKuvaajat";

router.post("/api/job", async (req, res) => {
  try {
    console.log("This is the fetched job: ", req.body);
    const id = uuidv4();
    const job = {
      id: id,
      jobId: id,
      customerId: req.body.customerId,
      title: req.body.title,
      description: req.body.description,
      budget_min: req.body.budget_min,
      budget_max: req.body.budget_max,
      status: req.body.status || "open",
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: job,
      })
    );

    res
      .status(201)
      .json({ success: true, message: "Job posted successfully", job });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
router.get("/api/jobs", async (req, res) => {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const jobs = result.Items || [];

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/bid", async (req, res) => {
  try {
    const id = uuidv4();
    const bid = {
      id: id,
      bidId: id,
      jobId: req.body.jobId,
      videographerId: req.body.videographerId,
      price: req.body.price,
      proposal: req.body.proposal,
      status: req.body.status || "pending",
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: bid,
      })
    );

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      bid,
    });
  } catch (error) {
    console.error("Error posting bid:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
