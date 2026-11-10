import { z } from 'zod';

const RESERVED_PATHS = new Set([
  'login', 'join', 'explore', 'trending', 'pricing', 'features', 'enterprise',
  'marketplace', 'topics', 'collections', 'security', 'customer-stories',
  'settings', 'notifications', 'about', 'contact', 'site', 'dashboard',
  'pulls', 'issues', 'codespaces', 'sponsors', 'search'
]);

const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const REPO_REGEX = /^[a-zA-Z0-9_.-]{1,100}$/;

export const githubUrlSchema = z.string().trim().superRefine((val, ctx) => {
  if (!val) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'GitHub URL is required',
    });
    return;
  }

  let testUrl = val;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = `https://${testUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(testUrl);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter a valid URL',
    });
    return;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== 'github.com' && hostname !== 'www.github.com') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only public GitHub URLs (github.com) are accepted',
    });
    return;
  }

  const segments = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide a GitHub username or repository path',
    });
    return;
  }

  if (segments.length > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only GitHub profile (github.com/user) or repository (github.com/user/repo) URLs are supported',
    });
    return;
  }

  const username = segments[0];
  if (RESERVED_PATHS.has(username.toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `"${username}" is a reserved GitHub page, not a valid user profile or repository`,
    });
    return;
  }

  if (!USERNAME_REGEX.test(username)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'The GitHub username contains invalid characters',
    });
    return;
  }

  if (segments.length === 2) {
    let repoName = segments[1];
    if (repoName.endsWith('.git')) {
      repoName = repoName.slice(0, -4);
    }
    if (!REPO_REGEX.test(repoName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The repository name contains invalid characters',
      });
      return;
    }
  }
});

export const analysisFormSchema = z.object({
  githubUrl: githubUrlSchema,
});

export type AnalysisFormInput = z.infer<typeof analysisFormSchema>;

