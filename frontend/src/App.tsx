import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Tags from "./pages/Tags"
import Fetch from "./pages/Fetch"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="tags" element={<Tags />} />
          <Route path="fetch" element={<Fetch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
