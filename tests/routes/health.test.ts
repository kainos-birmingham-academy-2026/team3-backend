import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index.ts';

describe('GET /health', () => {
    it('should return 200 OK', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP', timestamp: expect.any(String) });
    });
});