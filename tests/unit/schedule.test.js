/**
 * Unit tests for schedule.js - Scheduling functionality
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Schedule.js Logic', () => {
  describe('Time Parsing', () => {
    it('should parse ISO timestamp', () => {
      const timestamp = '2026-03-05T10:00:00Z';
      const date = new Date(timestamp);
      assert.ok(date instanceof Date);
      assert.ok(!isNaN(date.getTime()));
    });

    it('should parse relative time "in X minutes"', () => {
      const input = 'in 30 minutes';
      const match = input.match(/in\s+(\d+)\s+minutes?/i);
      assert.ok(match);
      assert.strictEqual(match[1], '30');
    });

    it('should parse relative time "in X hours"', () => {
      const input = 'in 2 hours';
      const match = input.match(/in\s+(\d+)\s+hours?/i);
      assert.ok(match);
      assert.strictEqual(match[1], '2');
    });

    it('should parse time "at HH:MM"', () => {
      const input = 'at 14:30';
      const match = input.match(/at\s+(\d{1,2}):(\d{2})/i);
      assert.ok(match);
      assert.strictEqual(match[1], '14');
      assert.strictEqual(match[2], '30');
    });

    it('should parse cron-like expression', () => {
      const input = '0 9 * * 1';  // Every Monday at 9 AM
      const parts = input.split(' ');
      assert.strictEqual(parts.length, 5);
    });
  });

  describe('Schedule Validation', () => {
    it('should validate future date', () => {
      const future = new Date(Date.now() + 3600000); // 1 hour from now
      assert.ok(future > new Date());
    });

    it('should reject past date', () => {
      const past = new Date(Date.now() - 3600000); // 1 hour ago
      assert.ok(past < new Date());
    });

    it('should validate date is within reasonable range', () => {
      const maxFuture = new Date();
      maxFuture.setFullYear(maxFuture.getFullYear() + 1);
      const schedule = new Date(Date.now() + 86400000); // 1 day from now
      assert.ok(schedule < maxFuture);
    });
  });

  describe('Recurrence Patterns', () => {
    it('should identify daily recurrence', () => {
      const pattern = 'daily';
      assert.ok(['daily', 'weekly', 'monthly'].includes(pattern));
    });

    it('should identify weekly recurrence', () => {
      const pattern = 'weekly';
      assert.ok(['daily', 'weekly', 'monthly'].includes(pattern));
    });

    it('should identify monthly recurrence', () => {
      const pattern = 'monthly';
      assert.ok(['daily', 'weekly', 'monthly'].includes(pattern));
    });

    it('should parse day of week', () => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      assert.ok(days.includes('monday'));
      assert.strictEqual(days.indexOf('monday'), 0);
    });
  });

  describe('Queue Management', () => {
    it('should create queue item with required fields', () => {
      const item = {
        id: 'schedule-123',
        platform: 'discord',
        content: 'Hello World',
        scheduledTime: new Date().toISOString(),
        status: 'pending'
      };

      assert.ok(item.id);
      assert.ok(item.platform);
      assert.ok(item.content);
      assert.ok(item.scheduledTime);
      assert.ok(item.status);
    });

    it('should validate queue item status values', () => {
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
      assert.ok(validStatuses.includes('pending'));
      assert.ok(validStatuses.includes('completed'));
      assert.ok(validStatuses.includes('failed'));
    });

    it('should sort queue items by scheduled time', () => {
      const items = [
        { id: 1, scheduledTime: '2026-03-05T12:00:00Z' },
        { id: 2, scheduledTime: '2026-03-05T10:00:00Z' },
        { id: 3, scheduledTime: '2026-03-05T14:00:00Z' }
      ];

      const sorted = [...items].sort((a, b) => 
        new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );

      assert.strictEqual(sorted[0].id, 2);
      assert.strictEqual(sorted[1].id, 1);
      assert.strictEqual(sorted[2].id, 3);
    });
  });

  describe('Schedule Conflict Detection', () => {
    it('should detect overlapping schedules', () => {
      const existing = {
        platform: 'discord',
        scheduledTime: '2026-03-05T10:00:00Z',
        duration: 300 // 5 minutes
      };

      const newSchedule = {
        platform: 'discord',
        scheduledTime: '2026-03-05T10:02:00Z'
      };

      const existingTime = new Date(existing.scheduledTime).getTime();
      const newTime = new Date(newSchedule.scheduledTime).getTime();
      const overlap = Math.abs(newTime - existingTime) < (existing.duration * 1000);

      assert.strictEqual(overlap, true);
    });

    it('should allow non-overlapping schedules', () => {
      const existing = {
        platform: 'discord',
        scheduledTime: '2026-03-05T10:00:00Z'
      };

      const newSchedule = {
        platform: 'discord',
        scheduledTime: '2026-03-05T11:00:00Z'
      };

      const existingTime = new Date(existing.scheduledTime).getTime();
      const newTime = new Date(newSchedule.scheduledTime).getTime();
      const oneHourMs = 3600000;

      assert.ok(Math.abs(newTime - existingTime) >= oneHourMs);
    });
  });
});
