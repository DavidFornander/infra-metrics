import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Mock user data
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const mockUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user' },
];

/**
 * GET /api/users
 * Returns list of users
 * This endpoint is useful for testing distributed tracing and metrics
 */
router.get('/users', (_req: Request, res: Response) => {
  res.json({
    users: mockUsers,
    count: mockUsers.length,
  });
});

/**
 * GET /api/users/:id
 * Returns a specific user by ID
 */
router.get('/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  res.json(user);
});

/**
 * GET /api/slow
 * Simulates a slow endpoint with random delay
 * Useful for testing latency tracking and distributed tracing
 */
router.get('/slow', async (_req: Request, res: Response) => {
  // Random delay between 500ms and 2000ms
  const delay = Math.floor(Math.random() * 1500) + 500;
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  res.json({
    message: 'This was a slow request',
    delay_ms: delay,
    timestamp: new Date().toISOString(),
  });
});

export default router;
