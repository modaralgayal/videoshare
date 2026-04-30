import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock dynamodb before importing routes
vi.mock("../client/dynamodb.js", () => ({
  ddb: { send: vi.fn() },
}));

vi.mock("uuid", () => ({ v4: () => "test-uuid-123" }));

// Mock authenticateToken to inject test user from header
vi.mock("../middleware/auth.js", () => ({
  authenticateToken: (req, res, next) => {
    const userHeader = req.headers["x-test-user"];
    if (!userHeader) return res.status(401).json({ error: "No test user" });
    req.user = JSON.parse(userHeader);
    next();
  },
}));

import { ddb } from "../client/dynamodb.js";
import jobsRouter from "../routes/jobs.js";

const makeApp = (user) => {
  const app = express();
  app.use(express.json());
  // Inject user via custom header picked up by mocked middleware
  app.use((req, _res, next) => {
    req.headers["x-test-user"] = JSON.stringify(user);
    next();
  });
  app.use("/", jobsRouter);
  return app;
};

const customerUser = {
  uid: "cust-1",
  email: "cust@test.fi",
  name: "Test Customer",
  userType: "customer",
};
const photographerUser = {
  uid: "photo-1",
  email: "photo@test.fi",
  name: "Test Photo",
  userType: "photographer",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/job", () => {
  it("creates a job for a customer and sets expiresAt", async () => {
    ddb.send.mockResolvedValue({});
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/job").send({
      services: ["valokuvat"],
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "Half day (3-4 hours)",
      difficulty: "perus",
      description: "Test job description",
      budgetMin: 100,
      budgetMax: 500,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.job.customerId).toBe("cust-1");
    expect(res.body.job.status).toBe("open");
    expect(res.body.job.expiresAt).toBeDefined();
    // expiresAt should be ~90 days from now
    const diff = new Date(res.body.job.expiresAt) - Date.now();
    expect(diff).toBeGreaterThan(89 * 24 * 60 * 60 * 1000);
  });

  it("stores customerEmail from JWT", async () => {
    ddb.send.mockResolvedValue({});
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/job").send({
      services: ["valokuvat"],
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "1-2 hours",
      difficulty: "perus",
      description: "Test",
      budgetMin: 100,
      budgetMax: 500,
      customerPhone: "+358401234567",
    });
    expect(res.status).toBe(201);
    expect(res.body.job.customerEmail).toBe("cust@test.fi");
    expect(res.body.job.customerPhone).toBe("+358401234567");
  });

  it("rejects if user is photographer", async () => {
    const app = makeApp(photographerUser);
    const res = await request(app).post("/api/job").send({
      services: ["valokuvat"],
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "1-2 hours",
      difficulty: "perus",
      description: "Test",
      budgetMin: 100,
      budgetMax: 500,
    });
    expect(res.status).toBe(403);
  });

  it("rejects missing description", async () => {
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/job").send({
      services: ["valokuvat"],
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "1-2 hours",
      difficulty: "perus",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/description/i);
  });

  it("rejects missing services", async () => {
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/job").send({
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "1-2 hours",
      difficulty: "perus",
      description: "Test",
      budgetMin: 100,
      budgetMax: 500,
    });
    expect(res.status).toBe(400);
  });

  it("rejects when budgetMin >= budgetMax", async () => {
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/job").send({
      services: ["valokuvat"],
      city: "Helsinki",
      radius: "25",
      date: "2026-08-01",
      duration: "1-2 hours",
      difficulty: "perus",
      description: "Test",
      budgetMin: 500,
      budgetMax: 100,
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/bid", () => {
  it("creates a bid for a photographer with confirmedAllServices", async () => {
    ddb.send.mockResolvedValue({});
    const app = makeApp(photographerUser);
    const res = await request(app).post("/api/bid").send({
      jobId: "job-abc",
      price: 300,
      proposal: "I can do this job",
      confirmedAllServices: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bid.confirmedAllServices).toBe(true);
    expect(res.body.bid.videographerId).toBe("photo-1");
  });

  it("rejects bid without confirmedAllServices", async () => {
    const app = makeApp(photographerUser);
    const res = await request(app).post("/api/bid").send({
      jobId: "job-abc",
      price: 300,
      proposal: "I can do this",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/confirm/i);
  });

  it("rejects if user is customer", async () => {
    const app = makeApp(customerUser);
    const res = await request(app).post("/api/bid").send({
      jobId: "job-abc",
      price: 300,
      proposal: "Test",
      confirmedAllServices: true,
    });
    expect(res.status).toBe(403);
  });

  it("rejects invalid (negative) price", async () => {
    const app = makeApp(photographerUser);
    const res = await request(app).post("/api/bid").send({
      jobId: "job-abc",
      price: -50,
      proposal: "Test",
      confirmedAllServices: true,
    });
    expect(res.status).toBe(400);
  });

  it("rejects empty proposal", async () => {
    const app = makeApp(photographerUser);
    const res = await request(app).post("/api/bid").send({
      jobId: "job-abc",
      price: 300,
      proposal: "   ",
      confirmedAllServices: true,
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/jobs - exactAddress filtering", () => {
  const mockJob = {
    id: "job-1",
    jobId: "job-1",
    entryType: "job",
    status: "open",
    city: "Helsinki",
    area: "Lauttasaari",
    exactAddress: "Sensitive Street 1",
    customerPhone: "+358401234567",
    customerEmail: "cust@test.fi",
    services: ["valokuvat"],
    description: "Test",
  };

  it("strips exactAddress, customerPhone, customerEmail for photographers", async () => {
    ddb.send.mockResolvedValue({ Items: [mockJob] });
    const app = makeApp(photographerUser);
    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.jobs[0].exactAddress).toBeUndefined();
    expect(res.body.jobs[0].customerPhone).toBeUndefined();
    expect(res.body.jobs[0].customerEmail).toBeUndefined();
    expect(res.body.jobs[0].city).toBe("Helsinki");
    expect(res.body.jobs[0].area).toBe("Lauttasaari");
  });

  it("keeps exactAddress for customers", async () => {
    ddb.send.mockResolvedValue({ Items: [mockJob] });
    const app = makeApp(customerUser);
    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.jobs[0].exactAddress).toBe("Sensitive Street 1");
    expect(res.body.jobs[0].customerPhone).toBe("+358401234567");
  });
});
