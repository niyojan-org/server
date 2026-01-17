import axios from "axios";
import type { Request } from "express";
import { z } from "zod";
import logger from "@config/logger";

// Zod schemas
export const locationInfoSchema = z.object({
  city: z.string(),
  region: z.string(),
  country: z.string(),
  formatted: z.string(),
});

export const ipAndLocationInfoSchema = z.object({
  ip: z.string(),
  location: z.string(),
  locationDetails: locationInfoSchema,
});

// API response schema from ip-api.com
const ipApiResponseSchema = z.object({
  status: z.string(),
  country: z.string().optional(),
  regionName: z.string().optional(),
  city: z.string().optional(),
});

// Infer types from schemas
export type LocationInfo = z.infer<typeof locationInfoSchema>;
export type IPAndLocationInfo = z.infer<typeof ipAndLocationInfoSchema>;

/**
 * Extract real IP address from request
 * @param req - Express request object
 * @returns Real IP address
 */
export const getRealIP = (req: Request): string => {
  // Check various headers for real IP (when behind proxy/load balancer)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ipList = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (ipList) {
      const firstIP = ipList.split(",")[0];
      if (firstIP) {
        return firstIP.trim();
      }
    }
  }

  return (
    (req.headers["x-real-ip"] as string) ||
    (req.headers["cf-connecting-ip"] as string) || // Cloudflare
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown"
  );
};

/**
 * Get location information from IP address
 * @param ip - IP address
 * @returns Location information
 */
export const getLocationFromIP = async (ip: string): Promise<LocationInfo> => {
  try {
    // Skip for localhost/private IPs
    if (
      !ip ||
      ip === "Unknown" ||
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      return {
        city: "Local",
        region: "Local",
        country: "Local",
        formatted: "Local Network",
      };
    }

    // Using ip-api.com (free, no API key required, 45 req/min limit)
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 3000,
    });

    // Validate API response with Zod
    const validatedData = ipApiResponseSchema.safeParse(response.data);

    if (validatedData.success && validatedData.data.status === "success") {
      const data = validatedData.data;
      return {
        city: data.city || "Unknown",
        region: data.regionName || "Unknown",
        country: data.country || "Unknown",
        formatted: `${data.city || "Unknown"}, ${data.regionName || "Unknown"}, ${
          data.country || "Unknown"
        }`,
      };
    }

    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      formatted: "Unknown",
    };
  } catch (error) {
    logger.error("Error fetching location from IP:", error);
    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      formatted: "Unknown",
    };
  }
};

/**
 * Get IP and location information from request
 * @param req - Express request object (optional)
 * @returns Object containing IP and location info
 */
export const getIPAndLocation = async (req?: Request): Promise<IPAndLocationInfo> => {
  if (!req) {
    return {
      ip: "Unknown",
      location: "Unknown",
      locationDetails: {
        city: "Unknown",
        region: "Unknown",
        country: "Unknown",
        formatted: "Unknown",
      },
    };
  }

  const ip = getRealIP(req);
  const location = await getLocationFromIP(ip);

  return {
    ip,
    location: location.formatted,
    locationDetails: location,
  };
};
