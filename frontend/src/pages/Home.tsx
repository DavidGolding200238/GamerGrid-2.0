import { Link } from 'react-router-dom';
// Import types from shared API
import { Game } from '../../../shared/api';
import { gameApi } from '../services/gameApi';
import { newsApi, NewsArticle } from '../services/newsApi';
import { communityApi, Community } from '../services/communityApi';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { NetworkBackground } from '../components/NetworkBackground';

// Define fallback image for games
const imageFallback = 'https://placehold.co/600x400/222222/cccccc?text=No+Image';

// Use the API types for our data structures
type MixedItem = { kind:'game'; game:Game } | { kind:'news'; news:NewsArticle } | { kind:'community'; community:Community };

export default function Home(){
	const [games, setGames] = useState<Game[]>([]);
	const [communities, setCommunities] = useState<Community[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string|null>(null);
	
	// We'll fetch community and news data using the same pattern as games

	// map RAWG response to shared Game type
	const mapGame = (g:any):Game => ({
		id:String(g.id),
		title:g.name,
		image:g.background_image || g.background_image_additional || g.short_screenshots?.[0]?.image || imageFallback,
		genres:(g.genres||[]).map((x:any)=>x.name),
		platform:(g.platforms||[]).map((p:any)=>p.platform?.name).filter(Boolean),
		rating:g.rating,
	});

	const fetchCommunities = useCallback(async () => {
		try {
			// Use the dedicated communityApi service
			const communities = await communityApi.getCommunities();
			setCommunities(communities);
		} catch(e) {
			console.error('Failed to fetch communities:', e);
		}
	}, []);

	const fetchNews = useCallback(async () => {
		try {
			// Use the dedicated newsApi service
			const news = await newsApi.fetchGamingNews(6);
			setNewsItems(news);
		} catch(e) {
			console.error('Failed to fetch news:', e);
		}
	}, []);

	const fetchGames = useCallback(async ()=>{
		setLoading(true); setError(null);
		try {
			// Use our gameApi service instead of direct RAWG calls
			const games = await gameApi.fetchRandomGames(18);
			setGames(games);
			// If our API doesn't return data yet (implementation in progress), fallback to the mapping code
			if (games.length === 0) {
				// Fallback to direct fetch while our API is being developed
				try {
					const RAWG_API_KEY = 'c60ed11f699e430485308b3a910b1cb7';
					const withKey = (endpoint: string, params: Record<string, any> = {}) => {
						const url = new URL(`https://api.rawg.io/api${endpoint}`);
						url.searchParams.append('key', RAWG_API_KEY);
						Object.entries(params).forEach(([key, value]) => {
							if (value !== undefined) url.searchParams.append(key, String(value));
						});
						return url.toString();
					};
					const res = await fetch(withKey('/games', { page_size: 18, ordering:'-added' }));
					if(!res.ok) throw new Error('Failed to fetch');
					const data = await res.json();
					const mapped:Game[] = (data.results||[]).map(mapGame);
					setGames(mapped);
				} catch(fallbackError:any) {
					throw fallbackError;
				}
			}
		} catch(e:any){ setError(e.message||'Error'); }
		finally { setLoading(false); }
	}, []);

		const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
		const [mixSeed, setMixSeed] = useState(0);

		useEffect(()=>{ 
			// Fetch all data types on component mount
			fetchGames();
			fetchCommunities(); 
			fetchNews();
		}, [fetchGames, fetchCommunities, fetchNews]);

		// Build mixed games + communities + news collection
			const mixed: MixedItem[] = useMemo(() => {
				const gameItems: MixedItem[] = games.slice(0,10).map(g => ({ kind:'game', game: g }));
				const communityItems: MixedItem[] = communities.map(c => ({ kind:'community', community: c }));
				const newsMix: MixedItem[] = newsItems.slice(0,4).map(n => ({ kind:'news', news: n }));
				const combined = [...gameItems, ...communityItems, ...newsMix];
				// Shuffle array with mixSeed to allow refreshing
				const seed = mixSeed;
				for(let i=combined.length-1;i>0;i--){ 
					const j=Math.floor((Math.random() + seed/100) % 1 * (i+1)); 
					[combined[i],combined[j]]=[combined[j],combined[i]]; 
				}
				return combined;
			}, [games, communities, newsItems, mixSeed]);

	return (
		<div className="min-h-screen relative text-foreground overflow-hidden">
			<NetworkBackground />
			<div className="relative z-10 flex flex-col min-h-screen">
				<Header />
				<main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-32">
					<section className="mb-14 mt-6 flex flex-col gap-6">
						<h1 className="font-montserrat font-semibold text-3xl sm:text-4xl tracking-tight text-white">Welcome <span className="bg-gradient-to-r from-accent via-orange-300 to-pink-400 bg-clip-text text-transparent">Home</span></h1>
						<p className="text-white/65 font-jost text-sm sm:text-base max-w-2xl leading-relaxed">Quick snapshot of fresh games, buzzing communities and current headlines. Clean grid. No overlaps.</p>
										<div className="flex flex-wrap gap-3">
											<button onClick={() => {
								fetchGames();
								fetchCommunities();
								fetchNews();
							}} disabled={loading} className="px-5 py-2.5 rounded-lg bg-accent text-black text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_18px_-4px_rgba(255,120,50,0.45)] hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition">{loading? 'Refreshing...' : 'Refresh All'}</button>
											<button onClick={()=>setMixSeed(s=>s+1)} className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm transition">Shuffle Mix</button>
											<Link to="/games" className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm transition">Browse Library</Link>
										</div>
						{error && <div className="text-xs font-mono text-destructive/80 bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-md max-w-sm">{error}</div>}
					</section>

											<section className="space-y-20">
												{/* Mixed Games, Communities & News */}
												<div>
													<div className="flex items-center justify-between mb-6">
														<h2 className="font-montserrat font-semibold text-xl sm:text-2xl text-white flex items-center gap-3">Discover <span className="h-px w-20 bg-gradient-to-r from-accent/70 to-transparent" /></h2>
																		<div className="flex gap-4 items-center text-xs font-jost tracking-wide">
																			<Link to="/games" className="text-accent hover:underline">Games</Link>
																			<Link to="/community" className="text-accent hover:underline">Communities</Link>
																			<Link to="/news" className="text-accent hover:underline">News</Link>
																		</div>
													</div>
													<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 auto-rows-[150px] md:auto-rows-[170px] gap-5">
																		{mixed.map((item, idx) => {
															const pattern = idx % 11;
															const sizeClass = pattern===0 ? 'md:col-span-2 md:row-span-2' : pattern===4 ? 'md:col-span-2' : pattern===7 ? 'md:row-span-2' : '';
																			if(item.kind==='game'){
																const g = item.game;
																return (
																	<Link key={'g-'+g.id} to={`/games?focus=${g.id}`} className={`group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors flex flex-col ${sizeClass}`}>
																		<div className="absolute inset-0">
																			<img src={g.image} alt={g.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
																			<div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/60 to-black/90" />
																		</div>
																		<div className="relative z-10 mt-auto p-2">
																			<div className="absolute top-2 left-2 flex gap-1 flex-wrap">
																				{g.genres.slice(0,2).map((gen: string) => <span key={gen} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/40 text-white/70 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-black/50">{gen}</span>)}
																			</div>
																			<h3 className="text-[0.65rem] sm:text-[0.7rem] font-monomaniac text-white/90 leading-snug line-clamp-2 group-hover:text-white pr-2">{g.title}</h3>
																			{g.rating && <div className="mt-1 text-[10px] text-accent/90 font-mono tracking-wider flex items-center gap-1"><span className="text-accent">★</span>{g.rating.toFixed(1)}</div>}
																		</div>
																	</Link>
																);

																				} else if (item.kind === 'community') {
																					const c = item.community;
																					return (
																						<Link key={'c-'+c.id} to={`/community?focus=${c.id}`} className={`group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/50 backdrop-blur-sm transition-colors flex flex-col ${sizeClass}`}>
																							<div className="absolute inset-0">
																								{c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition" loading="lazy" />}
																								<div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black/85" />
																								<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.35),transparent_55%)] opacity-0 group-hover:opacity-40 transition" />
																							</div>
																							<div className="relative z-10 mt-auto p-2 flex flex-col gap-1">
																								<h3 className="text-[0.65rem] sm:text-[0.7rem] font-monomaniac text-white/90 leading-snug line-clamp-2 group-hover:text-white">{c.name}</h3>
																								<div className="flex items-center justify-between text-[10px] text-white/60 font-mono tracking-wider">
																									<span>{c.member_count.toLocaleString()} members</span>
																									<span className="hidden sm:inline text-white/40 italic">{c.category}</span>
																								</div>
																							</div>
																							<span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-500 text-white text-[9px] font-mono tracking-wide shadow-[0_0_0_1px_rgba(0,0,0,0.3)]">COMMUNITY</span>
																						</Link>
																					);
																				} else { // news
																					const n = (item as {kind: 'news', news: NewsArticle}).news;
																					return (
																						<Link key={'n-'+n.id} to={`/news?focus=${n.id}`} className={`group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-accent/20 hover:border-accent/50 backdrop-blur-sm transition-colors flex flex-col ${sizeClass}`}>
																							<div className="absolute inset-0">
																								<img src={n.urlToImage} alt={n.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-95 transition" loading="lazy" />
																								<div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black/95" />
																								<div className="absolute inset-0 bg-[conic-gradient(from_140deg_at_80%_20%,rgba(255,120,50,0.35),transparent_70%)] opacity-0 group-hover:opacity-60 transition" />
																							</div>
																							<div className="relative z-10 mt-auto p-2 flex flex-col gap-1">
																								<h3 className="text-[0.6rem] sm:text-[0.68rem] font-montserrat text-white/90 leading-snug line-clamp-3 group-hover:text-white">{n.title}</h3>
																								<div className="flex items-center justify-between text-[9px] text-white/55 font-mono tracking-wider"><span>{n.source.name}</span><span>{new Date(n.publishedAt).toLocaleDateString()}</span></div>
																							</div>
																							<span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-accent text-black text-[9px] font-mono tracking-wide shadow-[0_0_0_1px_rgba(0,0,0,0.3)]">NEWS</span>
																						</Link>
																					);
															}
														})}
														{loading && Array.from({length:6}).map((_,i)=>(<div key={i} className="rounded-2xl bg-white/5 border border-white/10 animate-pulse" />))}
													</div>
												</div>

												{/* News Grid (variable sizes) */}
									<div>
										<div className="flex items-center justify-between mb-6">
											<h2 className="font-montserrat font-semibold text-xl sm:text-2xl text-white flex items-center gap-3">News <span className="h-px w-20 bg-gradient-to-r from-accent/70 to-transparent" /></h2>
											<Link to="/news" className="text-xs font-jost tracking-wide text-accent hover:underline">More</Link>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 auto-rows-[150px] md:auto-rows-[170px] gap-5">
											{newsItems.map((n,idx) => {
												const pattern = idx % 8;
												const sizeClass = pattern===2 ? 'md:col-span-2' : pattern===5 ? 'md:row-span-2' : pattern===0 ? 'md:col-span-2 md:row-span-2' : '';
												return (
													<Link key={n.id} to={`/news?focus=${n.id}`} className={`group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors flex flex-col ${sizeClass}`}>
														<div className="absolute inset-0">
															<img src={n.urlToImage} alt={n.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition" loading="lazy" />
															<div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black/95" />
														</div>
														<div className="relative z-10 mt-auto p-2 flex flex-col gap-1">
															<h3 className="text-[0.62rem] sm:text-[0.7rem] font-montserrat text-white/90 leading-snug line-clamp-3 group-hover:text-white">{n.title}</h3>
															<div className="flex items-center justify-between text-[9px] text-white/55 font-mono tracking-wider"><span>{n.source.name}</span><span>{new Date(n.publishedAt).toLocaleDateString()}</span></div>
														</div>
													</Link>
												);
											})}
										</div>
									</div>
								</section>
				</main>
			</div>
			<div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40" style={{background:'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 60%)'}} />
			<div className="pointer-events-none absolute inset-0 opacity-20" style={{background:'linear-gradient(120deg, rgba(255,120,50,0.12), transparent 55%, rgba(255,120,50,0.15))'}} />
		</div>
	);
}