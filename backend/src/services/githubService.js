// backend/src/services/githubService.js

import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch GitHub organization stats
 * No auth needed for public data (60 req/hour limit)
 */
export async function fetchGithubActivity(githubOrg) {
  if (!githubOrg) return null;

  try {
    // Get organization info
    const { data: org } = await axios.get(`${GITHUB_API}/orgs/${githubOrg}`);

    // Get recent repos
    const { data: repos } = await axios.get(
      `${GITHUB_API}/orgs/${githubOrg}/repos`,
      { params: { sort: 'updated', per_page: 10 } }
    );

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    return {
      publicRepos: org.public_repos,
      followers: org.followers,
      totalStars,
      totalForks,
      topRepos: repos.slice(0, 5).map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.updated_at,
        url: r.html_url
      }))
    };

  } catch (error) {
    console.error(`GitHub fetch error for ${githubOrg}:`, error.message);
    return null;
  }
}