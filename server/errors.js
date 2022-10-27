export const TYPE_NOT_PROVIDED_ERROR = {
  code: 0,
  message: 'A type field must be provided in the message'
};

export const INVALID_ENTITY_FIELD_ERROR = {
  code: 1,
  message: 'The entity field must be either user or bag'
};

export const PAIR_ENTITY_NOT_USER_ERROR = {
  code: 2,
  message: 'Only a user can initiate a pair'
};

export const createBagNotAvailableError = id => ({
  code: 3,
  message: `The bag with code ${id} is not available`
});

export const TRY_PAIR_AGAIN_ERROR = {
  code: 4,
  message: 'The bag is available but took too long to respond. Try the request again'
};

export const createErrorPayload = (code, message) => JSON.stringify({
  type: 'error',
  code,
  message
});
