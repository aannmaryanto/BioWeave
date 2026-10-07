/**
 * Service to aggregate dashboard metrics and statistics
 */
const fetchUserStats = async (user) => {
  // Structured service logic ready for future Document model aggregation
  return {
    user: {
      name: user.name,
      email: user.email,
      role: user.role || 'researcher',
    },
    stats: {
      totalDocuments: 0,
      activeProtocols: 0,
      labNotes: 0,
      publishedPapers: 0,
    },
  };
};

/**
 * Service to retrieve latest documents uploaded by or shared with user
 */
const fetchRecentDocuments = async (user) => {
  // Structured service logic ready for future Document model queries
  return {
    documents: [],
  };
};

module.exports = {
  fetchUserStats,
  fetchRecentDocuments,
};
