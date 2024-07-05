const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    endDate = new Date(now); 
    endDate.setHours(23, 59, 59, 999); 

    switch (filter) {
        case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0); 
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7); 
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30); 
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7); 
            startDate.setHours(0, 0, 0, 0);
            break;
    }

    return { startDate, endDate };
};

module.exports = { getDateRange };
