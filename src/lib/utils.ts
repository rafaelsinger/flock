export const capitalize = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Map of state abbreviations to full state names
export const stateAbbreviationToName: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  AS: 'American Samoa',
  GU: 'Guam',
  MP: 'Northern Mariana Islands',
  PR: 'Puerto Rico',
  UM: 'United States Minor Outlying Islands',
  VI: 'U.S. Virgin Islands',
};

// Convert state abbreviation to full name
export const getStateFullName = (abbreviation: string): string => {
  return stateAbbreviationToName[abbreviation.toUpperCase()] || abbreviation;
};

export function getCustomBuckets(max: number): number[] {
  if (max <= 2) return [1, 2, 3]; // 3 bins: 0, 1, 2+
  if (max <= 5) return [1, 3, 5]; // 3 bins: 0, 1–2, 3–4, 5+
  if (max <= 10) return [1, 3, 6, 10]; // 4 bins
  if (max <= 25) return [5, 10, 15, 25]; // 4 bins
  if (max <= 100) return [10, 25, 50, 100]; // 4 bins
  return [10, 50, 100, 250, max]; // 5 bins
}
