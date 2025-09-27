// Email validation utilities for college students
export interface EmailValidationResult {
  isValid: boolean;
  isCollegeEmail: boolean;
  domain: string;
  message: string;
}

// Common college email domains
const COLLEGE_DOMAINS = [
  'edu',
  'ac.in',
  'edu.in',
  'university.edu',
  'college.edu',
  'institute.edu',
  'school.edu'
];

// Specific college domains (you can add more)
const SPECIFIC_COLLEGE_DOMAINS = [
  'iit.ac.in',
  'iisc.ac.in',
  'iim.ac.in',
  'nit.ac.in',
  'vit.ac.in',
  'bits-pilani.ac.in',
  'manipal.edu',
  'amrita.edu',
  'srmuniv.ac.in',
  'annauniv.edu',
  'annauniv.ac.in'
];

export function validateCollegeEmail(email: string): EmailValidationResult {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isCollegeEmail: false,
      domain: '',
      message: 'Invalid email format'
    };
  }

  const domain = email.split('@')[1].toLowerCase();
  
  // Check if it's a college domain
  const isCollegeDomain = COLLEGE_DOMAINS.some(collegeDomain => 
    domain.endsWith(collegeDomain)
  ) || SPECIFIC_COLLEGE_DOMAINS.includes(domain);

  if (!isCollegeDomain) {
    return {
      isValid: true,
      isCollegeEmail: false,
      domain,
      message: 'Email is valid but not from a recognized college domain'
    };
  }

  return {
    isValid: true,
    isCollegeEmail: true,
    domain,
    message: 'Valid college email'
  };
}

export function getCollegeEmailDomains(): string[] {
  return [...COLLEGE_DOMAINS, ...SPECIFIC_COLLEGE_DOMAINS];
}
