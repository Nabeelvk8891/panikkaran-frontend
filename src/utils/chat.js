export const getChatId = (userId, workerId) => {
  return userId.localeCompare(workerId) < 0
    ? `${userId}_${workerId}`
    : `${workerId}_${userId}`;
};
