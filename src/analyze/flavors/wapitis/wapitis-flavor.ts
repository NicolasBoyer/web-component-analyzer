import { AnalyzerFlavor } from "../analyzer-flavor";
import { discoverDefinitions } from "./discover-definitions";
import { discoverEvents } from "./discover-events";
import { discoverMembers } from "./discover-members";
import { excludeNode } from "./exclude-node";
import { refineFeature } from "./refine-feature";

/**
 * Flavors for analyzing Wapitis related features: https://nicolasboyer.github.io/wapitis/
 */
export class WapitisFlavor implements AnalyzerFlavor {
	excludeNode = excludeNode;

	discoverDefinitions = discoverDefinitions;

	discoverFeatures = {
		member: discoverMembers,
		event: discoverEvents
	};

	refineFeature = refineFeature;
}
