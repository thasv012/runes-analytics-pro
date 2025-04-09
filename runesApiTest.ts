// runesApiTest.ts
import 'dotenv/config'; // Load .env variables first
import { RunesApiService } from './src/services/RunesApiService'; // Adjust path if needed
import chalk from 'chalk';

async function testRunesApi() {
    console.log(chalk.inverse.bold('\n🚀 STARTING RUNES API SERVICE TEST 🚀\n'));

    // --- Test getTokenById ---
    // Use a known Rune name or ID. Replace if needed.
    // Common Runes: UNCOMMON•GOODS, Z•Z•Z•Z•Z•FEHU•Z•Z•Z•Z•Z, DOG•GO•TO•THE•MOON
    // Or use a numeric ID for GeniiData like 840000:1 (COOK)
    const testIdOrName = 'UNCOMMON•GOODS';
    // const testIdOrName = '840000:1'; // Try this ID too

    console.log(chalk.blue.bold(`🔍 Testing getTokenById for: ${testIdOrName}...`));
    try {
        const runeDetails = await RunesApiService.getTokenById(testIdOrName);
        if (runeDetails) {
            console.log(chalk.green('✅ Details Found:'));
            // Only log key details for brevity
            console.log(chalk.greenBright(`   Name: ${runeDetails.name}, ID: ${runeDetails.id}, Source: ${runeDetails.sourceApi}`));
            console.log(chalk.greenBright(`   Supply: ${runeDetails.supply}, Holders: ${runeDetails.holders ?? 'N/A'}`));
            // console.log(chalk.greenBright(JSON.stringify(runeDetails, null, 2))); // Uncomment for full details
        } else {
            console.log(chalk.yellow(`🟡 Details not found for ${testIdOrName}. (May be expected if APIs failed or token invalid)`));
        }
    } catch (error: any) {
        console.error(chalk.red(`❌ Error fetching details for ${testIdOrName}:`), error.message);
        if (error.stack) console.error(chalk.gray(error.stack.substring(0, 300))); // Log short stack trace
    }
    console.log(chalk.gray('----------------------------------------')); // Separator


    // --- Test getPopularTokens ---
    console.log(chalk.blue.bold('\n🔥 Testing getPopularTokens (Top 5 by Market Cap)...'));
    try {
        const popularRunes = await RunesApiService.getPopularTokens(5, 1, 'market_cap_usd');
        if (popularRunes.length > 0) {
            console.log(chalk.green(`✅ Found ${popularRunes.length} Popular Runes:`));
            console.log(chalk.greenBright(JSON.stringify(popularRunes.map(r => ({ name: r.name, id: r.id, marketCap: r.marketCapUsd })), null, 2)));
        } else {
            console.log(chalk.yellow('🟡 No popular runes returned. (Check GeniiData API key/endpoint or data availability)'));
        }
    } catch (error: any) {
        console.error(chalk.red('❌ Error fetching popular tokens:'), error.message);
         if (error.stack) console.error(chalk.gray(error.stack.substring(0, 300)));
    }
    console.log(chalk.gray('----------------------------------------'));


    // --- Test getTokenHistory ---
     console.log(chalk.blue.bold(`\n📈 Testing getTokenHistory for: ${testIdOrName}...`));
     try {
        const runeHistory = await RunesApiService.getTokenHistory(testIdOrName);
        if (runeHistory.length > 0) {
            console.log(chalk.green(`✅ Found ${runeHistory.length} History Points:`));
            console.log(chalk.greenBright(`   First point: ${new Date(runeHistory[0].timestamp * 1000).toISOString()} - Price: ${runeHistory[0].price}`));
            console.log(chalk.greenBright(`   Last point:  ${new Date(runeHistory[runeHistory.length - 1].timestamp * 1000).toISOString()} - Price: ${runeHistory[runeHistory.length - 1].price}`));
        } else {
            console.log(chalk.yellow(`🟡 No history found for ${testIdOrName}. (Check Magic Eden endpoint/data availability or token name)`));
        }
    } catch (error: any) {
        console.error(chalk.red(`❌ Error fetching history for ${testIdOrName}:`), error.message);
         if (error.stack) console.error(chalk.gray(error.stack.substring(0, 300)));
    }
    console.log(chalk.gray('----------------------------------------'));


    console.log(chalk.inverse.bold('\n🏁 RUNES API SERVICE TEST COMPLETE 🏁\n'));
}

// Execute the test function
testRunesApi().catch(err => {
    console.error(chalk.bgRed.white.bold('\n🚨 UNHANDLED ERROR DURING TEST:'), err);
    process.exit(1); // Exit with error code if test function fails critically
});