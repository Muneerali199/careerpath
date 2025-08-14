import { fetchAdzunaJobs } from '../../lib/api-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query, country } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const data = await fetchAdzunaJobs(query as string, country as string);
    res.status(200).json(data);
  } catch (error) {
    console.error('Adzuna API error:', error);
    res.status(500).json({ error: 'Failed to fetch Adzuna jobs data' });
  }
}