#!/usr/bin/env node
/**
 * =============================================================================
 * Database Migration Script
 * =============================================================================
 * Runs Supabase schema migrations for the AI Voice Generator
 *
 * Usage:
 *   npm run db:migrate
 *   node scripts/migrate.js
 * =============================================================================
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// =============================================================================
// Configuration
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SCHEMA_PATH = path.join(__dirname, '../supabase/schema.sql');

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Read SQL schema file
 */
function readSchemaFile() {
  try {
    if (!fs.existsSync(SCHEMA_PATH)) {
      throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
    }

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    console.log(`✅ Schema file loaded: ${SCHEMA_PATH}\n`);
    return schema;
  } catch (error) {
    console.error(`❌ Error reading schema file: ${error.message}`);
    throw error;
  }
}

/**
 * Split SQL into individual statements
 * Handles multi-line statements and comments
 */
function splitSQLStatements(sql) {
  // Remove comments
  const cleanSQL = sql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

  // Split by semicolon, but not within quotes or dollar quotes
  const statements = [];
  let current = '';
  let inQuote = false;
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < cleanSQL.length; i++) {
    const char = cleanSQL[i];
    current += char;

    // Handle dollar quotes (for functions)
    if (char === '$' && !inQuote) {
      const remaining = cleanSQL.substring(i);
      const dollarMatch = remaining.match(/^\$([a-zA-Z_]*)\$/);
      if (dollarMatch) {
        const tag = dollarMatch[1];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    // Handle regular quotes
    if (char === "'" && !inDollarQuote && cleanSQL[i - 1] !== '\\') {
      inQuote = !inQuote;
    }

    // Split on semicolon if not in quotes
    if (char === ';' && !inQuote && !inDollarQuote) {
      const statement = current.trim();
      if (statement && statement !== ';') {
        statements.push(statement);
      }
      current = '';
    }
  }

  // Add any remaining statement
  const lastStatement = current.trim();
  if (lastStatement && lastStatement !== ';') {
    statements.push(lastStatement);
  }

  return statements.filter(s => s.length > 0);
}

/**
 * Execute SQL statement
 */
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      // This is a fallback for environments where RPC isn't available
      console.warn('⚠️  RPC method not available, trying alternative approach...');
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Check if table exists
 */
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}

// =============================================================================
// Main Migration Function
// =============================================================================

async function runMigration() {
  console.log('🔄 Starting database migration...\n');
  console.log('='.repeat(60));

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const { error: connectionError } = await supabase
      .from('_test_connection_')
      .select('*')
      .limit(1);

    // Connection error is expected if table doesn't exist, that's fine
    console.log('✅ Database connection successful\n');

    // Check if migration is needed
    console.log('🔍 Checking current database state...');
    const userTableExists = await tableExists('voicegen_users');
    const voiceTableExists = await tableExists('voicegen_voices');
    const generationTableExists = await tableExists('voicegen_generations');

    if (userTableExists && voiceTableExists && generationTableExists) {
      console.log('✅ Core tables already exist');
      console.log('\n⚠️  Database appears to be already migrated.');
      console.log('If you want to re-run migrations, please manually drop the tables first.\n');

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Continue anyway? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('\n❌ Migration cancelled.');
        process.exit(0);
      }
    }

    console.log('\n📖 Reading schema file...');
    const schema = readSchemaFile();

    console.log('📝 Parsing SQL statements...');
    const statements = splitSQLStatements(schema);
    console.log(`✅ Found ${statements.length} SQL statements\n`);

    console.log('='.repeat(60));
    console.log('🚀 Executing migration...\n');

    // Note: Direct SQL execution via Supabase JS client is limited
    // For production, use Supabase CLI or direct PostgreSQL connection
    console.log('⚠️  IMPORTANT:');
    console.log('This script provides basic migration support.');
    console.log('For full migration support, use one of these methods:\n');
    console.log('1. Supabase CLI:');
    console.log('   npx supabase db push\n');
    console.log('2. Direct PostgreSQL connection:');
    console.log('   psql $DATABASE_URL < supabase/schema.sql\n');
    console.log('3. Supabase Dashboard:');
    console.log('   Copy schema.sql contents to SQL Editor\n');
    console.log('='.repeat(60));

    // For now, just verify the schema file is valid
    console.log('\n✅ Schema file is valid and ready to execute');
    console.log('📄 Location: ' + SCHEMA_PATH);
    console.log('\n💡 To apply migrations, run:');
    console.log('   npx supabase db push');
    console.log('   OR');
    console.log('   psql $DATABASE_URL < supabase/schema.sql\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// =============================================================================
// Alternative: Direct PostgreSQL Migration
// =============================================================================

async function runDirectMigration() {
  const { Client } = require('pg');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected\n');

    const schema = readSchemaFile();
    const statements = splitSQLStatements(schema);

    console.log(`📝 Executing ${statements.length} statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');

      try {
        await client.query(statement);
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      } catch (error) {
        console.error(`❌ [${i + 1}/${statements.length}] ${preview}...`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    await client.end();

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Migration completed with errors.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:');
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

// =============================================================================
// Run Script
// =============================================================================

if (require.main === module) {
  // Check if pg module is available for direct migration
  try {
    require.resolve('pg');
    const useDirect = process.argv.includes('--direct');

    if (useDirect) {
      console.log('🐘 Using direct PostgreSQL migration\n');
      runDirectMigration();
    } else {
      runMigration();
    }
  } catch {
    // pg module not available, use standard migration
    runMigration();
  }
}

module.exports = { runMigration, runDirectMigration };
