import { rest } from 'msw';

export const handlers = [
  rest.post('/api/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mocked-token',
      })
    );
  }),

  rest.get('/api/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Welcome to your mocked dashboard!',
      })
    );
  }),

  rest.get('/api/data', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Mocked Item 1' },
        { id: 2, name: 'Mocked Item 2' },
      ])
    );
  }),

  rest.get('/api/error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Mocked server error' }));
  }),
];
