import { Outlet } from 'react-router-dom';
import { AnimatedUniverseCanvas } from '../components/AnimatedUniverseCanvas';
import { Footer } from '../components/Footer';
import { Navbar, SidebarRail } from '../components/Navbar';

export function MainLayout() {
  return (
    <div className="relative flex min-h-screen bg-[#050711]">
      <AnimatedUniverseCanvas />
      <div className="relative z-10 flex min-w-0 flex-1">
        <SidebarRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
