import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedLayout from "../layouts/ProtectedLayout";
import KitchenView from "../views/KitchenView";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Layout principal */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<KitchenView />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
