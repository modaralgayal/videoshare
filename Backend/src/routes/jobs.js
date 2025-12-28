import express from "express";
import { PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ddb } from "../client/dynamodb.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const TABLE_NAME = "videoKuvaajat";

// Post a job (customers only)
router.post("/api/job", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only customers can post jobs
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Only customers can post jobs" });
    }

    // Use customerId from JWT, not from request body (security)
    const customerId = req.user.uid;

    // Input validation
    const { title, description, budget_min, budget_max } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required and must be a non-empty string" });
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({ error: "Description is required and must be a non-empty string" });
    }

    const minBudget = Number(budget_min);
    const maxBudget = Number(budget_max);

    if (isNaN(minBudget) || minBudget <= 0) {
      return res.status(400).json({ error: "Minimum budget must be a positive number" });
    }

    if (isNaN(maxBudget) || maxBudget <= 0) {
      return res.status(400).json({ error: "Maximum budget must be a positive number" });
    }

    if (minBudget >= maxBudget) {
      return res.status(400).json({ error: "Maximum budget must be greater than minimum budget" });
    }

    const id = uuidv4();
    const job = {
      id: id,
      jobId: id,
      customerId: customerId, // From JWT, not request body
      title: title.trim(),
      description: description.trim(),
      budget_min: minBudget,
      budget_max: maxBudget,
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

// Get all jobs (authenticated users)
router.get("/api/jobs", authenticateToken, async (req, res) => {
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

// Post a bid (photographers only)
router.post("/api/bid", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can post bids
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can post bids" });
    }

    // Use videographerId from JWT, not from request body (security)
    const videographerId = req.user.uid;

    // Input validation
    const { jobId, price, proposal } = req.body;

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const bidPrice = Number(price);
    if (isNaN(bidPrice) || bidPrice <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    if (!proposal || typeof proposal !== "string" || proposal.trim().length === 0) {
      return res.status(400).json({ error: "Proposal is required and must be a non-empty string" });
    }

    const id = uuidv4();
    const bid = {
      id: id,
      bidId: id,
      jobId: jobId.trim(),
      videographerId: videographerId, // From JWT, not request body
      price: bidPrice,
      proposal: proposal.trim(),
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

// Get bids for a customer's jobs (customers only, their own bids)
router.get("/api/bids", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only customers can view bids for their jobs
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Only customers can view bids for their jobs" });
    }

    // Use customerId from JWT, not from URL params (security)
    const customerId = req.user.uid;

    // Scan all items from the table
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const allItems = result.Items || [];

    // Separate jobs and bids
    const jobs = allItems.filter((item) => item.customerId === customerId);
    const allBids = allItems.filter((item) => item.bidId);

    // Get job IDs that belong to this customer
    const customerJobIds = new Set(jobs.map((job) => job.id || job.jobId));

    // Filter bids that belong to customer's jobs
    const customerBids = allBids.filter((bid) =>
      customerJobIds.has(bid.jobId)
    );

    // Enrich bids with job information
    const bidsWithJobs = customerBids.map((bid) => {
      const job = jobs.find((j) => (j.id || j.jobId) === bid.jobId);
      return {
        ...bid,
        job: job
          ? {
              id: job.id || job.jobId,
              title: job.title,
              description: job.description,
              budget_min: job.budget_min,
              budget_max: job.budget_max,
              status: job.status,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      bids: bidsWithJobs,
    });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update bid status (accept/reject) - customers only, for their own jobs
router.patch("/api/bids/:bidId", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only customers can update bid status
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Only customers can update bid status" });
    }

    const { bidId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
    }

    const customerId = req.user.uid;

    // First, scan to get the bid and verify ownership
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const allItems = scanResult.Items || [];
    
    // Find the bid
    const bid = allItems.find((item) => (item.id === bidId || item.bidId === bidId) && item.bidId);
    
    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Find the job this bid belongs to
    const job = allItems.find((item) => (item.id === bid.jobId || item.jobId === bid.jobId) && item.customerId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Authorization: Verify the job belongs to this customer
    if (job.customerId !== customerId) {
      return res.status(403).json({ error: "You can only update bids for your own jobs" });
    }

    // Update the bid status
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: bid.id || bid.bidId,
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    // If accepting a bid, optionally reject all other bids for this job
    if (status === "accepted") {
      const allBidsForJob = allItems.filter(
        (item) => item.bidId && (item.id !== bidId && item.bidId !== bidId) && item.jobId === bid.jobId
      );

      // Reject other pending bids for the same job
      for (const otherBid of allBidsForJob) {
        if (otherBid.status === "pending") {
          await ddb.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: {
                id: otherBid.id || otherBid.bidId,
              },
              UpdateExpression: "SET #status = :status",
              ExpressionAttributeNames: {
                "#status": "status",
              },
              ExpressionAttributeValues: {
                ":status": "rejected",
              },
            })
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Bid ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating bid status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get bids for a photographer (their own bids)
router.get("/api/my-bids", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can view their bids
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can view their bids" });
    }

    const videographerId = req.user.uid;

    // Scan all items from the table
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const allItems = result.Items || [];

    // Get all bids for this photographer
    const photographerBids = allItems.filter(
      (item) => item.bidId && item.videographerId === videographerId
    );

    // Get all jobs
    const allJobs = allItems.filter((item) => item.customerId);

    // Enrich bids with job information
    const bidsWithJobs = photographerBids.map((bid) => {
      const job = allJobs.find((j) => (j.id === bid.jobId || j.jobId === bid.jobId));
      return {
        ...bid,
        job: job
          ? {
              id: job.id || job.jobId,
              title: job.title,
              description: job.description,
              budget_min: job.budget_min,
              budget_max: job.budget_max,
              status: job.status,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      bids: bidsWithJobs,
    });
  } catch (error) {
    console.error("Error fetching photographer bids:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save/Update photographer portfolio (photographers only)
router.put("/api/portfolio", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can update their portfolio
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can update their portfolio" });
    }

    const photographerId = req.user.uid;
    const { description, items } = req.body;

    // Validate description
    if (description && typeof description === "string" && description.length > 1000) {
      return res.status(400).json({ error: "Description must be 1000 characters or less" });
    }

    // Create portfolio object
    const portfolio = {
      id: `portfolio_${photographerId}`,
      photographerId: photographerId,
      description: description || "",
      items: items || [],
      updatedAt: new Date().toISOString(),
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: portfolio,
      })
    );

    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Error saving portfolio:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get photographer portfolio (for customers to view, or photographers to view their own)
router.get("/api/portfolio/:photographerId", authenticateToken, async (req, res) => {
  try {
    const { photographerId } = req.params;
    const currentUser = req.user;

    // Scan all items from the table
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const allItems = result.Items || [];

    // Find portfolio for this photographer (look for items with portfolio id prefix)
    const portfolio = allItems.find(
      (item) => item.id === `portfolio_${photographerId}` && item.photographerId === photographerId
    );

    if (!portfolio) {
      return res.status(200).json({
        success: true,
        portfolio: {
          photographerId,
          description: "",
          items: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      portfolio: {
        photographerId: portfolio.photographerId,
        description: portfolio.description || "",
        items: portfolio.items || [],
      },
    });
  } catch (error) {
    console.error("Error fetching photographer portfolio:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;