// test-scripts.js
// Basic Node.js script to test RunesApiService functionalities.
// Run with: node test-scripts.js

// --- Imports --- 
// Assuming ESM syntax is configured in package.json ("type": "module") 
// or use require() syntax if not.
import RunesApiService from './src/services/RunesApiService.js';
import AdvancedCacheService from './src/cache/AdvancedCacheService.js';
// We don't directly mock fetch here, relies on actual network or manual mocking/blocking

// --- Configuration --- 
const TEST_RUNE_ID = 'SATOSHI•NAKAMOTO'; // <<< REPLACE WITH A VALID RUNE ID/NAME
const TEST_DELAY_MS = 1500; // Delay between some tests to observe changes

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Test Runner --- 
async function runTests() {
  console.log(`\n===== STARTING RunesApiService Tests (Rune: ${TEST_RUNE_ID}) =====`);

  // --- Test 1: Initial Fetch (Info) --- 
  console.log('\n--- Test 1: Initial getRuneInfo --- ');
  try {
    const initialInfo = await RunesApiService.getRuneInfo(TEST_RUNE_ID);
    if (initialInfo && initialInfo.id) {
      console.log('[PASS] Initial info fetched successfully:', JSON.stringify(initialInfo, null, 2));
    } else {
      console.error('[FAIL] Failed to fetch initial info or data invalid.', initialInfo);
    }
  } catch (err) {
    console.error('[FAIL] Error during initial info fetch:', err);
  }
  await delay(TEST_DELAY_MS);

  // --- Test 2: Cache Hit (Info) --- 
  console.log('\n--- Test 2: Cache Hit getRuneInfo --- ');
  console.log('(Expecting cache hit log from service)');
  const startTimeInfoCache = Date.now();
  const cachedInfo = await RunesApiService.getRuneInfo(TEST_RUNE_ID);
  const durationInfoCache = Date.now() - startTimeInfoCache;
  if (cachedInfo && cachedInfo.id) {
    console.log(`[PASS] Cached info retrieved (duration: ${durationInfoCache}ms).`);
    // Note: We can't easily assert *no* network call without proper fetch mocking
  } else {
    console.error('[FAIL] Failed to retrieve cached info.');
  }
  await delay(TEST_DELAY_MS);

  // --- Test 3: Initial Fetch (Holders) --- 
  console.log(`\n--- Test 3: Initial getRuneHolders (using GeniiData) ---`);
  try {
    const initialHolders = await RunesApiService.getRuneHolders(TEST_RUNE_ID);
    if (Array.isArray(initialHolders)) {
      console.log(`[PASS] Initial holders fetched successfully. Count: ${initialHolders.length}`);
      if (initialHolders.length > 0) {
         console.log('First holder:', JSON.stringify(initialHolders[0], null, 2));
      }
    } else {
      console.error('[FAIL] Failed to fetch initial holders or data invalid.', initialHolders);
    }
  } catch (err) {
    console.error('[FAIL] Error during initial holders fetch:', err);
  }
  await delay(TEST_DELAY_MS);

  // --- Test 4: Cache Hit (Holders) --- 
  console.log('\n--- Test 4: Cache Hit getRuneHolders --- ');
  console.log('(Expecting cache hit log from service)');
  const startTimeHolderCache = Date.now();
  const cachedHolders = await RunesApiService.getRuneHolders(TEST_RUNE_ID);
  const durationHolderCache = Date.now() - startTimeHolderCache;
  if (Array.isArray(cachedHolders)) {
    console.log(`[PASS] Cached holders retrieved (duration: ${durationHolderCache}ms). Count: ${cachedHolders.length}`);
  } else {
    console.error('[FAIL] Failed to retrieve cached holders.');
  }
  await delay(TEST_DELAY_MS);

  // --- Test 5: Fallback Simulation (Info) --- 
  console.log('\n--- Test 5: Fallback Simulation getRuneInfo --- ');
  console.log('>>> MANUALLY SIMULATE FAILURE for MagicEden/GeniiData NOW (e.g., disconnect Wi-Fi, block URLs, or edit API files) <<< ');
  await delay(5000); // Give time to simulate failure
  
  console.log('Attempting fetch during simulated failure...');
  // Clear cache for the specific item to force re-fetch attempt
  AdvancedCacheService.delete(`rune:info:magiceden:${TEST_RUNE_ID.toLowerCase()}`);
  AdvancedCacheService.delete(`rune:info:geniidata:${TEST_RUNE_ID.toLowerCase()}`);
  AdvancedCacheService.delete(`rune:info:ordiscan:${TEST_RUNE_ID.toLowerCase()}`);
  
  try {
    const fallbackInfo = await RunesApiService.getRuneInfo(TEST_RUNE_ID);
    console.log('Fallback Sequence Result:', JSON.stringify(fallbackInfo, null, 2));
    if (fallbackInfo && fallbackInfo.id) {
       console.log(`[PASS] Fallback sequence completed. Final source: ${fallbackInfo.sourceAPI}`);
       if (fallbackInfo.sourceAPI === 'mock') {
           console.log('(Result appears to be from Mock Data)')
       }
    } else {
       console.warn('[WARN] Fallback sequence completed but returned invalid/null data.');
    }
  } catch (err) {
     console.error('[FAIL] Error during fallback simulation fetch:', err);
  }
  console.log('>>> You can now restore connectivity / undo manual failure simulations <<< ');
  
  console.log('\n===== Tests Completed =====');
}

// --- Execute --- 
runTests().catch(err => {
  console.error("\n!!!! Unhandled Error during test execution !!!!", err);
}); 