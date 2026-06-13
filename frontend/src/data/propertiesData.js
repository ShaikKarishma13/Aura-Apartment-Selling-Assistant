// Import all local property images
import gachibowli2BhkImg from "../assets/property_gachibowli_2bhk.png";
import gachibowli3BhkImg from "../assets/property_gachibowli_3bhk.png";
import hiteccityImg from "../assets/property_hiteccity_4bhk.png";
import jubileehillsImg from "../assets/property_jubileehills_5bhk.png";
import kokapetImg from "../assets/property_kokapet_4bhk.png";
import kondapurImg from "../assets/property_kondapur_3bhk.png";
import madhapurImg from "../assets/property_madhapur_2bhk.png";
import manikondaImg from "../assets/property_manikonda_3bhk.png";

// Import interior images
import interiorLiving1 from "../assets/interior_living_1.png";
import interiorLiving2 from "../assets/interior_living_2.png";
import interiorBed1 from "../assets/interior_bed_1.png";
import interiorBed2 from "../assets/interior_bed_2.png";
import interiorKitchen1 from "../assets/interior_kitchen_1.png";
import interiorKitchen2 from "../assets/interior_kitchen_2.png";
import interiorBath1 from "../assets/interior_bath_1.png";
import interiorBath2 from "../assets/interior_bath_2.png";
import interiorBalcony1 from "../assets/interior_balcony_1.png";

// Map interiorBalcony2 to balcony1 due to image generation limits
const interiorBalcony2 = interiorBalcony1;

export const PROPERTIES_DATA = [
  {
    id: 1,
    propId: "PROP-1001",
    title: "Sky Residency",
    location: "Gachibowli",
    bhk: "3 BHK",
    price: 12000000, // 1.2 Cr
    priceLabel: "₹1.2 Cr",
    size: "1,650 Sq Ft",
    availability: "Available",
    image: gachibowli3BhkImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Rooftop Lounge", "Power Backup"],
    description: "Sky Residency stands tall in the heart of Gachibowli, offering a premium and sophisticated lifestyle for modern families. It features high-ceiling rooms, cross-ventilation windows, and a master suite with private balcony. Situated just 5 minutes away from key IT parks, it is the perfect blend of premium comfort and professional convenience.",
    images: [
      { url: gachibowli3BhkImg, caption: "Exterior View" },
      { url: interiorLiving1, caption: "Living Room" },
      { url: interiorBed1, caption: "Master Bedroom" },
      { url: interiorKitchen1, caption: "Modular Kitchen" },
      { url: interiorBath1, caption: "Luxury Bathroom" },
      { url: interiorBalcony1, caption: "Private Balcony" }
    ]
  },
  {
    id: 2,
    propId: "PROP-1002",
    title: "Cyber Heights",
    location: "Hitec City",
    bhk: "4 BHK",
    price: 21000000, // 2.1 Cr
    priceLabel: "₹2.1 Cr",
    size: "2,400 Sq Ft",
    availability: "Available",
    image: hiteccityImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Private Elevator", "Infinity Pool"],
    description: "Cyber Heights is a statement of hyper-luxury living. Located in Hitec City, this spacious 4 BHK penthouse offers a private elevator entry, home automation systems, and floor-to-ceiling glass windows offering a panoramic view of the city. Amenities include an exclusive resident infinity pool and dedicated concierge services.",
    images: [
      { url: hiteccityImg, caption: "Exterior View" },
      { url: interiorLiving2, caption: "Living Room" },
      { url: interiorBed2, caption: "Master Bedroom" },
      { url: interiorKitchen2, caption: "Modular Kitchen" },
      { url: interiorBath2, caption: "Luxury Bathroom" },
      { url: interiorBalcony2, caption: "Private Balcony" }
    ]
  },
  {
    id: 3,
    propId: "PROP-1003",
    title: "Aura Elite",
    location: "Madhapur",
    bhk: "2 BHK",
    price: 8500000, // 85 Lakhs
    priceLabel: "₹85 Lakhs",
    size: "1,200 Sq Ft",
    availability: "Available",
    image: madhapurImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Clubhouse", "Jogging Track"],
    description: "Aura Elite offers highly efficient and cozy 2 BHK homes in Madhapur. It is ideal for young professionals or small families seeking premium living at an affordable price. The community boasts beautifully landscaped gardens, a jogging track, and a fully equipped clubhouse with indoor games.",
    images: [
      { url: madhapurImg, caption: "Exterior View" },
      { url: interiorLiving1, caption: "Living Room" },
      { url: interiorBed1, caption: "Master Bedroom" },
      { url: interiorKitchen1, caption: "Modular Kitchen" },
      { url: interiorBath1, caption: "Luxury Bathroom" }
    ]
  },
  {
    id: 4,
    propId: "PROP-1004",
    title: "Lakeview Vista",
    location: "Kondapur",
    bhk: "3 BHK",
    price: 14000000, // 1.4 Cr
    priceLabel: "₹1.4 Cr",
    size: "1,750 Sq Ft",
    availability: "Limited Units",
    image: kondapurImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Lake View Balcony", "Multipurpose Hall"],
    description: "Lakeview Vista in Kondapur lives up to its name, featuring broad open balconies overlooking the local water body. Built with premium materials, this 3 BHK flat includes modular kitchen setups, marble flooring, and ready-to-move-in lighting fixtures. Excellent connectivity to Hitec City is an added benefit.",
    images: [
      { url: kondapurImg, caption: "Exterior View" },
      { url: interiorLiving2, caption: "Living Room" },
      { url: interiorBed2, caption: "Master Bedroom" },
      { url: interiorKitchen2, caption: "Modular Kitchen" },
      { url: interiorBath2, caption: "Luxury Bathroom" },
      { url: interiorBalcony2, caption: "Private Balcony" }
    ]
  },
  {
    id: 5,
    propId: "PROP-1005",
    title: "Silicon Oasis",
    location: "Gachibowli",
    bhk: "2 BHK",
    price: 7800000, // 78 Lakhs
    priceLabel: "₹78 Lakhs",
    size: "1,150 Sq Ft",
    availability: "Sold Out",
    image: gachibowli2BhkImg,
    amenities: ["Parking", "Security", "High-speed Lifts", "Rainwater Harvesting", "Mini Gym"],
    description: "Silicon Oasis offers pocket-friendly premium 2 BHK homes strategically situated near financial district corridors in Gachibowli. Although currently sold out, this building remains popular for rental yield due to high-speed elevator access, rainwater harvesting setups, and low maintenance fees.",
    images: [
      { url: gachibowli2BhkImg, caption: "Exterior View" },
      { url: interiorLiving1, caption: "Living Room" },
      { url: interiorBed1, caption: "Master Bedroom" },
      { url: interiorKitchen1, caption: "Modular Kitchen" },
      { url: interiorBath1, caption: "Luxury Bathroom" }
    ]
  },
  {
    id: 6,
    propId: "PROP-1006",
    title: "Orchid Meadows",
    location: "Kokapet",
    bhk: "4 BHK",
    price: 35000000, // 3.5 Cr
    priceLabel: "₹3.5 Cr",
    size: "3,200 Sq Ft",
    availability: "Available",
    image: kokapetImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Tennis Court", "Spa & Sauna"],
    description: "Orchid Meadows presents a gated collection of expansive ultra-luxury 4 BHK apartments in Kokapet. Designed with a massive living area, private study room, and modular double-kitchen setups. Residents get access to world-class sports facilities, including clay tennis courts and an internal spa.",
    images: [
      { url: kokapetImg, caption: "Exterior View" },
      { url: interiorLiving2, caption: "Living Room" },
      { url: interiorBed2, caption: "Master Bedroom" },
      { url: interiorKitchen2, caption: "Modular Kitchen" },
      { url: interiorBath2, caption: "Luxury Bathroom" },
      { url: interiorBalcony2, caption: "Private Balcony" }
    ]
  },
  {
    id: 7,
    propId: "PROP-1007",
    title: "Pinnacle Heights",
    location: "Jubilee Hills",
    bhk: "5 BHK",
    price: 62000000, // 6.2 Cr
    priceLabel: "₹6.2 Cr",
    size: "4,500 Sq Ft",
    availability: "Available",
    image: jubileehillsImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Private Pool", "Helipad Access"],
    description: "Pinnacle Heights sets the benchmark for elite architectural marvels. Situated on the peaks of Jubilee Hills, this colossal 5 BHK residence offers private swimming pools for each villa floor, bulletproof secure glazing, private parking bays for up to 4 cars, and top-tier neighborhood privacy.",
    images: [
      { url: jubileehillsImg, caption: "Exterior View" },
      { url: interiorLiving1, caption: "Living Room" },
      { url: interiorBed1, caption: "Master Bedroom" },
      { url: interiorKitchen1, caption: "Modular Kitchen" },
      { url: interiorBath1, caption: "Luxury Bathroom" },
      { url: interiorBalcony1, caption: "Private Balcony" }
    ]
  },
  {
    id: 8,
    propId: "PROP-1008",
    title: "Greenwood Apartments",
    location: "Manikonda",
    bhk: "3 BHK",
    price: 9500000, // 95 Lakhs
    priceLabel: "₹95 Lakhs",
    size: "1,500 Sq Ft",
    availability: "Limited Units",
    image: manikondaImg,
    amenities: ["Parking", "Security", "Garden", "Mini Theatre", "Indoor Games Room"],
    description: "Greenwood Apartments is a beautifully designed, ready-to-move-in residential complex in Manikonda. This 3 BHK flat includes large French windows, premium fittings, and access to a mini theatre, indoor gaming rooms, and common park landscaping, perfect for relaxation.",
    images: [
      { url: manikondaImg, caption: "Exterior View" },
      { url: interiorLiving2, caption: "Living Room" },
      { url: interiorBed2, caption: "Master Bedroom" },
      { url: interiorKitchen2, caption: "Modular Kitchen" },
      { url: interiorBath2, caption: "Luxury Bathroom" }
    ]
  },
  {
    id: 9,
    propId: "PROP-1009",
    title: "Banjara Skyline",
    location: "Jubilee Hills",
    bhk: "4 BHK",
    price: 26000000, // 2.6 Cr
    priceLabel: "₹2.6 Cr",
    size: "2,850 Sq Ft",
    availability: "Limited Units",
    image: jubileehillsImg,
    amenities: ["Parking", "Gym", "Security", "Garden", "Infinity Pool", "Clubhouse"],
    description: "Banjara Skyline in Jubilee Hills is a majestic luxury residence offering a stunning panoramic view of the hills. Featuring high-grade security systems, automated smart-home lighting, a double-height ceiling living room, and spacious open balconies. A short distance away from luxury retail hubs, it offers the ultimate premium lifestyle.",
    images: [
      { url: jubileehillsImg, caption: "Exterior View" },
      { url: interiorLiving1, caption: "Living Room" },
      { url: interiorBed1, caption: "Master Bedroom" },
      { url: interiorKitchen1, caption: "Modular Kitchen" },
      { url: interiorBath1, caption: "Luxury Bathroom" },
      { url: interiorBalcony1, caption: "Private Balcony" }
    ]
  }
];
