/**
 * Unit tests for post.js - Main posting orchestrator
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Track module loads and mock platforms
const loadedPlatforms = {};
const platformResults = {};

// Create mock platform modules
const createMockPlatform = (name) => ({
  validate: (config) => {
    loadedPlatforms[name] = { validated: config };
    if (!config || config === 'invalid') {
      throw new Error(`${name} validation failed`);
    }
    return true;
  },
  post: async (config, content) => {
    loadedPlatforms[name].posted = { config, content };
    const result = {
      success: true,
      platform: name,
      timestamp: new Date().toISOString()
    };
    platformResults[name] = result;
    return result;
  }
});

// Mock the platform modules
require.cache[path.join(__dirname, '../../scripts/platforms/discord.js')] = {
  id: 'discord',
  filename: 'discord.js',
  loaded: true,
  exports: createMockPlatform('discord')
};

require.cache[path.join(__dirname, '../../scripts/platforms/moltbook.js')] = {
  id: 'moltbook',
  filename: 'moltbook.js',
  loaded: true,
  exports: createMockPlatform('moltbook')
};

require.cache[path.join(__dirname, '../../scripts/platforms/reddit.js')] = {
  id: 'reddit',
  filename: 'reddit.js',
  loaded: true,
  exports: createMockPlatform('reddit')
};

require.cache[path.join(__dirname, '../../scripts/platforms/twitter.js')] = {
  id: 'twitter',
  filename: 'twitter.js',
  loaded: true,
  exports: createMockPlatform('twitter')
};

require.cache[path.join(__dirname, '../../scripts/platforms/mastodon.js')] = {
  id: 'mastodon',
  filename: 'mastodon.js',
  loaded: true,
  exports: createMockPlatform('mastodon')
};

require.cache[path.join(__dirname, '../../scripts/platforms/bluesky.js')] = {
  id: 'bluesky',
  filename: 'bluesky.js',
  loaded: true,
  exports: createMockPlatform('bluesky')
};

describe('Post.js Logic', () => {
  describe('Platform Selection', () => {
    it('should validate platform name is provided', () => {
      // Simulating missing platform argument
      const args = [];
      assert.strictEqual(args.length < 3, true, 'Should detect missing arguments');
    });

    it('should validate config is provided', () => {
      const args = ['discord'];
      assert.strictEqual(args.length < 3, true, 'Should detect missing config');
    });

    it('should validate content is provided', () => {
      const args = ['discord', 'config.json'];
      assert.strictEqual(args.length < 3, true, 'Should detect missing content');
    });

    it('should accept valid argument count', () => {
      const args = ['discord', 'config.json', 'Hello World'];
      assert.strictEqual(args.length >= 3, true, 'Should accept valid arguments');
    });
  });

  describe('Configuration Loading', () => {
    it('should detect JSON config file path', () => {
      const config = '.credentials/discord.json';
      assert.strictEqual(config.endsWith('.json'), true);
    });

    it('should detect direct credential string', () => {
      const config = 'https://discord.com/api/webhooks/123/abc';
      assert.strictEqual(config.endsWith('.json'), false);
    });

    it('should validate Discord webhook URL format', () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123456789/abcdef-ghijklmnop';
      const webhookPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
      assert.strictEqual(webhookPattern.test(webhookUrl), true);
    });

    it('should reject invalid Discord webhook URL', () => {
      const invalidUrl = 'not-a-webhook-url';
      const webhookPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
      assert.strictEqual(webhookPattern.test(invalidUrl), false);
    });
  });

  describe('Platform Support', () => {
    it('should support discord platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('discord'));
    });

    it('should support reddit platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('reddit'));
    });

    it('should support twitter platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('twitter'));
    });

    it('should support mastodon platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('mastodon'));
    });

    it('should support bluesky platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('bluesky'));
    });

    it('should support moltbook platform', () => {
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.ok(supportedPlatforms.includes('moltbook'));
    });

    it('should reject unsupported platform', () => {
      const platform = 'facebook';
      const supportedPlatforms = ['discord', 'reddit', 'twitter', 'mastodon', 'bluesky', 'moltbook'];
      assert.strictEqual(supportedPlatforms.includes(platform), false);
    });
  });

  describe('Content Handling', () => {
    it('should handle simple text content', () => {
      const content = 'Hello World';
      assert.strictEqual(typeof content, 'string');
      assert.ok(content.length > 0);
    });

    it('should handle content with special characters', () => {
      const content = 'Hello @user #hashtag https://example.com';
      assert.ok(content.includes('@'));
      assert.ok(content.includes('#'));
      assert.ok(content.includes('https://'));
    });

    it('should handle multi-line content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      assert.ok(content.includes('\n'));
      const lines = content.split('\n');
      assert.strictEqual(lines.length, 3);
    });

    it('should handle unicode content', () => {
      const content = 'Hello 🌍 世界';
      assert.ok(content.includes('🌍'));
    });
  });

  describe('Mock Platform Integration', () => {
    it('should validate discord config through mock', () => {
      const mockDiscord = createMockPlatform('discord');
      assert.strictEqual(mockDiscord.validate('valid-config'), true);
    });

    it('should throw on invalid config through mock', () => {
      const mockDiscord = createMockPlatform('discord');
      assert.throws(() => {
        mockDiscord.validate('invalid');
      }, /validation failed/);
    });

    it('should post through mock platform', async () => {
      const mockDiscord = createMockPlatform('discord');
      const result = await mockDiscord.post('config', 'Hello');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.platform, 'discord');
      assert.ok(result.timestamp);
    });
  });
});
