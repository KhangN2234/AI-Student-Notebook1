function generateReviewSchedule(results) {
  const schedule = {};

  results.forEach((item) => {
    let daysToAdd = 0;

    if (item.status === 'correct') daysToAdd = 3;
    else if (item.status === 'partial') daysToAdd = 2;
    else daysToAdd = 1;

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + daysToAdd);

    const dateKey = reviewDate.toISOString().split('T')[0];

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