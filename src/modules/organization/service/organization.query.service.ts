import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import z from 'zod';
import OrganizationModel from '../persistence/organization.model';
import { ListOrganizationsQuery } from '../types/taskmaster.schemas';
import { Types } from 'mongoose';
import { objectIdSchema } from '@helpers/zod';
import organizationTmUpdateSchema, { Organization } from '../types';

const getOrganizationById = async (req: AuthenticatedRequest) => {
  const { orgId } = z
    .object({ orgId: z.union([objectIdSchema, z.string().min(1)]) })
    .parse(req.params);
  if (orgId instanceof Types.ObjectId) {
    return await OrganizationModel.findById(orgId).populate('owner');
  } else {
    return await OrganizationModel.findOne({ slug: orgId }).populate('owner');
  }
};

const getOrganizations = async (query: ListOrganizationsQuery) => {
  const filter: NonNullable<Parameters<typeof OrganizationModel.paginate>[0]> =
    {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { slug: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.category) filter.category = query.category;
  if (typeof query.verified !== 'undefined') filter.verified = query.verified;
  if (typeof query.isBlocked !== 'undefined')
    filter.isBlocked = query.isBlocked;
  if (query.riskLevel) filter.riskLevel = query.riskLevel;
  const options = {
    page: query.page,
    limit: query.limit,
    sort: {
      [query.sortBy || 'createdAt']: query.sortOrder === 'desc' ? -1 : 1,
    },
    lean: true,
    populate: [
      { path: 'owner' },
      { path: 'verifiedBy', select: 'name email' },
      { path: 'blockedBy', select: 'name email' },
    ],
  };

  const organizations = await OrganizationModel.paginate(filter, options);
  return {
    organizations,
    pagination: {
      page: organizations.page,
      limit: organizations.limit,
      total: organizations.totalDocs,
      totalItems: organizations.totalDocs,
      totalPages: organizations.totalPages,
      hasPrevPage: organizations.hasPrevPage,
      hasNextPage: organizations.hasNextPage,
      prevPage: organizations.prevPage,
      nextPage: organizations.nextPage,
    },
  };
};

const getPendingVerificationOrganizations = async (options: {
  limit: number;
  page: number;
}) => {
  const limit = options.limit;
  const page = options.page;
  const skip = (page - 1) * limit;
  const organizations = await OrganizationModel.find({
    reqForVerification: true,
    verified: false,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return organizations;
};

const getSummary = async () => {
  const [
    totalOrganizations,
    activeOrganizations,
    inactiveOrganizations,
    verifiedOrganizations,
    pendingVerification,
    rejectedOrganizations,
    bannedOrganizations,
    organizationsWithVerificationRequests,
    organizationsWithDocuments,
    organizationsWithBankDetails,
    organizationsWithSocialLinks,
    organizationsWithLogo,
    organizationsWithWebsite,
    organizationsByCategory,
    topOrganizations,
    totalEventsHosted,
    totalTicketsSold,
    totalRevenueGenerated,
    averageRating,
    organizationsWithHighRating,
    monthlyRegistrations,
    recentlyVerifiedOrganizations,
    mostActiveCities,
    organizationsWithMaxEventsPerMonth,
  ] = await Promise.all([
    OrganizationModel.countDocuments(),
    OrganizationModel.countDocuments({ active: true }),
    OrganizationModel.countDocuments({ active: false }),
    OrganizationModel.countDocuments({ verified: true }),
    OrganizationModel.countDocuments({
      verified: false,
      reqForVerification: true,
    }),
    OrganizationModel.countDocuments({
      rejectionReason: { $exists: true, $ne: null },
    }),
    OrganizationModel.countDocuments({ banned: true }),
    OrganizationModel.countDocuments({ reqForVerification: true }),
    OrganizationModel.countDocuments({ 'documents.0': { $exists: true } }),
    OrganizationModel.countDocuments({
      'bankDetails.accountNumber': { $exists: true, $ne: '' },
    }),
    OrganizationModel.countDocuments({
      'socialLinks.facebook': { $exists: true, $ne: '' },
    }),
    OrganizationModel.countDocuments({ logo: { $exists: true, $ne: '' } }),
    OrganizationModel.countDocuments({ website: { $exists: true, $ne: '' } }),
    OrganizationModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    OrganizationModel.find({})
      .sort({ 'stats.totalEventsHosted': -1 })
      .limit(5)
      .select('name stats.totalEventsHosted stats.totalRevenueGenerated')
      .lean(),
    OrganizationModel.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalEventsHosted' } } },
    ]),
    OrganizationModel.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalTicketsSold' } } },
    ]),
    OrganizationModel.aggregate([
      {
        $group: { _id: null, total: { $sum: '$stats.totalRevenueGenerated' } },
      },
    ]),
    OrganizationModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating.averageRating' } } },
    ]),
    OrganizationModel.countDocuments({ 'rating.averageRating': { $gte: 4.5 } }),
    OrganizationModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    OrganizationModel.find({ verified: true })
      .sort({ verifiedAt: -1 })
      .limit(5)
      .select('name verifiedAt')
      .lean(),
    OrganizationModel.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    OrganizationModel.find({})
      .sort({ 'eventPreferences.maxEventsPerMonth': -1 })
      .limit(5)
      .select('name eventPreferences.maxEventsPerMonth')
      .lean(),
  ]);

  return {
    totalOrganizations,
    activeOrganizations,
    inactiveOrganizations,
    verifiedOrganizations,
    pendingVerification,
    rejectedOrganizations,
    bannedOrganizations,
    organizationsWithVerificationRequests,
    organizationsWithDocuments,
    organizationsWithBankDetails,
    organizationsWithSocialLinks,
    organizationsWithLogo,
    organizationsWithWebsite,
    organizationsByCategory,
    topOrganizations: topOrganizations.map((org) => ({
      name: org.name,
      events: org.stats?.totalEventsHosted || 0,
      // revenue: org.stats?.totalRevenueGenerated || 0,
    })),
    totalEventsHosted: totalEventsHosted[0]?.total || 0,
    totalTicketsSold: totalTicketsSold[0]?.total || 0,
    totalRevenueGenerated: totalRevenueGenerated[0]?.total || 0,
    averageRating: averageRating[0]?.avg || 0,
    organizationsWithHighRating,
    monthlyRegistrations: monthlyRegistrations.map((m) => ({
      month: m._id,
      count: m.count,
    })),
    recentlyVerifiedOrganizations,
    mostActiveCities: mostActiveCities.map((c) => ({
      city: c._id,
      count: c.count,
    })),
    organizationsWithMaxEventsPerMonth,
  };
};

const updateOrganization = async (
  org: Organization,
  body: Partial<Organization>,
) => {
  const data = organizationTmUpdateSchema.partial().strict().parse(body);
  const updatedOrg = await OrganizationModel.findByIdAndUpdate(org._id, data, {
    returnDocument: 'after',
  });
  return updatedOrg;
};

const OrganizationQuery = {
  getOrganizationById,
  getOrganizations,
  getPendingVerificationOrganizations,
  getSummary,
  updateOrganization,
};

export default OrganizationQuery;
