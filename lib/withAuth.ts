import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

type AuthenticatedContext = {
  user: {
    id: string;
    email: string;
    name: string;
    timezone?: string;
  };
};

export function withAuth(
  handler: (
    req: Request,
    context: AuthenticatedContext,
    params: any
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: Request, context: any) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      await dbConnect();

      const authContext: AuthenticatedContext = {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          timezone: (session.user as any).timezone,
        },
      };

      const params = context?.params ? await context.params : undefined;
      return await handler(req, authContext, params);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
