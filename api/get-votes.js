// Vercel Serverless Function to fetch votes from GitHub
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || 'preetoshii/idea-tester';
  const FILE_PATH = 'votes.json';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const getFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const response = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // File doesn't exist yet, return empty array
        return res.status(200).json([]);
      }
      const error = await response.json();
      return res.status(500).json({ error: 'Failed to fetch from GitHub', details: error });
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const votes = JSON.parse(content);

    return res.status(200).json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

