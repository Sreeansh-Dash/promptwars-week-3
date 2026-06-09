import { calculateMonthlyCarbon } from './carbonEngine';

const testCalculation = () => {
  const testData = {
    transportation: { kmPerDay: 20, vehicleType: 'car' as const },
    homeEnergy: { electricityKwhPerMonth: 300, heatingType: 'gas' as const },
    diet: 'average' as const,
    waste: 'average' as const,
  };

  const result = calculateMonthlyCarbon(testData);

  const expectedTransport = (20 * 30) * 0.192; // 115.2
  const expectedEnergy = (300 * 0.233) + 150; // 69.9 + 150 = 219.9
  const expectedDiet = 170;
  const expectedWaste = 50;
  const expectedTotal = expectedTransport + expectedEnergy + expectedDiet + expectedWaste;

  console.assert(Math.abs(result.transport - expectedTransport) < 0.01, `Transport mismatch: ${result.transport} vs ${expectedTransport}`);
  console.assert(Math.abs(result.energy - expectedEnergy) < 0.01, `Energy mismatch: ${result.energy} vs ${expectedEnergy}`);
  console.assert(Math.abs(result.total - expectedTotal) < 0.01, `Total mismatch: ${result.total} vs ${expectedTotal}`);

  console.log("All calculations passed!");
};

// Run the test
testCalculation();
