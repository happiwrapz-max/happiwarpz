# Master Skills & Ecosystem Installer Guide

This guide provides automated scripts and command recipes to replicate the complete agent skills, design systems, test suites, and graph tools installed in this workspace into any other project or folder.

---

## 1. Quick Automated Installers

### Option A: Universal Python Installer (`install_skills.py`)
*No Git or admin privileges required. Works across Windows, macOS, and Linux.*

Save the script below as `install_skills.py` in the root of your target project and run `python install_skills.py`:

```python
import os
import sys
import shutil
import urllib.request
import zipfile
import subprocess

TARGET_DIR = os.path.abspath(os.path.join(".", ".agents", "skills"))
os.makedirs(TARGET_DIR, exist_ok=True)

REPOS = [
    ("testdino-playwright", "https://github.com/testdino-hq/playwright-skill/archive/refs/heads/main.zip"),
    ("cloudflare-security", "https://github.com/cloudflare/security-audit-skill/archive/refs/heads/main.zip"),
    ("addyosmani-agent-skills", "https://github.com/addyosmani/agent-skills/archive/refs/heads/main.zip"),
    ("mattpocock-skills", "https://github.com/mattpocock/skills/archive/refs/heads/main.zip"),
    ("superpowers", "https://github.com/obra/superpowers/archive/refs/heads/main.zip"),
    ("understand-anything", "https://github.com/Egonex-AI/Understand-Anything/archive/refs/heads/main.zip"),
    ("ponytail", "https://github.com/DietrichGebert/ponytail/archive/refs/heads/main.zip"),
    ("ui-ux-pro-max", "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/archive/refs/heads/main.zip"),
    ("ux-ui-agent-skills", "https://github.com/plugin87/ux-ui-agent-skills/archive/refs/heads/main.zip"),
    ("taste-skill", "https://github.com/leonxlnx/taste-skill/archive/refs/heads/main.zip"),
    ("ecc", "https://github.com/affaan-m/ecc/archive/refs/heads/main.zip"),
]

cache_dir = os.path.join(os.environ.get("TEMP", "."), "agent_skills_cache")
os.makedirs(cache_dir, exist_ok=True)

def download_and_extract(name, url):
    zip_path = os.path.join(cache_dir, f"{name}.zip")
    extract_to = os.path.join(cache_dir, name)
    print(f"[*] Downloading {name}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp, open(zip_path, "wb") as f:
            shutil.copyfileobj(resp, f)
    except Exception:
        if "/main.zip" in url:
            alt_url = url.replace("/main.zip", "/master.zip")
            req = urllib.request.Request(alt_url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(zip_path, "wb") as f:
                shutil.copyfileobj(resp, f)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_to)
    return extract_to

def scan_and_register_skills(source_dir, prefix=""):
    count = 0
    for root, _, files in os.walk(source_dir):
        if "SKILL.md" in files:
            skill_folder = os.path.basename(root)
            if skill_folder.lower() in ("main", "master", "src", "skills"):
                dest_name = prefix or "skill"
            else:
                dest_name = f"{prefix}-{skill_folder}" if prefix else skill_folder

            dest_dir = os.path.join(TARGET_DIR, dest_name)
            shutil.copytree(root, dest_dir, dirs_exist_ok=True)
            print(f"  + Registered: {dest_name}")
            count += 1
    return count

total = 0
for name, url in REPOS:
    try:
        extracted = download_and_extract(name, url)
        prefix = {
            "testdino-playwright": "playwright",
            "cloudflare-security": "cloudflare",
            "addyosmani-agent-skills": "addy",
            "mattpocock-skills": "mp",
            "superpowers": "superpowers",
            "understand-anything": "understand",
            "ponytail": "ponytail",
        }.get(name, "")
        total += scan_and_register_skills(extracted, prefix=prefix)
    except Exception as e:
        print(f"  - Error {name}: {e}")

print(f"\n[DONE] Installed {total} skills into {TARGET_DIR}")

# Install Graphify CLI
try:
    subprocess.run([sys.executable, "-m", "pip", "install", "graphifyy"], check=True)
    subprocess.run(["graphify", "antigravity", "install"])
except Exception as e:
    print(f"Graphify setup error: {e}")
```

---

### Option B: Windows PowerShell Installer (`install_skills.ps1`)

Save as `install_skills.ps1` and execute with `powershell -ExecutionPolicy Bypass -File install_skills.ps1`:

```powershell
$targetDir = Join-Path (Get-Location) ".agents\skills"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
$cache = Join-Path $env:TEMP "skills_cache"
New-Item -ItemType Directory -Force -Path $cache | Out-Null

$repos = @(
    @{ Name = "playwright"; Url = "https://github.com/testdino-hq/playwright-skill/archive/refs/heads/main.zip"; Prefix = "playwright" },
    @{ Name = "cloudflare"; Url = "https://github.com/cloudflare/security-audit-skill/archive/refs/heads/main.zip"; Prefix = "cloudflare" },
    @{ Name = "addyosmani"; Url = "https://github.com/addyosmani/agent-skills/archive/refs/heads/main.zip"; Prefix = "addy" },
    @{ Name = "mattpocock"; Url = "https://github.com/mattpocock/skills/archive/refs/heads/main.zip"; Prefix = "mp" },
    @{ Name = "superpowers"; Url = "https://github.com/obra/superpowers/archive/refs/heads/main.zip"; Prefix = "superpowers" },
    @{ Name = "understand"; Url = "https://github.com/Egonex-AI/Understand-Anything/archive/refs/heads/main.zip"; Prefix = "understand" },
    @{ Name = "ponytail"; Url = "https://github.com/DietrichGebert/ponytail/archive/refs/heads/main.zip"; Prefix = "ponytail" },
    @{ Name = "ui-ux-pro-max"; Url = "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/archive/refs/heads/main.zip"; Prefix = "" },
    @{ Name = "ux-ui-skills"; Url = "https://github.com/plugin87/ux-ui-agent-skills/archive/refs/heads/main.zip"; Prefix = "" },
    @{ Name = "taste-skill"; Url = "https://github.com/leonxlnx/taste-skill/archive/refs/heads/main.zip"; Prefix = "" },
    @{ Name = "ecc"; Url = "https://github.com/affaan-m/ecc/archive/refs/heads/main.zip"; Prefix = "" }
)

foreach ($repo in $repos) {
    Write-Host "[*] Downloading $($repo.Name)..." -ForegroundColor Cyan
    $zip = Join-Path $cache "$($repo.Name).zip"
    $out = Join-Path $cache $repo.Name
    
    try {
        curl.exe -s -L -o $zip $repo.Url
        Expand-Archive -Path $zip -DestinationPath $out -Force
    } catch {
        Write-Warning "Failed to download $($repo.Name)"
        continue
    }

    Get-ChildItem -Path $out -Recurse -Filter "SKILL.md" | ForEach-Object {
        $parent = $_.Directory
        $destName = if ($repo.Prefix) { "$($repo.Prefix)-$($parent.Name)" } else { $parent.Name }
        $dest = Join-Path $targetDir $destName
        Copy-Item -Path $parent.FullName -Destination $dest -Recurse -Force
        Write-Host "  + Installed $destName" -ForegroundColor Green
    }
}

# Install Graphify
python -m pip install graphifyy
graphify antigravity install

Write-Host "`nAll skills successfully deployed to: $targetDir" -ForegroundColor Yellow
```

---

## 2. CLI One-Liner Commands (`npx skills`)

If Git and Node.js are available on the machine:

```bash
# UI / UX Design System
npx skills add nextlevelbuilder/ui-ux-pro-max-skill -y --agent antigravity
npx skills add plugin87/ux-ui-agent-skills -y --agent antigravity
npx skills add leonxlnx/taste-skill -y --agent antigravity

# Playwright Browser Testing Suite
npx skills add testdino-hq/playwright-skill/core -y --agent antigravity
npx skills add testdino-hq/playwright-skill/frontend -y --agent antigravity
npx skills add testdino-hq/playwright-skill/qa -y --agent antigravity
npx skills add testdino-hq/playwright-skill/ci -y --agent antigravity
npx skills add testdino-hq/playwright-skill/pom -y --agent antigravity
npx skills add testdino-hq/playwright-skill/migration -y --agent antigravity
npx skills add testdino-hq/playwright-skill/playwright-cli -y --agent antigravity

# Security, Engineering & Superpowers
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit -y --agent antigravity
npx skills add addyosmani/agent-skills -y --agent antigravity
npx skills add affaan-m/ecc -y --agent antigravity
npx skills add obra/superpowers -y --agent antigravity
npx skills add Egonex-AI/Understand-Anything -y --agent antigravity
npx skills add DietrichGebert/ponytail -y --agent antigravity

# Graphify & Animation Libraries
pip install graphifyy
graphify antigravity install
npm install animejs
npm install -D @types/animejs
```

---

## 3. Installed Skill Roster Reference

| Category | Skills Included |
|---|---|
| **Design & UI/UX** | `ui-ux-pro-max`, `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`, `stitch-design-taste`, `industrial-brutalist-ui`, `design-md`, `skiper-ui`, `watermelon-ui` |
| **Testing & Playwright** | `playwright-core`, `playwright-frontend`, `playwright-qa`, `playwright-ci`, `playwright-pom`, `playwright-migration`, `playwright-cli` |
| **Security Auditing** | `cloudflare-security-audit`, `addy-security-and-hardening` |
| **Architecture & Quality** | `addyosmani-agent-skills` (25 skills), `mattpocock-skills` (engineering & productivity), `affaan-m/ecc` (full engineering collection) |
| **Planning & Superpowers**| `superpowers-brainstorming`, `superpowers-executing-plans`, `superpowers-systematic-debugging`, `superpowers-subagent-driven-development` |
| **Knowledge Graph** | `understand-anything` suite, `graphifyy` AST engine |
