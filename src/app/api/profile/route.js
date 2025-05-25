import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';
import { NextResponse } from 'next/server';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { app } from '@/utils/firebase';

export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }), 
      { status: 401 }
    );
  }

  try {
    const { name, username, image } = await req.json();

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Name is required!" }), 
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username && username.trim() !== '') {
      const trimmedUsername = username.trim();
      
      // Check username format
      if (trimmedUsername.length < 3) {
        return new NextResponse(
          JSON.stringify({ message: "Username must be at least 3 characters long!" }), 
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return new NextResponse(
          JSON.stringify({ message: "Username can only contain letters, numbers, and underscores!" }), 
          { status: 400 }
        );
      }

      // Check if username is already taken (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: {
            email: session.user.email
          }
        }
      });

      if (existingUser) {
        return new NextResponse(
          JSON.stringify({ message: "Username is already taken!" }), 
          { status: 409 }
        );
      }
    }

    // Prepare username value (null if empty, trimmed if provided)
    const usernameValue = (username && username.trim() !== '') ? username.trim() : null;

    // Get current user data to check for existing image
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { image: true }
    });

    // Delete old profile image from Firebase if a new one is being uploaded
    if (image && currentUser?.image && currentUser.image !== image) {
      try {
        // Extract file path from Firebase URL
        const storage = getStorage(app);
        const oldImageUrl = currentUser.image;
        
        // Check if it's a Firebase Storage URL
        if (oldImageUrl.includes('firebasestorage.googleapis.com')) {
          // Extract the file path from the URL
          const urlParts = oldImageUrl.split('/o/')[1];
          if (urlParts) {
            const filePath = decodeURIComponent(urlParts.split('?')[0]);
            const oldImageRef = ref(storage, filePath);
            
            // Delete the old image
            await deleteObject(oldImageRef);
            console.log('Old profile image deleted successfully');
          }
        }
      } catch (error) {
        // Log the error but don't fail the update
        console.warn('Failed to delete old profile image:', error);
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name: name.trim(),
        username: usernameValue,
        image: image || null
      },
    });

    return new NextResponse(
      JSON.stringify({
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Profile update error:', err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }), 
      { status: 500 }
    );
  }
};
