import { Header } from "@/components/header";
import { VirtualClockButton } from "@/components/virtual-clock-button";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div>
      <div className="mx-auto min-h-250 w-full p-3 sm:p-4 xl:max-w-[80%]">
        <Header />
        <div className="mt-4 px-0 py-2 sm:px-6">
          <Outlet />
        </div>
      </div>
      <VirtualClockButton />
    </div>
  );
}
