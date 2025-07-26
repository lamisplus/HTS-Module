export const calculate_age = (dob) => {

  if (!dob) {
    return null; 
  }

  const today = new Date();
  const birthDate = new Date(dob);


  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const todayDate = today.getDate();

  const birthDateMonth = birthDate.getMonth();
  const birthDateYear = birthDate.getFullYear();
  const birthdateDate = birthDate.getDate();


  let age = todayYear - birthDateYear;

  // Check if birthday has occurred this year
  // If current month is before birth month, birthday hasn't occurred yet
  if (todayMonth < birthDateMonth) {
    age--;
  }
  // If same month, check the day
  else if (todayMonth === birthDateMonth && todayDate < birthdateDate) {
    age--;
  }

  return age;
};

export const generateDobFromAge = (age) => {
  // Use January 1st of the current year - age
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  return `${birthYear}-01-01`;
};

export const validateVisitDateWithDOB = (dob, visitDate) => {
  // const dob = obj.dob;
  // const visitDate = obj.visitDate;

  if (!dob || !visitDate) {
    return "Please provide both Date of Birth and Visit Date.";
  }

  const dobDate = new Date(dob);
  const visitDateDate = new Date(visitDate);

  if (isNaN(dobDate) || isNaN(visitDateDate)) {
    return "Invalid date format detected. Please enter a valid date (e.g., YYYY-MM-DD).";
  }

  if (visitDateDate < dobDate) {
    return "The Visit Date cannot be earlier than the Date of Birth.";
  }

  return null;
}