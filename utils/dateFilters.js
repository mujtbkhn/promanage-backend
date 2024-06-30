const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    endDate = new Date(now); // End date is today
    endDate.setHours(23, 59, 59, 999); // End of today

    switch (filter) {
        case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0); // Start of today
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7); // 7 days ago
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30); // 30 days ago
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0); // Default to start of today
            break;
    }

    return { startDate, endDate };
};

module.exports = { getDateRange };
