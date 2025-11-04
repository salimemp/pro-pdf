
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { signOut } from 'next-auth/react';

/**
 * GDPR Compliance: Delete User Account
 * Permanently deletes user account and all associated data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password, confirmation } = await request.json();

    // Verify user wants to delete their account
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    // Fetch user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Delete all associated data (cascading delete)
    // This includes:
    // - Sessions
    // - Files
    // - Accounts
    // - Any other related records

    await prisma.$transaction(async (tx) => {
      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // Delete files
      await tx.file.deleteMany({
        where: { userId: user.id },
      });

      // Delete accounts
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // Delete conversion history
      await tx.conversionHistory.deleteMany({
        where: { userId: user.id },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    // Note: In a production environment, you would also:
    // 1. Delete files from cloud storage (S3)
    // 2. Cancel Stripe subscription
    // 3. Send confirmation email
    // 4. Log the deletion for compliance purposes

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
