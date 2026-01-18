import { NextResponse } from "next/server";

export async function POST() {
  const apiToken = process.env.KOYEB_API_TOKEN;
  const serviceId = process.env.KOYEB_SERVICE_ID;

  if (!apiToken || !serviceId) {
    return NextResponse.json(
      { error: "Koyeb credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://app.koyeb.com/v1/services/${serviceId}/redeploy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to redeploy service", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
