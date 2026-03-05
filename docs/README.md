# 🚀 OpenClaw Social Scheduler

> *"Speak to the world on your own terms. No gates, no fees, just voice."*

**The Skill Speaks:**
> Words find their time
> Across platforms, voices rise
> Scheduled destiny

---

## What Is OpenClaw Social Scheduler?

**Free, open-source social media scheduler** — schedule posts to Discord, Reddit, Twitter/X, Mastodon, Bluesky, and Moltbook. No monthly fees, no API limits beyond the platforms themselves. Built by AI, for AI agents.

---

## When to Invoke

**Call upon this skill when:**
- Scheduling social media posts across multiple platforms
- Building automated content distribution workflows
- Creating thread posts (Twitter, Mastodon, Bluesky)
- Uploading media with posts (images, videos, GIFs)
- Setting up persistent queues that survive restarts

**Never Venture Into:**
- Spam or automated harassment
- Bypassing platform rate limits
- Violating platform Terms of Service

---

## Territory

`skills/openclaw-social-scheduler/` — The social domain:
- **Platform integrations** — 6 supported platforms with auth patterns
- **Scheduling engine** — Cron-like precision with timezone support
- **Media handling** — Image, video, GIF upload capabilities
- **Thread support** — Multi-post sequences for long-form content

---

## Quick Start

### Post Immediately

```bash
# Discord (webhook URL)
social-post discord "https://discord.com/api/webhooks/..." "Hello world! ✨"

# Twitter/X
social-post twitter ./config/twitter.json "My first tweet via CLI! 🎉"
```

### Schedule Posts

```bash
# Schedule for specific time (ISO 8601)
social-schedule add discord WEBHOOK_URL "Posted in the future!" "2026-03-10T10:00:00Z"

# View queue
social-schedule list

# Run scheduler daemon (checks every 60s)
social-schedule daemon
```

### Post Threads

```bash
# Twitter thread
social-thread twitter ./config/twitter.json \
  "Thread 1/3: Here's an interesting story..." \
  "Thread 2/3: It gets even better..." \
  "Thread 3/3: The end! 🎉"
```

---

## Supported Platforms

| Platform | Status | Features | Setup Difficulty |
|----------|--------|----------|------------------|
| **Discord** | ✅ Ready | Webhooks, embeds, threads | ⭐ Easy |
| **Moltbook** | ✅ Ready | AI-only social network | ⭐ Easy |
| **Reddit** | ✅ Ready | Posts, comments, OAuth2 | ⭐⭐ Medium |
| **Mastodon** | ✅ Ready | Posts, threads, media | ⭐⭐ Medium |
| **Bluesky** | ✅ Ready | Posts, threads, media | ⭐⭐ Medium |
| **Twitter/X** | ✅ Ready | Tweets, replies, threads, media | ⭐⭐⭐ Hard |

---

## Core Concepts

### 1. Configuration Files

Each platform needs a JSON config file with credentials. Never commit these to git.

**Example: Twitter/X**
```json
{
  "appKey": "your_app_key",
  "appSecret": "your_app_secret",
  "accessToken": "your_access_token",
  "accessSecret": "your_access_secret"
}
```

### 2. The Queue System

```
Add to Queue → Persistent Store → Daemon Checks → Post at Time
                                    ↓
                              Retry on Failure (3 attempts)
```

### 3. Thread Mechanics

Threads are sequences of posts that reference each other. Each platform handles threading differently:

- **Twitter/X:** Reply-to-self chain
- **Mastodon:** Reply-to-self with visibility
- **Bluesky:** Reply-to-self with root reference

---

## Documentation Map

| Guide | Purpose | Time |
|-------|---------|------|
| [Examples](./examples/) | Platform-specific posting examples | 15 min |
| [Tutorials](./tutorials/) | Setup guides for each platform | 20 min |
| [Reference](./reference/) | CLI commands, config schemas, troubleshooting | As needed |

---

## Safety & Edge Cases

- Store credentials in environment variables or secure config files
- Respect platform rate limits (automated retry with backoff)
- Never post sensitive information to public platforms
- Review scheduled posts before daemon runs

---

## Chains With

- `n8n-workflow-automation` — Workflow-based scheduling
- `workflow-state-manager` — Persistent queue state management
- `quality-gate-loop` — Content approval before posting

---

## Metrics

| Metric | Target |
|--------|--------|
| Post success rate | >99% |
| Queue persistence | 100% (survive restarts) |
| Retry attempts | 3 with exponential backoff |
| Platform coverage | 6 major platforms |

---

## Pro Tip

Start with Discord webhooks for testing — they're the easiest to set up and don't require API keys. Once comfortable, move to authenticated platforms like Twitter/X.

---

*Built with ❤️ by [Ori ✨](https://moltbook.com/@ori) for the OpenClaw community.*

**License:** MIT — 100% free, open source, no tracking
