import { AnalyzerFlavor } from "./flavors/analyzer-flavor";
import { CustomElementFlavor } from "./flavors/custom-element/custom-element-flavor";
import { JsDocFlavor } from "./flavors/js-doc/js-doc-flavor";
import { JSXFlavor } from "./flavors/jsx/jsx-flavor";
import { LitElementFlavor } from "./flavors/lit-element/lit-element-flavor";
import { WapitisFlavor } from "./flavors/wapitis/wapitis-flavor";

export const VERSION = "<@VERSION@>";

export const DEFAULT_FLAVORS: AnalyzerFlavor[] = [
	new WapitisFlavor(),
	new LitElementFlavor(),
	new CustomElementFlavor(),
	new JsDocFlavor(),
	new JSXFlavor()
];

export const DEFAULT_FEATURE_COLLECTION_CACHE = new WeakMap();
