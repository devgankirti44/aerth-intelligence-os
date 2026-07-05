// backend/src/services/analyticsService.js

import Event from '../models/Event.js';

/**
 * Aggregate events by type + significance for a company
 * Justifies MongoDB aggregation pipeline for viva
 */
export async function getCompanyAnalytics(companySlug) {
  const [
    typeDistribution,
    significanceDistribution,
    timeline,
    totalCount
  ] = await Promise.all([

    // 1. Group by event type
    Event.aggregate([
      { $match: { companySlug } },
      { $group: {
          _id: '$type',
          count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]),

    // 2. Group by significance
    Event.aggregate([
      { $match: { companySlug } },
      { $group: {
          _id: '$significance',
          count: { $sum: 1 }
      }}
    ]),

    // 3. Timeline — events per day (last 30 days)
    Event.aggregate([
      {
        $match: {
          companySlug,
          publishedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // 4. Total
    Event.countDocuments({ companySlug })
  ]);

  return {
    total: totalCount,
    byType: typeDistribution,
    bySignificance: significanceDistribution,
    timeline
  };
}