import express from "express";
import { PutCommand, UpdateCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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

    // Validate required fields
    const { description, services, city, radius, duration, difficulty } = req.body;

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({ error: "Description is required and must be a non-empty string" });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: "At least one service must be selected" });
    }

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return res.status(400).json({ error: "City is required" });
    }

    if (!radius) {
      return res.status(400).json({ error: "Radius is required" });
    }

    if (!duration) {
      return res.status(400).json({ error: "Duration is required" });
    }

    if (!difficulty) {
      return res.status(400).json({ error: "Difficulty level is required" });
    }

    // Validate budget if not unknown
    if (!req.body.budgetUnknown) {
      const minBudget = Number(req.body.budgetMin);
      const maxBudget = Number(req.body.budgetMax);

      if (isNaN(minBudget) || minBudget <= 0) {
        return res.status(400).json({ error: "Minimum budget must be a positive number" });
      }

      if (isNaN(maxBudget) || maxBudget <= 0) {
        return res.status(400).json({ error: "Maximum budget must be a positive number" });
      }

      if (minBudget >= maxBudget) {
        return res.status(400).json({ error: "Maximum budget must be greater than minimum budget" });
      }
    }

    // Validate date or date range
    if (!req.body.date && (!req.body.dateRange || !req.body.dateRange.start)) {
      return res.status(400).json({ error: "Date or date range is required" });
    }

    const id = uuidv4();
    
    // Create comprehensive job object
    const job = {
      id: id,
      jobId: id,
      entryType: "job",
      customerId: customerId,
      
      // Basic settings
      customerType: req.body.customerType || null,
      projectContext: req.body.projectContext || null,
      
      // Services
      services: services,
      
      // Location
      city: city.trim(),
      area: req.body.area ? req.body.area.trim() : null,
      exactAddress: req.body.exactAddress ? req.body.exactAddress.trim() : null, // Hidden until acceptance
      radius: radius,
      allowFurther: req.body.allowFurther || false,
      
      // Date
      date: req.body.date || null,
      dateRange: req.body.dateRange || null,
      dateNotLocked: req.body.dateNotLocked || false,
      
      // Duration & Budget
      duration: duration,
      budgetMin: req.body.budgetUnknown ? null : Number(req.body.budgetMin),
      budgetMax: req.body.budgetUnknown ? null : Number(req.body.budgetMax),
      budgetUnknown: req.body.budgetUnknown || false,
      
      // Profile & Difficulty
      preferredProfile: req.body.preferredProfile || null,
      difficulty: difficulty,
      difficultyDetails: req.body.difficultyDetails ? req.body.difficultyDetails.trim() : null,
      priority: req.body.priority || [],
      
      // Service modules (only include if service is selected)
      photoSubjects: services.includes("valokuvat") ? (req.body.photoSubjects || []) : null,
      photoCount: services.includes("valokuvat") ? (req.body.photoCount || null) : null,
      photoEditing: services.includes("valokuvat") ? (req.body.photoEditing || null) : null,
      photoUsage: services.includes("valokuvat") ? (req.body.photoUsage || []) : null,
      photoDetails: services.includes("valokuvat") ? (req.body.photoDetails ? req.body.photoDetails.trim() : null) : null,
      
      videoCount: services.includes("videotuotanto") ? (req.body.videoCount || null) : null,
      videoLength: services.includes("videotuotanto") ? (req.body.videoLength || null) : null,
      videoFormat: services.includes("videotuotanto") ? (req.body.videoFormat || []) : null,
      videoNeeds: services.includes("videotuotanto") ? (req.body.videoNeeds || []) : null,
      videoUsage: services.includes("videotuotanto") ? (req.body.videoUsage || []) : null,
      videoDetails: services.includes("videotuotanto") ? (req.body.videoDetails ? req.body.videoDetails.trim() : null) : null,
      
      droneSubject: (services.includes("dronekuvat") || services.includes("dronevideo")) ? (req.body.droneSubject || []) : null,
      droneRestriction: (services.includes("dronekuvat") || services.includes("dronevideo")) ? (req.body.droneRestriction || null) : null,
      droneDetails: (services.includes("dronekuvat") || services.includes("dronevideo")) ? (req.body.droneDetails ? req.body.droneDetails.trim() : null) : null,
      
      shortVideoChannels: services.includes("lyhytvideot") ? (req.body.shortVideoChannels || []) : null,
      shortVideoWhoFilms: services.includes("lyhytvideot") ? (req.body.shortVideoWhoFilms || null) : null,
      shortVideoFrequency: services.includes("lyhytvideot") ? (req.body.shortVideoFrequency || null) : null,
      shortVideoCount: services.includes("lyhytvideot") ? (req.body.shortVideoCount || null) : null,
      shortVideoContractMonths: services.includes("lyhytvideot") && req.body.shortVideoFrequency === "säännöllinen" ? (req.body.shortVideoContractMonths || null) : null,
      shortVideoRights: services.includes("lyhytvideot") ? (req.body.shortVideoRights || null) : null,
      shortVideoStyle: services.includes("lyhytvideot") ? (req.body.shortVideoStyle || []) : null,
      shortVideoDetails: services.includes("lyhytvideot") ? (req.body.shortVideoDetails ? req.body.shortVideoDetails.trim() : null) : null,
      
      editingSource: services.includes("editointi") ? (req.body.editingSource || []) : null,
      editingFormat: services.includes("editointi") ? (req.body.editingFormat || []) : null,
      editingDetails: services.includes("editointi") ? (req.body.editingDetails ? req.body.editingDetails.trim() : null) : null,
      
      // Description & References
      description: description.trim(),
      referenceLinks: req.body.referenceLinks || [],
      attachments: req.body.attachments || [],
      
      // Metadata
      status: "open",
      createdAt: new Date().toISOString(),
      expiresAt: req.body.expiresAt || null, // Should be set to 90 days from now
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
    
    // Filter out expired jobs and mark them as expired
    const now = new Date();
    const processedJobs = jobs.map((job) => {
      if (job.expiresAt) {
        const expiresAt = new Date(job.expiresAt);
        if (expiresAt < now && job.status === "open") {
          // Mark as expired (could update in DB, but for now just filter)
          return { ...job, status: "expired" };
        }
      }
      return job;
    });

    // Filter out expired jobs for photographers, but show them to customers
    const currentUser = req.user;
    const filteredJobs = currentUser.userType === "customer"
      ? processedJobs
      : processedJobs.filter((job) => job.status !== "expired");

    res.status(200).json({
      success: true,
      jobs: filteredJobs,
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
              title: job.title || job.description?.substring(0, 50) || "Job",
              description: job.description,
              budgetMin: job.budgetMin,
              budgetMax: job.budgetMax,
              budgetUnknown: job.budgetUnknown || false,
              budget_min: job.budgetMin || job.budget_min, // Backward compatibility
              budget_max: job.budgetMax || job.budget_max, // Backward compatibility
              status: job.status,
              services: job.services || [],
              city: job.city,
              area: job.area,
              duration: job.duration,
              difficulty: job.difficulty,
              date: job.date,
              dateRange: job.dateRange,
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

// Save or update photographer profile (comprehensive profile data)
router.put("/api/photographer-profile", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can update their profile
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can update their profile" });
    }

    const photographerId = req.user.uid;
    const profileData = req.body;

    // Get existing profile to merge with new data
    const existingResult = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `profile_${photographerId}`
        }
      })
    );

    const existingProfile = existingResult.Item || {};

    // Build comprehensive profile object
    const profile = {
      entryType: "profile",
      id: `profile_${photographerId}`,
      photographerId: photographerId,
      name: req.user.name || existingProfile.name || "Photographer",
      profilePicture: existingProfile.profilePicture || "",
      updatedAt: new Date().toISOString(),
      createdAt: existingProfile.createdAt || new Date().toISOString(),
      
      // Tili & yhteys (Account & Contact)
      phoneNumber: profileData.phoneNumber || existingProfile.phoneNumber || "",
      phoneNumberVisible: profileData.phoneNumberVisible !== undefined ? profileData.phoneNumberVisible : existingProfile.phoneNumberVisible !== undefined ? existingProfile.phoneNumberVisible : true,
      contactName: profileData.contactName || existingProfile.contactName || "",
      companyName: profileData.companyName || existingProfile.companyName || "",
      businessId: profileData.businessId || existingProfile.businessId || "",
      businessIdVisible: profileData.businessIdVisible !== undefined ? profileData.businessIdVisible : existingProfile.businessIdVisible !== undefined ? existingProfile.businessIdVisible : true,
      vatObliged: profileData.vatObliged !== undefined ? profileData.vatObliged : existingProfile.vatObliged !== undefined ? existingProfile.vatObliged : false,
      billingModel: profileData.billingModel || existingProfile.billingModel || "",
      profileLanguages: profileData.profileLanguages || existingProfile.profileLanguages || [],
      
      // Profiilin peruskuvaus (Basic Profile Description)
      title: profileData.title || existingProfile.title || "",
      shortDescription: profileData.shortDescription || existingProfile.shortDescription || "",
      longDescription: profileData.longDescription || existingProfile.longDescription || "",
      
      // Yritystyyppi & tiimi (Company Type & Team)
      operatorType: profileData.operatorType || existingProfile.operatorType || "",
      teamSize: profileData.teamSize !== undefined ? profileData.teamSize : existingProfile.teamSize !== undefined ? existingProfile.teamSize : null,
      roles: profileData.roles || existingProfile.roles || [],
      
      // Toiminta-alue (Service Area)
      hometown: profileData.hometown || existingProfile.hometown || "",
      serviceAreas: profileData.serviceAreas || existingProfile.serviceAreas || [],
      maxTravelDistance: profileData.maxTravelDistance !== undefined ? profileData.maxTravelDistance : existingProfile.maxTravelDistance !== undefined ? existingProfile.maxTravelDistance : null,
      travelCosts: profileData.travelCosts || existingProfile.travelCosts || null, // { kmPrice, minFee, travelTime }
      servesAllFinland: profileData.servesAllFinland !== undefined ? profileData.servesAllFinland : existingProfile.servesAllFinland !== undefined ? existingProfile.servesAllFinland : false,
      servesAbroad: profileData.servesAbroad !== undefined ? profileData.servesAbroad : existingProfile.servesAbroad !== undefined ? existingProfile.servesAbroad : false,
      
      // Palvelut & osaaminen (Services & Expertise)
      mainServices: profileData.mainServices || existingProfile.mainServices || [],
      categories: profileData.categories || existingProfile.categories || [],
      styleTags: profileData.styleTags || existingProfile.styleTags || [],
      experienceLevel: profileData.experienceLevel || existingProfile.experienceLevel || null, // { years, gigs, level }
      specializations: profileData.specializations || existingProfile.specializations || [],
      
      // Hintatiedot (Pricing Information)
      minStartingPrice: profileData.minStartingPrice !== undefined ? profileData.minStartingPrice : existingProfile.minStartingPrice !== undefined ? existingProfile.minStartingPrice : null,
      dayHourPrice: profileData.dayHourPrice !== undefined ? profileData.dayHourPrice : existingProfile.dayHourPrice !== undefined ? existingProfile.dayHourPrice : null,
      packages: profileData.packages || existingProfile.packages || [], // [{ name, price, included }]
      includedInPrice: profileData.includedInPrice || existingProfile.includedInPrice || [],
      additionalServices: profileData.additionalServices || existingProfile.additionalServices || [], // [{ name, price }]
      
      // Toimitus & prosessi (Delivery & Process)
      averageDeliveryTime: profileData.averageDeliveryTime || existingProfile.averageDeliveryTime || "",
      revisionRounds: profileData.revisionRounds !== undefined ? profileData.revisionRounds : existingProfile.revisionRounds !== undefined ? existingProfile.revisionRounds : null,
      deliveryFormats: profileData.deliveryFormats || existingProfile.deliveryFormats || [],
      formatCapabilities: profileData.formatCapabilities || existingProfile.formatCapabilities || [],
      
      // Kalusto (Equipment)
      cameras: profileData.cameras || existingProfile.cameras || [],
      equipment: profileData.equipment || existingProfile.equipment || [], // lenses, drones, gimbals
      lightingAudio: profileData.lightingAudio || existingProfile.lightingAudio || [],
      
      // Sertifikaatit & turvallisuus (Certifications & Safety)
      droneCertifications: profileData.droneCertifications || existingProfile.droneCertifications || [],
      liabilityInsurance: profileData.liabilityInsurance || existingProfile.liabilityInsurance || null, // { hasInsurance, amount }
      safetyCards: profileData.safetyCards || existingProfile.safetyCards || [],
      
      // Saatavuus (Availability)
      weeklyAvailability: profileData.weeklyAvailability || existingProfile.weeklyAvailability || [],
      leadTime: profileData.leadTime || existingProfile.leadTime || "",
      
      // Viestintä & käytännöt (Communication & Practices)
      preferredContactMethod: profileData.preferredContactMethod || existingProfile.preferredContactMethod || "",
      hasContractTemplate: profileData.hasContractTemplate !== undefined ? profileData.hasContractTemplate : existingProfile.hasContractTemplate !== undefined ? existingProfile.hasContractTemplate : false,
      cancellationTerms: profileData.cancellationTerms || existingProfile.cancellationTerms || "",
      depositRequired: profileData.depositRequired !== undefined ? profileData.depositRequired : existingProfile.depositRequired !== undefined ? existingProfile.depositRequired : false,
      
      // Some & kanavat (Social Media & Channels)
      website: profileData.website || existingProfile.website || "",
      instagram: profileData.instagram || existingProfile.instagram || "",
      tiktok: profileData.tiktok || existingProfile.tiktok || "",
      youtube: profileData.youtube || existingProfile.youtube || "",
      vimeo: profileData.vimeo || existingProfile.vimeo || "",
      mediaKit: profileData.mediaKit || existingProfile.mediaKit || "",
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: profile,
      })
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: profile,
    });
  } catch (error) {
    console.error("Error updating photographer profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get photographer profile (for viewing/editing)
router.get("/api/photographer-profile", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can view their own profile
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can view their profile" });
    }

    const photographerId = req.user.uid;

    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `profile_${photographerId}`
        }
      })
    );

    const profile = result.Item;

    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: {
          photographerId,
          name: req.user.name || "Photographer",
        },
      });
    }

    res.status(200).json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error("Error fetching photographer profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get photographer profile for customers to view (public profile)
router.get("/api/photographer-profile/:photographerId", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only customers can view photographer profiles
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Only customers can view photographer profiles" });
    }

    const { photographerId } = req.params;

    // Get profile
    const profileResult = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `profile_${photographerId}`
        }
      })
    );

    const profile = profileResult.Item;

    // Get portfolio
    const portfolioResult = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: `portfolio_${photographerId}`
        }
      })
    );

    const portfolio = portfolioResult.Item;

    // Filter out sensitive information based on visibility settings
    const publicProfile = profile ? {
      photographerId: profile.photographerId,
      name: profile.name || profile.contactName || "Photographer",
      contactName: profile.contactName,
      profilePicture: profile.profilePicture,
      title: profile.title,
      shortDescription: profile.shortDescription,
      longDescription: profile.longDescription,
      companyName: profile.companyName,
      businessId: profile.businessIdVisible ? profile.businessId : undefined,
      vatObliged: profile.vatObliged,
      operatorType: profile.operatorType,
      teamSize: profile.teamSize,
      roles: profile.roles,
      hometown: profile.hometown,
      serviceAreas: profile.serviceAreas,
      maxTravelDistance: profile.maxTravelDistance,
      servesAllFinland: profile.servesAllFinland,
      servesAbroad: profile.servesAbroad,
      mainServices: profile.mainServices,
      categories: profile.categories,
      styleTags: profile.styleTags,
      specializations: profile.specializations,
      minStartingPrice: profile.minStartingPrice,
      dayHourPrice: profile.dayHourPrice,
      includedInPrice: profile.includedInPrice,
      averageDeliveryTime: profile.averageDeliveryTime,
      revisionRounds: profile.revisionRounds,
      deliveryFormats: profile.deliveryFormats,
      formatCapabilities: profile.formatCapabilities,
      cameras: profile.cameras,
      equipment: profile.equipment,
      lightingAudio: profile.lightingAudio,
      droneCertifications: profile.droneCertifications,
      liabilityInsurance: profile.liabilityInsurance,
      safetyCards: profile.safetyCards,
      weeklyAvailability: profile.weeklyAvailability,
      leadTime: profile.leadTime,
      website: profile.website,
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      youtube: profile.youtube,
      vimeo: profile.vimeo,
      phoneNumber: profile.phoneNumberVisible ? profile.phoneNumber : undefined,
    } : null;

    res.status(200).json({
      success: true,
      profile: publicProfile,
      portfolio: portfolio ? {
        photographerId: portfolio.photographerId,
        description: portfolio.description || "",
        items: portfolio.items || [],
      } : {
        photographerId,
        description: "",
        items: [],
      },
    });
  } catch (error) {
    console.error("Error fetching photographer profile for customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a job (customers only, only their own jobs)
router.delete("/api/job/:jobId", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only customers can delete jobs
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Only customers can delete jobs" });
    }

    const { jobId } = req.params;
    const customerId = req.user.uid;

    // First, verify the job exists and belongs to this customer
    const getResult = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: jobId
        }
      })
    );

    const job = getResult.Item;

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.entryType !== "job") {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    if (job.customerId !== customerId) {
      return res.status(403).json({ error: "You can only delete your own jobs" });
    }

    // Delete the job
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: jobId
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;