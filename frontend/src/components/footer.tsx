import { Link } from "react-router-dom";

export function Footer() {
	const navItems = [
		{ label: "Home", to: "/home" },
		{ label: "Games", to: "/games" },
		{ label: "Community", to: "/community" },
		{ label: "News", to: "/news" },
	];

	const legalItems = [
		{ label: "Privacy", to: "/privacy" },
		{ label: "Terms", to: "/terms" },
		{ label: "Contact", to: "/contact" },
	];

	return (
		<footer className="relative z-30 border-t border-white/10 bg-black/60 supports-[backdrop-filter]:bg-black/40 backdrop-blur-md mt-20">
			{/* Top gradient line */}
			<div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-70" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
					{/* Brand */}
					<div className="flex flex-col gap-4 min-w-0">
						<Link to="/" className="group flex items-center gap-3 w-fit">
							<div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end shadow-inner shadow-black/50 flex items-center justify-center">
								<span className="font-ethnocentric text-[0.6rem] tracking-wider text-white/90 leading-none">GG</span>
								<div className="absolute -inset-[2px] rounded-xl ring-1 ring-white/10 group-hover:ring-accent/40 transition" />
							</div>
							<div className="flex flex-col leading-tight select-none">
								<span className="font-ethnocentric text-xs text-white/70 group-hover:text-white transition-colors">THE</span>
								<span className="font-ethnocentric text-base text-white group-hover:text-accent transition-colors">GAME GRID</span>
							</div>
						</Link>
						<p className="text-white/60 font-jost text-sm max-w-sm">
							Discover, track, and discuss your favorite games. Curated spotlights, active communities, and the latest gaming news—powered by GamerGrid.
						</p>
						{/* Socials */}
						<div className="flex items-center gap-3">
							<a href="#" aria-label="Twitter/X" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-accent hover:bg-white/10 hover:border-accent/40 flex items-center justify-center transition-colors">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</a>
							<a href="#" aria-label="Discord" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-accent hover:bg-white/10 hover:border-accent/40 flex items-center justify-center transition-colors">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path d="M20.317 4.369A19.791 19.791 0 0016.558 3c-.2.36-.43.848-.589 1.232a18.27 18.27 0 00-7.938 0A8.74 8.74 0 007.442 3 19.736 19.736 0 003.683 4.37C1.944 7.049 1.415 9.62 1.612 12.156c2.09 1.565 4.108 2.523 6.128 3.156.494-.68.936-1.405 1.319-2.168-.733-.278-1.44-.62-2.12-1.017.178-.132.353-.269.522-.41 4.055 1.9 8.44 1.9 12.475 0 .172.143.346.28.522.411-.678.397-1.385.739-2.117 1.017.383.763.824 1.488 1.318 2.168 2.022-.633 4.042-1.592 6.131-3.157.246-3.117-.413-5.66-2.494-7.787z" />
								</svg>
							</a>
							<a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-accent hover:bg-white/10 hover:border-accent/40 flex items-center justify-center transition-colors">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path d="M23.5 6.2a3 3 0 00-2.1-2.1C19 3.5 12 3.5 12 3.5s-7 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1C5 20.5 12 20.5 12 20.5s7 0 9.4-.6a3 3 0 002.1-2.1 31.5 31.5 0 00.5-5.8 31.5 31.5 0 00-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z" />
								</svg>
							</a>
							<a href="#" aria-label="GitHub" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-accent hover:bg-white/10 hover:border-accent/40 flex items-center justify-center transition-colors">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.087 2.91.832.091-.646.35-1.086.636-1.336-2.221-.252-4.555-1.11-4.555-4.944 0-1.091.39-1.984 1.03-2.683-.103-.252-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.394.099 2.646.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.69-4.564 4.938.359.309.679.918.679 1.852 0 1.336-.012 2.414-.012 2.742 0 .269.18.58.688.481C19.138 20.162 22 16.414 22 12c0-5.523-4.477-10-10-10z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Navigation */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-8">
						<div>
							<h3 className="text-white font-montserrat font-semibold tracking-wide flex items-center gap-3 mb-3">
								Navigate <span className="h-0.5 w-12 bg-accent rounded-full" />
							</h3>
							<ul className="space-y-2">
								{navItems.map((n) => (
									<li key={n.to}>
										<Link
											to={n.to}
											className="text-white/70 hover:text-white font-jost text-sm tracking-wide transition-colors"
										>
											{n.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h3 className="text-white font-montserrat font-semibold tracking-wide flex items-center gap-3 mb-3">
								Legal <span className="h-0.5 w-12 bg-accent rounded-full" />
							</h3>
							<ul className="space-y-2">
								{legalItems.map((n) => (
									<li key={n.to}>
										<Link
											to={n.to}
											className="text-white/70 hover:text-white font-jost text-sm tracking-wide transition-colors"
										>
											{n.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* CTA / Newsletter (placeholder) */}
					<div className="flex flex-col gap-3">
						<h3 className="text-white font-montserrat font-semibold tracking-wide flex items-center gap-3">
							Stay Updated <span className="h-0.5 w-12 bg-accent rounded-full" />
						</h3>
						<p className="text-white/60 font-jost text-sm">Get the latest spotlights and news right to your inbox.</p>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="flex items-stretch gap-2 max-w-md"
						>
							<input
								type="email"
								placeholder="Your email"
								className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/40 font-jost tracking-wide focus:outline-none focus:ring-2 focus:ring-accent/70"
								required
							/>
							<button
								type="submit"
								className="px-4 py-2.5 rounded-lg bg-accent text-black font-jost font-semibold tracking-wide hover:bg-accent/90 shadow-[0_4px_18px_-4px_rgba(255,120,50,0.45)] transition"
							>
								Subscribe
							</button>
						</form>
						<span className="text-[11px] text-white/45 font-jost">No spam. Unsubscribe anytime.</span>
					</div>
				</div>

				{/* Divider */}
				<div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* Bottom bar */}
				<div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
					<p className="text-white/50 text-xs font-jost tracking-wide">
						© {new Date().getFullYear()} GamerGrid. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						{legalItems.map((n) => (
							<Link key={`legal-bottom-${n.to}`} to={n.to} className="text-white/60 hover:text-white text-xs font-jost tracking-wide">
								{n.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;

