import { SupabaseClient } from "@supabase/supabase-js";

interface GitHubRepoSummary {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastPush: string;
  languages: Record<string, number>;
  commitCount: number;
  commitsPerWeek: number;
}

export async function fetchRepoSummary(
  repoUrl: string,
  githubToken: string,
  supabase: SupabaseClient
): Promise<{ data: GitHubRepoSummary | null; error: string | null }> {
  try {
    
    const { data: cached } = await supabase
      .from("github_repo_cache")
      .select("*")
      .eq("repo_url", repoUrl)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return { data: cached.summary as GitHubRepoSummary, error: null };
    }

    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return { data: null, error: "Invalid GitHub repository URL" };
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    // Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      { headers }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 401) {
        return { data: null, error: "GitHub token is invalid or expired" };
      }
      if (repoResponse.status === 404) {
        return { data: null, error: "Repository not found" };
      }
      return { data: null, error: "Failed to fetch repository details" };
    }

    const repoData = await repoResponse.json();

    // Fetch languages
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/languages`,
      { headers }
    );
    const languages = languagesResponse.ok
      ? await languagesResponse.json()
      : {};


    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/commits?per_page=100`,
      { headers }
    );
    const commits = commitsResponse.ok ? await commitsResponse.json() : [];

    // Calculate commits per week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommits = commits.filter((commit: any) => {
      const commitDate = new Date(commit.commit.author.date);
      return commitDate >= thirtyDaysAgo;
    });

    const commitsPerWeek = (recentCommits.length / 30) * 7;

    const summary: GitHubRepoSummary = {
      name: repoData.name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      lastPush: repoData.pushed_at,
      languages,
      commitCount: commits.length,
      commitsPerWeek: Math.round(commitsPerWeek * 10) / 10,
    };

    // Cache the result
    await supabase.from("github_repo_cache").upsert({
      repo_url: repoUrl,
      summary,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return { data: summary, error: null };
  } catch (error) {
    console.error("[GitHub] Error fetching repo summary:", error);
    return { data: null, error: "Failed to fetch repository information" };
  }
}
