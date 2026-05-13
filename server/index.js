import 'dotenv/config';
import { createServer } from 'http';
import { db } from './db.js';

const PORT = 3001;

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  async function readBody() {
    let body = '';
    for await (const chunk of req) body += chunk;
    return JSON.parse(body);
  }

  try {
    if (url.pathname === '/api/user' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.saveUser(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/offer' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.saveOffer(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/resume' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.saveResume(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/salary' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.saveSalary(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/salary/benchmarks' && req.method === 'GET') {
      const role = url.searchParams.get('role');
      const city = url.searchParams.get('city');
      const result = await db.getSalaryBenchmarks(role, city);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    if (url.pathname === '/api/activation' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const result = await db.getActivationSteps(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    if (url.pathname === '/api/activation/complete' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.completeActivationStep(data.userId, data.step);
      await db.logActivity(data.userId, `completed_${data.step}`, { step: data.step });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/contribution' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.saveContribution(data);
      await db.logActivity(data.userId, 'contributed_data', { type: data.type, company: data.company });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/contributions' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const result = await db.getUserContributions(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    if (url.pathname === '/api/activity' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const result = await db.getUserActivities(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    if (url.pathname === '/api/activity/log' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.logActivity(data.userId, data.action, data.metadata);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/streak' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const result = await db.getOrCreateStreak(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    if (url.pathname === '/api/streak/visit' && req.method === 'POST') {
      const data = await readBody();
      const result = await db.recordVisit(data.userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
      return;
    }

    if (url.pathname === '/api/user/stats' && req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const result = await db.getUserStats(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: result }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
}).listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
