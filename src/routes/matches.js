import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../config/db.js";
import { matches } from "../config/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello from express server",
  });
});

matchRouter.post("/", async (req, res) => {
  try {
    const parsed = createMatchSchema.safeParse(req.body);

    const {
      data: { startTime, endTime, homeScore, awayScore },
    } = parsed;

    if (!parsed.success) {
      res.status(400).send({
        success: false,
        message: "Invalid payload.",
        details: JSON.stringify(parsed.error),
      });
    }

    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Match created successfully!",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: JSON.stringify(error),
    });
  }
});

matchRouter.get("/get", async (req, res) => {
  try {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query!",
        details: JSON.stringify(parsed.error),
      });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createAt))
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Matches fetched successfully!",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      details: JSON.stringify(error),
    });
  }
});
