function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateReviewSchedule(results) {
  const schedule = {};
  const today = new Date();

  results.forEach((item) => {
    let daysToAdd = 0;

    if (item.status === 'correct') {
      daysToAdd = 3;
    } else if (item.status === 'partial') {
      daysToAdd = 2;
    } else if (item.status === 'missing' || item.status === 'incorrect') {
      daysToAdd = 1;
    } else {
      daysToAdd = 1; // fallback safety
    }

    const reviewDate = new Date(today);
    reviewDate.setDate(reviewDate.getDate() + daysToAdd);

    const dateKey = formatDate(reviewDate);

    if (!schedule[dateKey]) {
      schedule[dateKey] = 0;
    }

    schedule[dateKey] += 1;
  });

  return schedule;
}

module.exports = {
  generateReviewSchedule,
};