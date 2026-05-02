const LEARNER_ID_KEY = "tasty-python-learner-id";

function createLearnerId() {
  return `learner-${crypto.randomUUID()}`;
}

export function getOrCreateLearnerId() {
  const existingLearnerId = localStorage.getItem(LEARNER_ID_KEY);

  if (existingLearnerId) {
    return existingLearnerId;
  }

  const newLearnerId = createLearnerId();

  localStorage.setItem(LEARNER_ID_KEY, newLearnerId);

  return newLearnerId;
}