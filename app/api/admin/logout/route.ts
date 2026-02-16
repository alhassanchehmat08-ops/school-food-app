import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  cookies().set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
