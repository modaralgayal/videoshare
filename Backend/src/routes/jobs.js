import express from "express";
import { PutCommand, UpdateCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
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
      entryType: "job",
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


//--------------- USE GSI HERE ----------------//
router.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME, 
        IndexName: "entryType-index", 
        KeyConditionExpression: "entryType = :entryType",
        ExpressionAttributeValues: {
          ":entryType": "job"
        }
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
      entryType: "bid",
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

    // Query bids using GSI
    const bidsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        ExpressionAttributeValues: {
          ":entryType": "bid"
        }
      })
    );

    const allBids = bidsResult.Items || [];

    // Query jobs using GSI to get customer's jobs
    const jobsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        FilterExpression: "customerId = :customerId",
        ExpressionAttributeValues: {
          ":entryType": "job",
          ":customerId": customerId
        }
      })
    );

    const jobs = jobsResult.Items || [];

    // Get job IDs that belong to this customer
    const customerJobIds = new Set(jobs.map((job) => job.id || job.jobId));

    // Filter bids that belong to customer's jobs
    const customerBids = allBids.filter((bid) =>
      customerJobIds.has(bid.jobId)
    );

    // Get photographer profiles for all unique videographer IDs
    const videographerIds = [...new Set(customerBids.map((bid) => bid.videographerId))];
    const profileResults = await Promise.all(
      videographerIds.map((vid) =>
        ddb.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              id: `profile_${vid}`
            }
          })
        ).catch(() => ({ Item: null }))
      )
    );
    const profiles = profileResults.map((result) => result.Item).filter(Boolean);

    // Enrich bids with job and photographer information
    const bidsWithJobs = customerBids.map((bid) => {
      const job = jobs.find((j) => (j.id || j.jobId) === bid.jobId);
      
      // Find photographer profile picture
      const photographerProfile = profiles.find(
        (item) => item.photographerId === bid.videographerId
      );
      
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
        photographer: {
          id: bid.videographerId,
          name: photographerProfile?.name || "Photographer",
          profilePicture: photographerProfile?.profilePicture || null,
        },
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

    // Query bids using GSI, then filter in code to find the specific bid
    const bidsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        ExpressionAttributeValues: {
          ":entryType": "bid"
        }
      })
    );

    const bid = bidsResult.Items?.find((item) => (item.id === bidId || item.bidId === bidId));
    
    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Query jobs using GSI to find the job this bid belongs to
    const jobsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        FilterExpression: "customerId = :customerId",
        ExpressionAttributeValues: {
          ":entryType": "job",
          ":customerId": customerId
        }
      })
    );

    const job = jobsResult.Items?.find((item) => (item.id === bid.jobId || item.jobId === bid.jobId));

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Authorization: Verify the job belongs to this customer (already filtered, but double-check)
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

      // Query all bids for this job and reject pending ones (excluding current bid)
      const otherBidsResult = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "entryType-index",
          KeyConditionExpression: "entryType = :entryType",
          FilterExpression: "jobId = :jobId",
          ExpressionAttributeValues: {
            ":entryType": "bid",
            ":jobId": bid.jobId
          }
        })
      );

      const otherBidsForJob = (otherBidsResult.Items || []).filter(
        (item) => item.id !== bidId && item.bidId !== bidId
      );

      // Reject other pending bids for the same job
      for (const otherBid of otherBidsForJob) {
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

    // Query bids using GSI filtered by videographerId
    const bidsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        FilterExpression: "videographerId = :videographerId",
        ExpressionAttributeValues: {
          ":entryType": "bid",
          ":videographerId": videographerId
        }
      })
    );

    const photographerBids = bidsResult.Items || [];

    // Get unique job IDs from bids
    const jobIds = [...new Set(photographerBids.map((bid) => bid.jobId).filter(Boolean))];

    // Query all jobs, then filter by job IDs in code
    const jobsResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "entryType-index",
        KeyConditionExpression: "entryType = :entryType",
        ExpressionAttributeValues: {
          ":entryType": "job"
        }
      })
    );

    const allJobs = (jobsResult.Items || []).filter((job) => 
      jobIds.includes(job.id) || jobIds.includes(job.jobId)
    );

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
      entryType: "portfolio", // Use lowercase for GSI consistency
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

// Update photographer profile picture
router.put("/api/profile-picture", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can update their profile picture
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can update their profile picture" });
    }

    const photographerId = req.user.uid;
    const { profilePicture } = req.body;

    // Validate profile picture - can be a URL or base64 data URL
    if (profilePicture && typeof profilePicture === "string" && profilePicture.trim()) {
      const trimmedPicture = profilePicture.trim();
      // Check if it's a base64 data URL (starts with data:image/)
      const isBase64 = trimmedPicture.startsWith("data:image/");
      // Check if it's a regular URL
      const isUrl = trimmedPicture.startsWith("http://") || trimmedPicture.startsWith("https://");
      
      if (!isBase64 && !isUrl) {
        return res.status(400).json({ error: "Profile picture must be a valid URL or image data" });
      }
      
      // Validate base64 data URL format
      if (isBase64) {
        // Check if it's a valid data URL format: data:image/[type];base64,[data]
        const base64Pattern = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;
        if (!base64Pattern.test(trimmedPicture)) {
          return res.status(400).json({ error: "Invalid image data format. Please use JPEG, PNG, or WebP." });
        }
        
        // Check base64 data size (approximate, base64 is ~33% larger than original)
        // Limit to ~2.5MB base64 to account for ~2MB original file
        const maxBase64Size = 2.5 * 1024 * 1024;
        if (trimmedPicture.length > maxBase64Size) {
          return res.status(400).json({ error: "Image size must be less than 2MB" });
        }
      }
    }

    // Create or update profile object with name from JWT
    const profile = {
      entryType: "profile", // Include entryType for GSI queries
      id: `profile_${photographerId}`,
      photographerId: photographerId,
      name: req.user.name || "Photographer",
      profilePicture: profilePicture ? profilePicture.trim() : "",
      updatedAt: new Date().toISOString(),
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: profile,
      })
    );

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: profile.profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get photographer profile picture
router.get("/api/profile-picture", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can view their own profile picture
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can view their profile picture" });
    }

    const photographerId = req.user.uid;

    // Use GetCommand to fetch profile by id (more efficient than query)
    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `profile_${photographerId}`
        }
      })
    );

    const profile = result.Item;

    res.status(200).json({
      success: true,
      profilePicture: profile?.profilePicture || "",
    });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get photographer portfolio (for customers to view, or photographers to view their own)
router.get("/api/portfolio/:photographerId", authenticateToken, async (req, res) => {
  try {
    const { photographerId } = req.params;
    const currentUser = req.user;

    // Use GetCommand to fetch portfolio by id (more efficient than query)
    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `portfolio_${photographerId}`
        }
      })
    );

    const portfolio = result.Item;

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