import { currentUser } from "@clerk/nextjs/server";
import prisma from "prisma";
import { db } from "./db";
import { use } from "react";

export async function checkUser(): Promise<any> {
    const user = await currentUser();
    if (!user) {
        return null;
    }

    const dbUser = await db.user.findUnique({
        where: {
            id: user.id,
        },
    });

    if( dbUser ) {
        return dbUser;
    }

    const newUser = await db.user.create({
        data: {
            id: user.id,
            clerkId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0]?.emailAddress,
        },
    });
    return newUser;
};




