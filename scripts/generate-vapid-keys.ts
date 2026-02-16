#!/usr/bin/env tsx

/**
 * Utility to generate VAPID keys for Web Push notifications
 * 
 * Run with: npm run generate-vapid-keys
 * or: npx tsx scripts/generate-vapid-keys.ts
 */

import webPush from 'web-push';

console.log('\n🔑 Generating VAPID keys for Web Push notifications...\n');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env file:\n');
console.log('━'.repeat(60));
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('━'.repeat(60));
console.log('\n💡 Note: VAPID_SUBJECT should be a mailto: or https: URL\n');
console.log('Example: mailto:admin@orgatick.in or https://orgatick.in\n');
