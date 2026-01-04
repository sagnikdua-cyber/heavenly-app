import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-screen relative flex flex-col items-center justify-center bg-[#0a0e27] overflow-hidden">
      {/* Background/Aura elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Image */}
        <div className="relative w-96 h-96 rounded-full overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_80px_rgba(212,175,55,0.4)] transition-all duration-700">
          {/* Using the uploaded image. Ideally we'd remove bg, but for now we fit it. */}
          <Image
            src="/heavenly_logo.jpg"
            alt="Heavenly Logo"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay to blend edges if needed, or add golden tint */}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        </div>

        {/* Golden Button */}
        <Link href="/login" className="mt-16 group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <button className="relative px-12 py-4 bg-black rounded-full leading-none flex items-center divide-x divide-gray-600">
            <span className="flex items-center space-x-5">
              <span className="pr-6 text-amber-100 text-lg tracking-[0.2em] font-light group-hover:text-white transition duration-200">ENTER HEAVENLY</span>
            </span>
            <span className="pl-6 text-amber-400 group-hover:text-amber-100 transition duration-200">
              &rarr;
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
