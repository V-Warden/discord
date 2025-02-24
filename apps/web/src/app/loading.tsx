import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
	return (
		<Section className="md:py-0 sm:py-0 px-0">
			<Section className="z-50 relative bg-transparent">
				<div className="mx-auto flex max-w-container flex-col items-center gap-6 sm:gap-20">
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
					<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
				</div>
			</Section>
		</Section>
	);
};

export default Loading;
