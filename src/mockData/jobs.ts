import { JobType } from '../types/job';

// Mock jobs data to use while developing the frontend
export const mockJobs: JobType[] = [
  {
    _id: 'job-001',
    homeownerId: 'mock-user-id',
    homeownerName: 'John Doe',
    title: 'Leaky Kitchen Faucet Repair',
    description: 'My kitchen faucet has been dripping constantly for the past week. It\'s a single-handle Moen faucet, about 5 years old. The drip is slow but consistent. I\'ve tried tightening it but that didn\'t help. Looking for someone who can either fix or replace the faucet.\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Recommended tools: Phillips screwdriver, adjustable wrench\n- Estimated time to complete: 1-3 hours depending on complexity',
    image: 'https://images.pexels.com/photos/1027508/pexels-photo-1027508.jpeg',
    location: {
      lat: 40.7128,
      lng: -74.0060
    },
    locationName: 'Brooklyn, NY',
    category: 'plumbing',
    estimatedBudget: '100-250',
    tags: ['plumbing', 'faucet', 'leak', 'kitchen'],
    status: 'open',
    applications: [
      {
        fixerId: 'fixer-001',
        fixerName: 'Mike Wilson',
        message: 'I have 10+ years of experience with plumbing repairs. I can fix your leaky faucet tomorrow afternoon if you are available. I will bring all the necessary tools and parts.',
        price: '$120 flat fee',
        estimatedTime: '1-2 hours',
        createdAt: '2025-04-01T14:30:00Z'
      }
    ],
    createdAt: '2025-04-01T12:00:00Z'
  },
  {
    _id: 'job-002',
    homeownerId: 'other-user',
    homeownerName: 'Sarah Johnson',
    title: 'Ceiling Fan Installation',
    description: 'I need a ceiling fan installed in my master bedroom. I have already purchased the fan (Hampton Bay Havana 48"). There is an existing light fixture in the ceiling that needs to be replaced. The ceiling is about 9 feet high.\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Recommended tools: Wire cutters, voltage tester, screwdrivers\n- Estimated time to complete: 2-3 hours',
    image: 'https://images.pexels.com/photos/5713297/pexels-photo-5713297.jpeg',
    location: {
      lat: 40.7282,
      lng: -74.0776
    },
    locationName: 'Hoboken, NJ',
    category: 'electrical',
    estimatedBudget: '100-250',
    tags: ['electrical', 'ceiling fan', 'installation'],
    status: 'assigned',
    applications: [
      {
        fixerId: 'mock-user-id',
        fixerName: 'Jane Smith',
        message: 'I am a licensed electrician and can install your ceiling fan safely. I have experience with Hampton Bay fans and can ensure it is properly balanced and wired.',
        price: '$150',
        estimatedTime: '2 hours',
        createdAt: '2025-03-29T15:45:00Z'
      }
    ],
    assignedFixer: {
      fixerId: 'mock-user-id',
      fixerName: 'Jane Smith'
    },
    createdAt: '2025-03-29T14:15:00Z'
  },
  {
    _id: 'job-003',
    homeownerId: 'mock-user-id',
    homeownerName: 'John Doe',
    title: 'Bathroom Tile Repair',
    description: 'Several tiles in my shower have come loose and need to be reattached. There are about 5-6 tiles affected. The tiles are white subway tiles (3x6 inches). I have some extra tiles if replacements are needed. The grout is also cracking in some areas.\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Recommended tools: Tile cutter, trowel, grout float\n- Estimated time to complete: 3-5 hours depending on preparation needed',
    image: 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg',
    location: {
      lat: 40.7168,
      lng: -74.0431
    },
    locationName: 'Jersey City, NJ',
    category: 'general',
    estimatedBudget: '250-500',
    tags: ['tile', 'bathroom', 'repair', 'grout'],
    status: 'completed',
    applications: [
      {
        fixerId: 'fixer-002',
        fixerName: 'Robert Chen',
        message: 'I specialize in tile work and bathroom renovations. I can fix your loose tiles and re-grout as needed. I have all the necessary tools and materials.',
        price: '$300',
        estimatedTime: '4-5 hours',
        createdAt: '2025-03-15T10:20:00Z'
      }
    ],
    assignedFixer: {
      fixerId: 'fixer-002',
      fixerName: 'Robert Chen'
    },
    createdAt: '2025-03-15T09:30:00Z',
    completedAt: '2025-03-18T16:45:00Z'
  },
  {
    _id: 'job-004',
    homeownerId: 'other-user',
    homeownerName: 'Emily Rodriguez',
    title: 'Painting Living Room Walls',
    description: 'I need my living room painted. It\'s approximately 15x12 feet with 9-foot ceilings. The current color is beige, and I want to change it to a light gray (I\'ve already purchased the paint - Benjamin Moore "Horizon"). There are a few small nail holes that need patching. The room has been emptied of furniture.\n\nAdditional details based on the description:\n- The issue requires professional attention for best results\n- Recommended tools: Rollers, brushes, drop cloths, spackle\n- Estimated time to complete: 1-2 days including prep and drying time',
    image: 'https://images.pexels.com/photos/6444255/pexels-photo-6444255.jpeg',
    location: {
      lat: 40.6782,
      lng: -73.9442
    },
    locationName: 'Brooklyn, NY',
    category: 'painting',
    estimatedBudget: '500-1000',
    tags: ['painting', 'interior', 'walls', 'living room'],
    status: 'open',
    applications: [],
    createdAt: '2025-04-02T08:15:00Z'
  },
  {
    _id: 'job-005',
    homeownerId: 'mock-user-id',
    homeownerName: 'John Doe',
    title: 'Deck Staining and Sealing',
    description: 'I have a wooden deck (approx. 20x12 feet) that needs to be stained and sealed. The deck is about 3 years old and has never been treated. There are some areas where the wood has started to gray. I\'d like a semi-transparent stain in a cedar tone. The deck is easily accessible from the backyard.\n\nAdditional details based on the description:\n- The issue requires proper preparation and application techniques\n- Recommended tools: Power washer, sanders, brushes or sprayers\n- Estimated time to complete: 2-3 days including prep and drying time',
    image: 'https://images.pexels.com/photos/5997967/pexels-photo-5997967.jpeg',
    location: {
      lat: 40.7378,
      lng: -74.0631
    },
    locationName: 'Hoboken, NJ',
    category: 'general',
    estimatedBudget: '500-1000',
    tags: ['deck', 'staining', 'sealing', 'exterior'],
    status: 'cancelled',
    applications: [],
    createdAt: '2025-03-10T11:45:00Z'
  }
];