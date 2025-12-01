'use client';

interface Service {
  id: string;
  name: string;
}

const SERVICES: Service[] = [
  { id: 'appliance-repair', name: 'Appliance Repair' },
  { id: 'bathroom-remodeling', name: 'Bathroom Remodeling' },
  { id: 'carpet-cleaning', name: 'Carpet Cleaning' },
  { id: 'carpentry-woodworking', name: 'Carpentry & Woodworking' },
  { id: 'chimneys-fireplaces', name: 'Chimneys and Fireplaces' },
  { id: 'doors', name: 'Doors' },
  { id: 'drywall-installation', name: 'Drywall Installation' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'flooring-tile', name: 'Flooring & Tile' },
  { id: 'garage-door-installation', name: 'Garage Door Installation' },
  { id: 'handyman-service', name: 'Handyman Service' },
  { id: 'home-cleaning', name: 'Home Cleaning' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'kitchen-remodeling', name: 'Kitchen Remodeling and Renovation' },
  { id: 'landscaping-outdoor', name: 'Landscaping and Outdoor Services' },
  { id: 'locksmith', name: 'Locksmith' },
  { id: 'masonry-concrete', name: 'Masonry and Concrete' },
  { id: 'painting-wallpaper', name: 'Painting and Wallpaper' },
  { id: 'pest-control', name: 'Pest Control' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'swimming-pool-spa', name: 'Swimming Pool and Spa Services' },
  { id: 'water-mold-restoration', name: 'Water and Mold Damage Restoration' },
  { id: 'window-installation-repair', name: 'Window Installation and Repair' },
];

interface ServiceSelectorProps {
  selectedService: string | null;
  onServiceSelect: (serviceId: string | null) => void;
}

export default function ServiceSelector({ selectedService, onServiceSelect }: ServiceSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select Your Service Type (Optional)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
        <button
          onClick={() => onServiceSelect(null)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedService === null
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          All Services
        </button>
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceSelect(service.id)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
              selectedService === service.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            title={service.name}
          >
            {service.name.length > 20 ? `${service.name.substring(0, 20)}...` : service.name}
          </button>
        ))}
      </div>
      {selectedService && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: <span className="font-semibold">{SERVICES.find(s => s.id === selectedService)?.name}</span>
        </p>
      )}
    </div>
  );
}

export { SERVICES };
export type { Service };

