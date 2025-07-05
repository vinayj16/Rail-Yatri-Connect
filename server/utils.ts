/**
 * Generate a random PNR number in the format of 10 digits
 * @returns A random PNR number
 */
export function generatePnr(): string {
  const min = 1000000000; // 10-digit number (min)
  const max = 9999999999; // 10-digit number (max)
  return Math.floor(min + Math.random() * (max - min)).toString();
}

/**
 * Generate a random seat/berth number in the format of coach-seat (e.g., "B1-32")
 * @param trainClass The class code (e.g., "SL", "3A", "2A", "1A")
 * @returns A random seat/berth number
 */
export function generateSeatNumber(trainClass: string): string {
  const coaches: Record<string, { prefix: string, maxCoach: number, maxSeat: number }> = {
    'SL': { prefix: 'S', maxCoach: 12, maxSeat: 72 },
    '3A': { prefix: 'B', maxCoach: 8, maxSeat: 64 },
    '2A': { prefix: 'A', maxCoach: 4, maxSeat: 46 },
    '1A': { prefix: 'H', maxCoach: 2, maxSeat: 24 },
    'CC': { prefix: 'C', maxCoach: 10, maxSeat: 78 },
    'EC': { prefix: 'E', maxCoach: 2, maxSeat: 56 },
  };

  const classInfo = coaches[trainClass] || coaches['SL']; // Default to sleeper if unknown
  const coachNumber = Math.floor(Math.random() * classInfo.maxCoach) + 1;
  const seatNumber = Math.floor(Math.random() * classInfo.maxSeat) + 1;
  
  return `${classInfo.prefix}${coachNumber}-${seatNumber}`;
}

/**
 * Calculate the fare for a train journey
 * @param baseFare The base fare for the class
 * @param distance The distance in kilometers
 * @param classType The class type (e.g., "SL", "3A", "2A", "1A")
 * @param bookingType The booking type ("general" or "tatkal")
 * @returns The calculated fare
 */
export function calculateFare(
  baseFare: number, 
  distance: number, 
  classType: string, 
  bookingType: string = 'general'
): number {
  // Base fare multipliers for different classes
  const classMultipliers: Record<string, number> = {
    'SL': 1.0,
    '3A': 1.8,
    '2A': 2.5,
    '1A': 4.0,
    'CC': 1.4,
    'EC': 2.2,
  };

  // Calculate base fare based on class
  const multiplier = classMultipliers[classType] || 1.0;
  let fare = baseFare * multiplier;
  
  // Add distance component
  fare += distance * 0.2;
  
  // Add tatkal charges if applicable
  if (bookingType === 'tatkal') {
    const tatkalCharges: Record<string, number> = {
      'SL': 200,
      '3A': 400,
      '2A': 500,
      '1A': 600,
      'CC': 300,
      'EC': 400,
    };
    fare += tatkalCharges[classType] || 200;
  }
  
  // Round to nearest 5
  return Math.ceil(fare / 5) * 5;
}