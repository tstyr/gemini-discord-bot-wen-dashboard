import { NextResponse } from "next/server";

export async function GET() {
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
      `https://app.koyeb.com/v1/services/${serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch service status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
