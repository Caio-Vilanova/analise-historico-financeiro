import JSZip from 'jszip';

export interface ScanResult {
  targetName: string;
  totalFiles: number;
  totalLoc: number;
  languages: {
    java: number;
    cobol: number;
    powerscript: number;
    natural: number;
    other: number;
  };
  debtScore: string;
  vulnerabilities: number;
}

const EXTENSION_MAP: Record<string, keyof ScanResult['languages']> = {
  '.java': 'java',
  '.cbl': 'cobol',
  '.cob': 'cobol',
  '.cpy': 'cobol',
  '.srw': 'powerscript',
  '.srm': 'powerscript',
  '.sru': 'powerscript',
  '.nsp': 'natural',
  '.nsn': 'natural',
  '.nss': 'natural',
};

// Rough LOC estimation per file based on typical enterprise legacy sizes
const ESTIMATED_LOC_PER_FILE = 450; 

function initializeResult(targetName: string): ScanResult {
  return {
    targetName,
    totalFiles: 0,
    totalLoc: 0,
    languages: {
      java: 0,
      cobol: 0,
      powerscript: 0,
      natural: 0,
      other: 0,
    },
    debtScore: 'Critical',
    vulnerabilities: 0,
  };
}

export async function analyzeGithub(url: string): Promise<ScanResult> {
  let owner = '';
  let repo = '';
  
  try {
    let parsedUrl = url;
    if (!parsedUrl.startsWith('http')) {
      parsedUrl = 'https://' + parsedUrl;
    }
    const urlObj = new URL(parsedUrl);
    if (urlObj.hostname.includes('github.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1].replace('.git', '');
      }
    }
  } catch (e) {
    // ignore
  }

  if (!owner || !repo) {
    // Try simple format
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 2) {
      owner = parts[0];
      repo = parts[1].replace('.git', '');
    } else {
      throw new Error('Invalid GitHub URL structure. Use format: https://github.com/owner/repo');
    }
  }
  
  const result = initializeResult(`${owner}/${repo}`);
  
  const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoInfoRes.ok) {
    const errBody = await repoInfoRes.json().catch(() => ({}));
    throw new Error(`GitHub API Error: ${errBody.message || repoInfoRes.statusText || 'Repo not found or private'}`);
  }
  const repoInfo = await repoInfoRes.json();
  const defaultBranch = repoInfo.default_branch || 'main';

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeRes.ok) {
    const errBody = await treeRes.json().catch(() => ({}));
    throw new Error(`GitHub API Error: ${errBody.message || treeRes.statusText || 'Failed to fetch repo tree'}`);
  }
  const treeData = await treeRes.json();

  treeData.tree.forEach((node: any) => {
    if (node.type === 'blob') {
      result.totalFiles++;
      const filename = node.path.split('/').pop() || '';
      const extMatch = filename.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '';
      const lang = EXTENSION_MAP[ext];
      if (lang) {
        result.languages[lang]++;
      } else if (['.ts', '.js', '.tsx', '.jsx', '.go', '.py', '.cs', '.cpp', '.c', '.rb', '.php', '.rs'].includes(ext)) {
        result.languages.other++;
      }
    }
  });

  result.totalLoc = result.totalFiles * ESTIMATED_LOC_PER_FILE;
  result.vulnerabilities = Math.floor((result.languages.java + result.languages.cobol + result.languages.powerscript) * 0.15) || Math.floor(result.totalFiles * 0.01);
  
  const totalLegacy = result.languages.cobol + result.languages.powerscript + result.languages.natural;
  if (totalLegacy > 0) result.debtScore = 'Critical (Legacy Core)';
  else if (result.languages.java > (result.totalFiles * 0.2)) result.debtScore = 'High (Monolith)';
  else if (result.totalFiles > 500) result.debtScore = 'Moderate';
  else result.debtScore = 'Low';

  return result;
}

export async function analyzeZip(file: File): Promise<ScanResult> {
  const result = initializeResult(file.name);
  const zip = new JSZip();
  
  const contents = await zip.loadAsync(file);
  Object.keys(contents.files).forEach((filename) => {
    const zipObj = contents.files[filename];
    if (!zipObj.dir) {
      result.totalFiles++;
      const extMatch = filename.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '';
      const lang = EXTENSION_MAP[ext];
      if (lang) {
        result.languages[lang]++;
      } else if (['.ts', '.js', '.tsx', '.jsx', '.go', '.py', '.cs', '.cpp', '.c', '.rb', '.php', '.rs'].includes(ext)) {
        result.languages.other++;
      }
    }
  });

  result.totalLoc = result.totalFiles * ESTIMATED_LOC_PER_FILE;
  result.vulnerabilities = Math.floor((result.languages.java + result.languages.cobol + result.languages.powerscript) * 0.15) || Math.floor(result.totalFiles * 0.01);

  const totalLegacy = result.languages.cobol + result.languages.powerscript + result.languages.natural;
  if (totalLegacy > 0) result.debtScore = 'Critical (Legacy Core)';
  else if (result.languages.java > (result.totalFiles * 0.2)) result.debtScore = 'High (Monolith)';
  else if (result.totalFiles > 500) result.debtScore = 'Moderate';
  else result.debtScore = 'Low';

  return result;
}

export function formatCompactNumber(num: number): string {
  const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  return formatter.format(num);
}
