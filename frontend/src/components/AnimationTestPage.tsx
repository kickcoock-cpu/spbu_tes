import React from 'react';
import { MovingTruckAnimation } from '@/components/MovingTruckAnimation';
import { TankTruckAnimation } from '@/components/TankTruckAnimation';

const AnimationTestPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Animation Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Small Moving Truck</h2>
          <MovingTruckAnimation size="sm" />
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Medium Moving Truck</h2>
          <MovingTruckAnimation size="md" />
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Large Moving Truck</h2>
          <MovingTruckAnimation size="lg" />
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Small Tank Truck</h2>
          <TankTruckAnimation size="sm" />
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Medium Tank Truck</h2>
          <TankTruckAnimation size="md" />
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Large Tank Truck</h2>
          <TankTruckAnimation size="lg" />
        </div>
      </div>
    </div>
  );
};

export default AnimationTestPage;