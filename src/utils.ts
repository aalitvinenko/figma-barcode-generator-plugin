export const generateChecksum = (value: string) => {
  const chars = value.split("");

  let counter = 0;

  for (let i = 0; i < chars.length; i++) {
    if (i % 2 === 0) {
      counter += parseInt(chars[i], 10);
    } else {
      counter += 3 * parseInt(chars[i], 10);
    }
  }

  return (10 - (counter % 10)) % 10;
};

export const validateChecksum = (value: string) =>
  parseInt(value.slice(-1), 10) === generateChecksum(value.slice(0, -1));

export const validate = (
  value: string
): { error?: string; isValid: boolean } => {
  if (!value) {
    return { isValid: false, error: "Please provide the value" };
  }

  if (!new RegExp("^\\d+$").test(value)) {
    return { isValid: false, error: "Value must be numeric" };
  }

  if (value.length === 13) {
    if (!validateChecksum(value)) {
      return {
        isValid: false,
        error: "Provided value is not a valid EAN13 code",
      };
    }
  }

  if (value.length !== 12 && value.length !== 13) {
    return { isValid: false, error: "Value must be 12 or 13 characters long" };
  }

  return { isValid: true };
};
