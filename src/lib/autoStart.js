import { startBatchProcessor } from './batchViews';

let processorStarted = false;

export function ensureBatchProcessorStarted() {
  if (!processorStarted && typeof window === 'undefined') {
    // Only start on server-side
    try {
      startBatchProcessor();
      processorStarted = true;
      console.log('✅ Batch processor auto-started');
    } catch (error) {
      console.error('❌ Failed to auto-start batch processor:', error);
    }
  }
}

// Auto-start when this module is imported on the server
if (typeof window === 'undefined') {
  // Add a small delay to ensure database connection is ready
  setTimeout(() => {
    ensureBatchProcessorStarted();
  }, 1000);
} 