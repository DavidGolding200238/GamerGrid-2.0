import { Header } from "../components/Header";
import { Link } from "react-router-dom";

export default function News() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="text-center">
          <h1 className="text-white font-montserrat text-4xl font-bold tracking-wider mb-8 uppercase">
            News
          </h1>
          <p className="text-white/70 text-xl mb-8">
            This page is under construction.
          </p>
          <Link
            to="/"
            className="inline-block bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
