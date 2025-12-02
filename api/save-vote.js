// Vercel Serverless Function to save votes to GitHub
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { voter, timestamp, selections } = req.body;

  if (!voter || !selections) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || 'preetoshii/idea-tester';
  const FILE_PATH = 'votes.json';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    // Get current file content (if exists)
    const getFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let existingData = [];
    let sha = null;

    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      existingData = JSON.parse(content);
      sha = fileData.sha;
    }

    // Append new vote
    const newVote = {
      voter,
      timestamp,
      selections
    };
    existingData.push(newVote);

    // Update file on GitHub
    const updateFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const content = JSON.stringify(existingData, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    const updateResponse = await fetch(updateFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add vote from ${voter}`,
        content: encodedContent,
        sha: sha // Required for updates
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('GitHub API error:', error);
      return res.status(500).json({ error: 'Failed to save to GitHub', details: error });
    }

    return res.status(200).json({ success: true, message: 'Vote saved successfully' });
  } catch (error) {
    console.error('Error saving vote:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}


