import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { VirtualClockButton } from "@/components/virtual-clock-button";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full flex-1 p-3 sm:p-4 xl:max-w-[95%]">
        <div className="mt-4 px-0 py-2 sm:px-6">
          <Outlet />
        </div>
      </div>
      <Footer />
      <VirtualClockButton />
    </div>
  );
}
