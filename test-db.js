import pg from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const passwords = [
  "crossdagi01",
  "crossdagi01@gmail.com",
  "crossdagi01@gmail.com's Project]",
  "crossdagi01@gmail.com's Project"
];

const regions = [
  "eu-central-1", // Frankfurt
  "eu-west-1",    // Ireland
  "eu-west-2",    // London
  "eu-west-3",    // Paris
  "us-east-1",    // N. Virginia
  "us-east-2",    // Ohio
  "us-west-1",    // N. California
  "us-west-2",    // Oregon
  "ap-southeast-1", // Singapore
  "ap-southeast-2", // Sydney
  "ap-northeast-1", // Tokyo
  "ca-central-1",  // Canada
  "sa-east-1"      // São Paulo
];

async function scanRegions() {
  console.log("LOG: Scanning Supabase poolers in all major regions with password variations...");
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    
    for (const pw of passwords) {
      const encodedPassword = encodeURIComponent(pw);
      
      for (const port of [5432, 6543]) {
        const dbUrl = `postgresql://postgres.tkmtvjszejjpqehxbpla:${encodedPassword}@${host}:${port}/postgres`;
        
        const client = new pg.Client({
          connectionString: dbUrl,
          connectionTimeoutMillis: 1500,
        });
        
        try {
          await client.connect();
          console.log("==================================================");
          console.log(`SUCCESS: Connected to region: "${region}" on Port ${port}!`);
          const res = await client.query('SELECT NOW()');
          console.log("DB Time Result:", res.rows[0]);
          console.log("Working Connection String:", dbUrl);
          console.log("==================================================");
          await client.end();
          return dbUrl;
        } catch (err) {
          if (err.message.includes("Tenant or user not found")) {
            // Wrong region or project ref, break early for this region
            break;
          } else if (err.message.includes("password authentication failed")) {
            // Correct region/tenant, but wrong password! Log it!
            console.log(`Region MATCHED ("${region}"), but password "${pw}" failed authentication.`);
          } else {
            // Other network error or host ENOTFOUND
          }
        }
      }
    }
  }
  
  throw new Error("Could not connect to database with any password or region combination.");
}

scanRegions().catch(err => {
  console.error("SCAN FAILED:", err.message);
  process.exit(1);
});
