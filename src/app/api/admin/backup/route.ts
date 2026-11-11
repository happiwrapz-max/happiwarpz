import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const backupDir = path.join(process.cwd(), ".data", "backups");
    let backups: Array<{ name: string; size: number; createdAt: string }> = [];

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".json"));
      backups = files.map((file) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      count: backups.length,
      backups,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve backup list");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const dataDir = path.join(process.cwd(), ".data");
    const dbFile = path.join(dataDir, "db.json");
    const backupDir = path.join(dataDir, "backups");

    if (!fs.existsSync(dbFile)) {
      return NextResponse.json(
        { success: false, error: "Database file does not exist" },
        { status: 404 }
      );
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    const rawData = fs.readFileSync(dbFile, "utf-8");
    fs.writeFileSync(backupFilePath, rawData, "utf-8");

    const checksum = crypto.createHash("sha256").update(rawData).digest("hex");
    const parsed = JSON.parse(rawData);

    logAdminAction({
      actor: adminCheck.user,
      action: "BACKUP_CREATED",
      note: `Created database backup ${backupFileName} with checksum ${checksum.substring(0, 8)}...`,
    });

    return NextResponse.json({
      success: true,
      message: "Database snapshot created successfully",
      backupFile: backupFileName,
      checksum,
      sizeBytes: Buffer.byteLength(rawData),
      tables: {
        products: parsed.products?.length || 0,
        orders: parsed.orders?.length || 0,
        users: parsed.users?.length || 0,
        customOrders: parsed.customOrders?.length || 0,
        coupons: parsed.coupons?.length || 0,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to generate database backup");
  }
}
