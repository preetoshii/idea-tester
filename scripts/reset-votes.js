import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'preetoshii/idea-tester';
const FILE_PATH = 'votes.json';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN not found in .env.local');
  process.exit(1);
}

async function resetVotes() {
  console.log('🔄 Connecting to GitHub...');
  
  try {
    // 1. Fetch current votes
    const getFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const response = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ No votes.json found on GitHub. Nothing to back up.');
      } else {
        throw new Error(`GitHub API Error: ${response.statusText}`);
      }
    } else {
      // 2. Save Backup
      const fileData = await response.json();
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const votes = JSON.parse(content);
      
      const backupDir = path.join(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `votes_backup_${timestamp}.json`);
      
      fs.writeFileSync(backupFile, JSON.stringify(votes, null, 2));
      console.log(`✅ Backup saved to: ${backupFile}`);
      
      // Store SHA for update
      var sha = fileData.sha;
    }

    // 3. Wipe votes on GitHub (Write empty array)
    console.log('🗑️  Clearing votes on GitHub...');
    
    const updateUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const newContent = Buffer.from('[]').toString('base64');
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'RESET: Clearing votes via admin script',
        content: newContent,
        sha: sha // Required if file existed
      })
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      throw new Error(`Failed to clear votes: ${JSON.stringify(err)}`);
    }

    console.log('✨ Success! Database cleared and fresh.');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

resetVotes();

