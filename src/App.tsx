import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Makeup from "./components/makeup";
import Footer from "./components/footer";

function App() {
  return (
    <div className="font-poppins min-h-screen bg-gradient-to-br from-pink-300 via-red-100 to-rose-400 relative flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 py-24 mb-24">
        <Hero />
        <Makeup />
      </main>
      <Footer />
    </div>
  )
}

export default App
