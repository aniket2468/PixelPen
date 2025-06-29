import { startBatchProcessor, triggerBatchUpdate } from "@/lib/batchViews";
import { NextResponse } from "next/server";

// Global variable to track if processor is already running
let processorStarted = false;

// GET - Start the batch processor
export const GET = async () => {
  try {
    if (!processorStarted) {
      startBatchProcessor();
      processorStarted = true;
      return NextResponse.json({ 
        message: "Batch processor started successfully",
        status: "started" 
      });
    } else {
      return NextResponse.json({ 
        message: "Batch processor already running",
        status: "running" 
      });
    }
  } catch (error) {
    console.error('Error starting batch processor:', error);
    return NextResponse.json({ 
      message: "Failed to start batch processor",
      error: error.message 
    }, { status: 500 });
  }
};

// POST - Manually trigger a batch update (for testing)
export const POST = async () => {
  try {
    await triggerBatchUpdate();
    return NextResponse.json({ 
      message: "Manual batch update completed",
      status: "completed" 
    });
  } catch (error) {
    console.error('Error in manual batch update:', error);
    return NextResponse.json({ 
      message: "Manual batch update failed",
      error: error.message 
    }, { status: 500 });
  }
}; 