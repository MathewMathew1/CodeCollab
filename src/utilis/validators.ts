export const stringLengthValidator = (
  fieldName: string,
  value: string,
  minLength: number,
  maxLength: number,
): string | null => {
  if (value.length < minLength || value.length > maxLength) {
    return `${fieldName} must be between ${minLength} and ${maxLength} characters.`;
  }
  return null;
};

export const numberRangeValidator = (
  fieldName: string,
  value: number,
  min: number,
  max: number,
): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}.`;
  }
  return null;
};

export const arrayLengthValidator = <T>(
  fieldName: string,
  value: T[],
  minLength: number,
  maxLength: number,
): string | null => {
  if (value.length < minLength || value.length > maxLength) {
    return `${fieldName} must have between ${minLength} and ${maxLength} elements.`;
  }
  return null;
};
