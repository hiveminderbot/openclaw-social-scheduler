/**
 * Unit tests for Discord platform module
 * Uses Node.js built-in test runner
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Mock node-fetch before requiring discord module
let fetchCalls = [];
let fetchResponse = { ok: true, status: 204 };

// Simple mock for node-fetch
const mockFetch = async (url, options) => {
  fetchCalls.push({ url, options });
  return {
    ok: fetchResponse.ok,
    status: fetchResponse.status,
    text: async () => fetchResponse.text || '',
    json: async () => fetchResponse.json || {}
  };
};

// Replace node-fetch with mock
require.cache[require.resolve('node-fetch')] = {
  id: require.resolve('node-fetch'),
  filename: require.resolve('node-fetch'),
  loaded: true,
  exports: mockFetch
};

const discord = require('../../../scripts/platforms/discord');

describe('Discord Platform', () => {
  beforeEach(() => {
    // Clear fetch calls before each test
    fetchCalls = [];
    fetchResponse = { ok: true, status: 204 };
  });

  describe('validate()', () => {
    it('should accept valid webhook URL', () => {
      const validUrl = 'https://discord.com/api/webhooks/123456789/abcdef-ghijklmnop';
      assert.strictEqual(discord.validate(validUrl), true);
    });

    it('should reject invalid webhook URL format', () => {
      assert.throws(() => {
        discord.validate('not-a-valid-url');
      }, /Invalid Discord webhook URL format/);
    });

    it('should reject empty webhook URL', () => {
      assert.throws(() => {
        discord.validate('');
      }, /Discord webhook URL must be a string/);
    });

    it('should reject null webhook URL', () => {
      assert.throws(() => {
        discord.validate(null);
      }, /Discord webhook URL must be a string/);
    });

    it('should reject non-string webhook URL', () => {
      assert.throws(() => {
        discord.validate(12345);
      }, /Discord webhook URL must be a string/);
    });

    it('should reject URL with wrong domain', () => {
      assert.throws(() => {
        discord.validate('https://example.com/api/webhooks/123/abc');
      }, /Invalid Discord webhook URL format/);
    });
  });

  describe('validateContent()', () => {
    it('should accept valid string content', () => {
      assert.strictEqual(discord.validateContent('Hello Discord!'), true);
    });

    it('should reject empty string content', () => {
      assert.throws(() => {
        discord.validateContent('');
      }, /Message content cannot be empty/);
    });

    it('should reject content exceeding 2000 characters', () => {
      const longContent = 'a'.repeat(2001);
      assert.throws(() => {
        discord.validateContent(longContent);
      }, /Message too long/);
    });

    it('should accept content at exactly 2000 characters', () => {
      const exactContent = 'a'.repeat(2000);
      assert.strictEqual(discord.validateContent(exactContent), true);
    });

    it('should accept structured content with text', () => {
      assert.strictEqual(discord.validateContent({ content: 'Hello!' }), true);
    });

    it('should accept structured content with embeds', () => {
      assert.strictEqual(discord.validateContent({
        embeds: [{ title: 'Test', description: 'Description' }]
      }), true);
    });

    it('should reject structured content without content or embeds', () => {
      assert.throws(() => {
        discord.validateContent({ username: 'Bot' });
      }, /Message must have either/);
    });

    it('should reject non-string, non-object content', () => {
      assert.throws(() => {
        discord.validateContent(12345);
      }, /Message content must be a string or object/);
    });

    it('should reject embeds that are not an array', () => {
      assert.throws(() => {
        discord.validateContent({ embeds: 'not-an-array' });
      }, /Embeds must be an array/);
    });
  });

  describe('createEmbed()', () => {
    it('should create basic embed with title and description', () => {
      const embed = discord.createEmbed({
        title: 'Test Title',
        description: 'Test Description'
      });

      assert.strictEqual(embed.title, 'Test Title');
      assert.strictEqual(embed.description, 'Test Description');
      assert.ok(embed.timestamp);
    });

    it('should create embed with color as hex string', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        color: '0xFF5733'
      });

      assert.strictEqual(embed.color, 0xFF5733);
    });

    it('should create embed with thumbnail', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        thumbnail: 'https://example.com/image.png'
      });

      assert.strictEqual(embed.thumbnail.url, 'https://example.com/image.png');
    });

    it('should create embed with image', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        image: 'https://example.com/image.png'
      });

      assert.strictEqual(embed.image.url, 'https://example.com/image.png');
    });

    it('should create embed with fields', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        fields: [
          { name: 'Field 1', value: 'Value 1', inline: true },
          { name: 'Field 2', value: 'Value 2' }
        ]
      });

      assert.strictEqual(embed.fields.length, 2);
      assert.strictEqual(embed.fields[0].name, 'Field 1');
    });

    it('should create embed with string footer', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        footer: 'Footer text'
      });

      assert.strictEqual(embed.footer.text, 'Footer text');
    });

    it('should create embed with object footer', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        footer: { text: 'Footer text', icon_url: 'https://example.com/icon.png' }
      });

      assert.strictEqual(embed.footer.text, 'Footer text');
      assert.strictEqual(embed.footer.icon_url, 'https://example.com/icon.png');
    });

    it('should create embed with string author', () => {
      const embed = discord.createEmbed({
        title: 'Test',
        author: 'Author Name'
      });

      assert.strictEqual(embed.author.name, 'Author Name');
    });
  });

  describe('post()', () => {
    it('should send simple text message', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123/abc';
      const content = 'Hello Discord!';

      const result = await discord.post(webhookUrl, content);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.platform, 'discord');
      assert.ok(result.timestamp);
      assert.strictEqual(fetchCalls.length, 1);
      assert.strictEqual(fetchCalls[0].options.method, 'POST');
      assert.strictEqual(fetchCalls[0].url, webhookUrl);
      
      const body = JSON.parse(fetchCalls[0].options.body);
      assert.strictEqual(body.content, content);
    });

    it('should send structured message with username', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123/abc';
      const content = {
        content: 'Hello!',
        username: 'Custom Bot',
        avatarUrl: 'https://example.com/avatar.png'
      };

      await discord.post(webhookUrl, content);

      const body = JSON.parse(fetchCalls[0].options.body);
      assert.strictEqual(body.content, 'Hello!');
      assert.strictEqual(body.username, 'Custom Bot');
      assert.strictEqual(body.avatar_url, 'https://example.com/avatar.png');
    });

    it('should send message to thread', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123/abc';
      const content = {
        content: 'Thread message',
        threadId: '9876543210'
      };

      await discord.post(webhookUrl, content);

      assert.ok(fetchCalls[0].url.includes('thread_id=9876543210'));
    });

    it('should throw on API error', async () => {
      fetchResponse = { ok: false, status: 400, text: 'Bad Request' };

      await assert.rejects(
        discord.post('https://discord.com/api/webhooks/123/abc', 'Test'),
        /Discord webhook failed \(400\)/
      );
    });
  });
});
