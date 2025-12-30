/**
 * Example Seed File
 * 
 * Export a run function that accepts the PocketBase client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function run(_pb: any) {
  console.log('  👋 Hello from example seed!');
  
  // Example: Check if admin exists (this is just for demo, as we are running as admin)
  // const admins = await pb.collection('_superusers').getFullList();
  // console.log(`  Found ${admins.length} superusers.`);
}
