import { Metadata } from "next";
import { ExploreView } from "@/components/explore/explore-view";

export const metadata: Metadata = {
  title: "Explore Mentors | Median",
  description: "Choose a mentor that makes you comfortable and accelerates your growth.",
};

export default function ExplorePage() {
  return <ExploreView />;
}
