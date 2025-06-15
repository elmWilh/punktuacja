const dailyNorm = 17;

function getTargetPeriod(date) {
  const now = new Date(date);
  const day = now.getDate();
  if (day < 29) {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 29),
      end: new Date(now.getFullYear(), now.getMonth(), 28)
    };
  } else {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 29),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 28)
    };
  }
}

function calculateSalary(points, days, yieldPercent) {
  const base = 3705.1;
  const bonusPerDay = 800;
  let bonus = 0;
  if (days && points / days >= dailyNorm) {
    bonus += bonusPerDay;
    const extra = points - dailyNorm * days;
    if (extra > 0) {
      let r;
      if (yieldPercent < 60) r = 3;
      else if (yieldPercent < 65) r = 4.5;
      else if (yieldPercent < 70) r = 6.5;
      else if (yieldPercent < 72.5) r = 8;
      else if (yieldPercent < 75) r = 9.5;
      else if (yieldPercent < 77.5) r = 11;
      else if (yieldPercent < 80) r = 12.5;
      else if (yieldPercent >= 82.5) r = 15.5;
      else r = 14;
      bonus += extra * r;
    }
  }
  return (base + bonus).toFixed(2);
}

module.exports = {
  getTargetPeriod,
  calculateSalary,
  dailyNorm
};
