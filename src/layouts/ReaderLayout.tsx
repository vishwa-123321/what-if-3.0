import { Outlet } from 'react-router-dom';
import { AnimatedUniverseCanvas } from '../components/AnimatedUniverseCanvas';

export function ReaderLayout() {
  return (
    <div className="relative min-h-screen bg-[#04060E] text-slate-100">
      <AnimatedUniverseCanvas />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
