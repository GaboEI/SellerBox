
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { adminApp } from "@/firebase/admin"; // We need to create this
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to initialize Firebase Admin SDK
async function initAdmin() {
  if (adminApp) {
    return { firestore: getFirestore(adminApp) };
  }
  // This part should ideally be in a separate admin-firebase file
  // but for simplicity, we do it here.
  const { initializeAdminApp } = await import("@/firebase/admin");
  const { app } = await initializeAdminApp();
  return { firestore: getFirestore(app) };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { firestore } = await initAdmin();
    const body = await req.json();
    const { username, photoUrl } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const userEmail = session.user.email;
    const userDocRef = firestore.collection("users").doc(userEmail);

    const updates: { username: string; photoUrl?: string; updatedAt: any } = {
      username,
      updatedAt: new Date(),
    };

    if (photoUrl) {
      updates.photoUrl = photoUrl;
    }

    await userDocRef.set(updates, { merge: true });
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        name: username,
        image: photoUrl || null,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("API_PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
