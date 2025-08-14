import { NextApiRequest, NextApiResponse } from 'next';
import { fetchBLSData, fetchONetData, fetchAdzunaJobs } from '../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { skills, interests } = req.query;
    
    if (!skills || !interests) {
      return res.status(400).json({ error: 'Skills and interests are required' });
    }

    // Mock recommendations with real API endpoint references
    const mockRecommendations = [
      {
        id: '15-1252.00',
        title: 'Software Developer',
        match: 94,
        salary: '$85,000 - $150,000',
        growth: '+22% (Much faster than average)',
        description: 'Develop, create, and modify general computer applications software or specialized utility programs.',
        skills: ['JavaScript', 'Python', 'SQL', 'Algorithms', 'Debugging'],
        demand: 'High',
        education: "Bachelor's degree in Computer Science",
        experience: '2-5 years',
        median_salary: 110000,
        job_outlook: 'Excellent',
        onet_code: '15-1252.00',
        bls_series: 'OEUM003018000000000000005',
        api_endpoints: {
          bls: '/api/bls?seriesId=OEUM003018000000000000005',
          onet: '/api/onet?onetCode=15-1252.00',
          jobs: '/api/adzuna?query=Software+Developer'
        }
      },
      {
        id: '15-2051.00',
        title: 'Data Scientist',
        match: 88,
        salary: '$95,000 - $165,000',
        growth: '+31% (Much faster than average)',
        description: 'Analyze and interpret complex digital data to assist decision-making.',
        skills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization', 'SQL'],
        demand: 'High',
        education: "Master's degree in Data Science or related field",
        experience: '3-6 years',
        median_salary: 125000,
        job_outlook: 'Excellent',
        onet_code: '15-2051.00',
        bls_series: 'OEUM004018000000000000005',
        api_endpoints: {
          bls: '/api/bls?seriesId=OEUM004018000000000000005',
          onet: '/api/onet?onetCode=15-2051.00',
          jobs: '/api/adzuna?query=Data+Scientist'
        }
      },
      {
        id: '27-1014.00',
        title: 'UX Designer',
        match: 85,
        salary: '$70,000 - $120,000',
        growth: '+13% (Faster than average)',
        description: 'Create user-friendly digital experiences and interfaces.',
        skills: ['Figma', 'User Research', 'Prototyping', 'Adobe Creative Suite'],
        demand: 'Medium',
        education: "Bachelor's degree in Design or related field",
        experience: '2-4 years',
        median_salary: 95000,
        job_outlook: 'Good',
        onet_code: '27-1014.00',
        bls_series: 'OEUM005018000000000000005',
        api_endpoints: {
          bls: '/api/bls?seriesId=OEUM005018000000000000005',
          onet: '/api/onet?onetCode=27-1014.00',
          jobs: '/api/adzuna?query=UX+Designer'
        }
      }
    ];

    res.status(200).json(mockRecommendations);
  } catch (error) {
    console.error('Career recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate career recommendations' });
  }
}