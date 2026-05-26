"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import { SeasonIcon } from "@/components/icons/SeasonIcons";

interface Product {
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    description?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any> | null;
    variants?: Array<{
        id: string;
        inventory_quantity?: number | null;
        calculated_price?: {
            calculated_amount?: number | null;
            currency_code?: string | null;
        } | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata?: Record<string, any> | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    }> | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const matchesOptionTitle = (key: string, titleLower: string): boolean => {
    const k = key.toLowerCase();
    if (k === "inch") return titleLower === "inch" || titleLower === "diameter" || titleLower === "zoll" || titleLower.includes("diameter size");
    if (k === "size" || k === "rim_size") return titleLower === "rim size" || titleLower === "rimsize" || titleLower === "size" || titleLower === "dimensions" || titleLower === "rim size / dimensions";
    if (k === "color") return titleLower === "color" || titleLower === "finish" || titleLower === "detailed finish" || titleLower === "color/finish" || titleLower === "detailed finishes";
    if (k === "colortype") return titleLower === "colortype" || titleLower === "color type" || titleLower === "color finish" || titleLower === "wheel color type";
    if (k === "bolt_circle") return titleLower === "bolt circle" || titleLower === "bolt_circle" || titleLower === "pcd" || titleLower === "bolt pattern" || titleLower === "hole pattern" || titleLower === "bolt pattern (pcd)";
    if (k === "hub") return titleLower === "hub" || titleLower === "center bore" || titleLower === "hub bore" || titleLower === "hub center bore" || titleLower === "center bore / hub";
    if (k === "width") return titleLower === "width" || titleLower === "rim width" || titleLower === "section width";
    if (k === "height") return titleLower === "height" || titleLower === "aspect ratio";
    if (k === "pattern") return titleLower === "pattern" || titleLower === "spoke pattern" || titleLower === "spoke design";
    if (k === "forwinter") return titleLower === "forwinter" || titleLower === "winter approved" || titleLower === "winter";
    return titleLower === k;
};

// Helper to gather all unique values for an attribute from parent and all variants
const getAttrValues = (product: Product, key: string): string[] => {
    const values = new Set<string>();

    // Check parent product metadata
    const parentMetaVal = product.metadata?.[key];
    if (parentMetaVal != null && typeof parentMetaVal !== "object") {
        values.add(String(parentMetaVal).trim());
    }

    // Check parent product direct properties
    const parentDirectVal = product[key];
    if (parentDirectVal != null && typeof parentDirectVal !== "object") {
        values.add(String(parentDirectVal).trim());
    }

    // Check all variants' metadata and direct properties
    if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((v) => {
            const varMetaVal = v.metadata?.[key];
            if (varMetaVal != null && typeof varMetaVal !== "object") {
                values.add(String(varMetaVal).trim());
            }
            const varDirectVal = v[key];
            if (varDirectVal != null && typeof varDirectVal !== "object") {
                values.add(String(varDirectVal).trim());
            }

            // Match from option values
            const optsList = v.options || v.option_values;
            if (optsList && Array.isArray(optsList)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                optsList.forEach((opt: any) => {
                    const optTitle = opt.option?.title || opt.title || "";
                    const optVal = opt.value;
                    if (optVal != null && optTitle) {
                        const titleLower = String(optTitle).toLowerCase().trim();
                        const valStr = String(optVal).trim();
                        if (matchesOptionTitle(key, titleLower)) {
                            values.add(valStr);
                        }
                    }
                });
            }
        });
    }

    return Array.from(values).filter((v) => v !== "");
};

// Helper to resolve single metadata or direct product properties (fallback for displaying first)
const getAttr = (product: Product, key: string): string => {
    return getAttrValues(product, key)[0] || "";
};

interface TireCatalogProps {
    initialProducts: Product[];
    categoryHandle?: string;
}

export default function TireCatalog({ initialProducts, categoryHandle = "" }: TireCatalogProps) {
    const { t, locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    // Dynamic Selected Filters State
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedWidths, setSelectedWidths] = useState<string[]>([]);
    const [selectedHeights, setSelectedHeights] = useState<string[]>([]);
    const [selectedInches, setSelectedInches] = useState<string[]>([]);
    const [selectedBoltCircles, setSelectedBoltCircles] = useState<string[]>([]);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
    const [selectedColorTypes, setSelectedColorTypes] = useState<string[]>([]);
    const [winterOnly, setWinterOnly] = useState(false);

    // New Tire-specific metadata filters state
    const [selectedLoadIndices, setSelectedLoadIndices] = useState<string[]>([]);
    const [selectedWetGrips, setSelectedWetGrips] = useState<string[]>([]);
    const [selectedNoiseClasses, setSelectedNoiseClasses] = useState<string[]>([]);
    const [selectedFuelEfficiencies, setSelectedFuelEfficiencies] = useState<string[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
    const [msOnly, setMsOnly] = useState(false);
    const [snowConditionOnly, setSnowConditionOnly] = useState(false);
    const [iceGripOnly, setIceGripOnly] = useState(false);

    // Collapsible states for new EU Label sections
    const [fuelCollapsed, setFuelCollapsed] = useState(false);
    const [wetCollapsed, setWetCollapsed] = useState(false);
    const [noiseCollapsed, setNoiseCollapsed] = useState(false);

    // Sub-search states for long checklists
    const [brandSearch, setBrandSearch] = useState("");
    const [modelSearch, setModelSearch] = useState("");
    const [sizeSearch, setSizeSearch] = useState("");
    const [colorTypeSearch, setColorTypeSearch] = useState("");
    const [colorSearch, setColorSearch] = useState("");
    const [patternSearch, setPatternSearch] = useState("");

    // Collapse state for detailed colors
    const [showDetailedColors, setShowDetailedColors] = useState(false);

    const isTires = categoryHandle.toLowerCase().includes("tire");
    const isWheels = categoryHandle.toLowerCase().includes("wheel") || categoryHandle.toLowerCase().includes("rim");

    // Reset all active filters
    const handleClearFilters = () => {
        setSelectedBrands([]);
        setSelectedWidths([]);
        setSelectedHeights([]);
        setSelectedInches([]);
        setSelectedBoltCircles([]);
        setSelectedHubs([]);
        setSelectedColors([]);
        setSelectedSpeeds([]);
        setSelectedSeasons([]);
        setSelectedModels([]);
        setSelectedSizes([]);
        setSelectedPatterns([]);
        setSelectedColorTypes([]);
        setWinterOnly(false);
        setSearchQuery("");
        setBrandSearch("");
        setModelSearch("");
        setSizeSearch("");
        setColorTypeSearch("");
        setColorSearch("");
        setPatternSearch("");

        // Clear new dynamic filters
        setSelectedLoadIndices([]);
        setSelectedWetGrips([]);
        setSelectedNoiseClasses([]);
        setSelectedFuelEfficiencies([]);
        setSelectedVehicles([]);
        setMsOnly(false);
        setSnowConditionOnly(false);
        setIceGripOnly(false);
    };

    // 1. Gather all unique specification values from the products dynamically
    const uniqueSpecs = useMemo(() => {
        const brands = new Set<string>();
        const widths = new Set<string>();
        const heights = new Set<string>();
        const inches = new Set<string>();
        const boltCircles = new Set<string>();
        const hubs = new Set<string>();
        const colors = new Set<string>();
        const speeds = new Set<string>();
        const seasons = new Set<string>();
        const colorTypes = new Set<string>();
        const models = new Set<string>();
        const sizes = new Set<string>();
        const patterns = new Set<string>();
        
        // New specification sets
        const loadIndices = new Set<string>();
        const wetGrips = new Set<string>();
        const noiseClasses = new Set<string>();
        const fuelEfficiencies = new Set<string>();
        const vehicles = new Set<string>();

        initialProducts.forEach((p) => {
            getAttrValues(p, "brand").forEach((val) => brands.add(val));
            getAttrValues(p, "width").forEach((val) => widths.add(val));
            getAttrValues(p, "height").forEach((val) => heights.add(val));
            getAttrValues(p, "inch").forEach((val) => inches.add(val));
            getAttrValues(p, "bolt_circle").forEach((val) => boltCircles.add(val));
            getAttrValues(p, "hub").forEach((val) => hubs.add(val));
            getAttrValues(p, "color").forEach((val) => colors.add(val));
            getAttrValues(p, "speed_rating").forEach((val) => speeds.add(val));
            getAttrValues(p, "season").forEach((val) => seasons.add(val));
            getAttrValues(p, "colortype").forEach((val) => colorTypes.add(val));
            getAttrValues(p, "model").forEach((val) => models.add(val));
            getAttrValues(p, "size").forEach((val) => sizes.add(val));
            getAttrValues(p, "pattern").forEach((val) => patterns.add(val));
            
            // Collect new fields
            getAttrValues(p, "load_index").forEach((val) => loadIndices.add(val));
            getAttrValues(p, "wet_grip").forEach((val) => wetGrips.add(val));
            getAttrValues(p, "noise_class").forEach((val) => noiseClasses.add(val));
            getAttrValues(p, "fuel_efficiency").forEach((val) => fuelEfficiencies.add(val));
            getAttrValues(p, "vehicle").forEach((val) => vehicles.add(val));
        });

        return {
            brands: Array.from(brands).sort(),
            widths: Array.from(widths).sort((a, b) => parseFloat(a) - parseFloat(b)),
            heights: Array.from(heights).sort((a, b) => parseFloat(a) - parseFloat(b)),
            inches: Array.from(inches).sort((a, b) => parseFloat(a) - parseFloat(b)),
            boltCircles: Array.from(boltCircles).sort(),
            hubs: Array.from(hubs).sort((a, b) => parseFloat(a) - parseFloat(b)),
            colors: Array.from(colors).sort(),
            speeds: Array.from(speeds).sort(),
            seasons: Array.from(seasons).sort(),
            colorTypes: Array.from(colorTypes).sort(),
            models: Array.from(models).sort(),
            sizes: Array.from(sizes).sort(),
            patterns: Array.from(patterns).sort(),
            
            // Return new sorted unique values
            loadIndices: Array.from(loadIndices).sort((a, b) => parseFloat(a) - parseFloat(b)),
            wetGrips: Array.from(wetGrips).sort(),
            noiseClasses: Array.from(noiseClasses).sort(),
            fuelEfficiencies: Array.from(fuelEfficiencies).sort(),
            vehicles: Array.from(vehicles).sort(),
        };
    }, [initialProducts]);

    // 2. Perform dynamic client-side filtering
    const filteredProducts = useMemo(() => {
        return initialProducts.filter((p) => {
            // Brand filter
            if (selectedBrands.length > 0 && !getAttrValues(p, "brand").some(v => selectedBrands.includes(v))) return false;
            // Model filter
            if (selectedModels.length > 0 && !getAttrValues(p, "model").some(v => selectedModels.includes(v))) return false;
            // Size filter
            if (selectedSizes.length > 0 && !getAttrValues(p, "size").some(v => selectedSizes.includes(v))) return false;
            // Inch/Diameter filter
            if (selectedInches.length > 0 && !getAttrValues(p, "inch").some(v => selectedInches.includes(v))) return false;
            // Bolt Circle filter
            if (selectedBoltCircles.length > 0 && !getAttrValues(p, "bolt_circle").some(v => selectedBoltCircles.includes(v))) return false;
            // Hub bore filter
            if (selectedHubs.length > 0 && !getAttrValues(p, "hub").some(v => selectedHubs.includes(v))) return false;
            // ColorType filter
            if (selectedColorTypes.length > 0 && !getAttrValues(p, "colortype").some(v => selectedColorTypes.includes(v))) return false;
            // Color filter
            if (selectedColors.length > 0 && !getAttrValues(p, "color").some(v => selectedColors.includes(v))) return false;
            // Pattern filter
            if (selectedPatterns.length > 0 && !getAttrValues(p, "pattern").some(v => selectedPatterns.includes(v))) return false;

            // Winter compatible filter
            if (winterOnly) {
                const isWinterValues = getAttrValues(p, "forwinter").map(v => v.toLowerCase());
                const hasWinter = isWinterValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.forwinter === true || p.forwinter === true ||
                    (p.variants && p.variants.some(v => v.metadata?.forwinter === true || v.forwinter === true));
                if (!hasWinter) return false;
            }

            // Tires filters
            if (selectedWidths.length > 0 && !getAttrValues(p, "width").some(v => selectedWidths.includes(v))) return false;
            if (selectedHeights.length > 0 && !getAttrValues(p, "height").some(v => selectedHeights.includes(v))) return false;
            if (selectedSpeeds.length > 0 && !getAttrValues(p, "speed_rating").some(v => selectedSpeeds.includes(v))) return false;
            if (selectedSeasons.length > 0) {
                const prodSeasons = getAttrValues(p, "season");
                const hasMatch = prodSeasons.some((s) => {
                    const sLower = s.toLowerCase();
                    return selectedSeasons.some((sel) => {
                        if (sel === "Sommer") return sLower === "summer" || sLower === "sommer";
                        if (sel === "Winter") return sLower === "winter";
                        if (sel === "Allwetter") return sLower.includes("all") || sLower === "allwetter";
                        return false;
                    });
                });
                if (!hasMatch) return false;
            }

            // Load index filter
            if (selectedLoadIndices.length > 0 && !getAttrValues(p, "load_index").some(v => selectedLoadIndices.includes(v))) return false;
            
            // Wet grip filter (cumulative: selected and above)
            if (selectedWetGrips.length > 0) {
                const prodVals = getAttrValues(p, "wet_grip").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C", "D", "E"];
                    const worstSelectedIndex = Math.max(...selectedWetGrips.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }

            // Noise class filter (cumulative: selected and above)
            if (selectedNoiseClasses.length > 0) {
                const prodVals = getAttrValues(p, "noise_class").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C"];
                    const worstSelectedIndex = Math.max(...selectedNoiseClasses.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }

            // Fuel efficiency filter (cumulative: selected and above)
            if (selectedFuelEfficiencies.length > 0) {
                const prodVals = getAttrValues(p, "fuel_efficiency").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C", "D", "E"];
                    const worstSelectedIndex = Math.max(...selectedFuelEfficiencies.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }

            // Vehicle filter
            if (selectedVehicles.length > 0 && !getAttrValues(p, "vehicle").some(v => selectedVehicles.includes(v))) return false;

            // MS Rating toggle
            if (msOnly) {
                const isMsValues = getAttrValues(p, "m_s").map(v => v.toLowerCase());
                const hasMs = isMsValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.m_s === true || p.m_s === true ||
                    (p.variants && p.variants.some(v => v.metadata?.m_s === true || v.m_s === true));
                if (!hasMs) return false;
            }

            // Snow condition toggle
            if (snowConditionOnly) {
                const isSnowValues = getAttrValues(p, "snow_condition").map(v => v.toLowerCase());
                const hasSnow = isSnowValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.snow_condition === true || p.snow_condition === true ||
                    (p.variants && p.variants.some(v => v.metadata?.snow_condition === true || v.snow_condition === true));
                if (!hasSnow) return false;
            }

            // Ice grip toggle
            if (iceGripOnly) {
                const isIceValues = getAttrValues(p, "ice_grip").map(v => v.toLowerCase());
                const hasIce = isIceValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.ice_grip === true || p.ice_grip === true ||
                    (p.variants && p.variants.some(v => v.metadata?.ice_grip === true || v.ice_grip === true));
                if (!hasIce) return false;
            }

            // Text search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const title = p.title.toLowerCase();
                const brandVals = getAttrValues(p, "brand").map(v => v.toLowerCase());
                const modelVals = getAttrValues(p, "model").map(v => v.toLowerCase());
                const sizeVals = getAttrValues(p, "size").map(v => v.toLowerCase());

                const matchesBrand = brandVals.some(v => v.includes(query));
                const matchesModel = modelVals.some(v => v.includes(query));
                const matchesSize = sizeVals.some(v => v.includes(query));

                if (!title.includes(query) && !matchesBrand && !matchesModel && !matchesSize) {
                    return false;
                }
            }

            return true;
        });
    }, [
        initialProducts,
        searchQuery,
        selectedBrands,
        selectedModels,
        selectedSizes,
        selectedInches,
        selectedBoltCircles,
        selectedHubs,
        selectedColorTypes,
        selectedColors,
        selectedPatterns,
        winterOnly,
        selectedWidths,
        selectedHeights,
        selectedSpeeds,
        selectedSeasons,
        selectedLoadIndices,
        selectedWetGrips,
        selectedNoiseClasses,
        selectedFuelEfficiencies,
        selectedVehicles,
        msOnly,
        snowConditionOnly,
        iceGripOnly,
    ]);

    // 3. Compute dynamic counts for each category option
    const specCounts = useMemo(() => {
        const counts: Record<string, Record<string, number>> = {
            brands: {},
            colorTypes: {},
            colors: {},
            boltCircles: {},
            hubs: {},
            models: {},
            sizes: {},
            patterns: {},
            inches: {},
            widths: {},
            heights: {},
            speeds: {},
            seasons: {},
            // New dynamic count maps
            loadIndices: {},
            wetGrips: {},
            noiseClasses: {},
            fuelEfficiencies: {},
            vehicles: {},
        };

        // Initialize counts to 0 for all unique spec options
        uniqueSpecs.brands.forEach((x) => (counts.brands[x] = 0));
        uniqueSpecs.colorTypes.forEach((x) => (counts.colorTypes[x] = 0));
        uniqueSpecs.colors.forEach((x) => (counts.colors[x] = 0));
        uniqueSpecs.boltCircles.forEach((x) => (counts.boltCircles[x] = 0));
        uniqueSpecs.hubs.forEach((x) => (counts.hubs[x] = 0));
        uniqueSpecs.models.forEach((x) => (counts.models[x] = 0));
        uniqueSpecs.sizes.forEach((x) => (counts.sizes[x] = 0));
        uniqueSpecs.patterns.forEach((x) => (counts.patterns[x] = 0));
        uniqueSpecs.inches.forEach((x) => (counts.inches[x] = 0));
        uniqueSpecs.widths.forEach((x) => (counts.widths[x] = 0));
        uniqueSpecs.heights.forEach((x) => (counts.heights[x] = 0));
        uniqueSpecs.speeds.forEach((x) => (counts.speeds[x] = 0));
        uniqueSpecs.seasons.forEach((x) => (counts.seasons[x] = 0));
        // New count maps initializes
        uniqueSpecs.loadIndices.forEach((x) => (counts.loadIndices[x] = 0));
        uniqueSpecs.wetGrips.forEach((x) => (counts.wetGrips[x] = 0));
        uniqueSpecs.noiseClasses.forEach((x) => (counts.noiseClasses[x] = 0));
        uniqueSpecs.fuelEfficiencies.forEach((x) => (counts.fuelEfficiencies[x] = 0));
        uniqueSpecs.vehicles.forEach((x) => (counts.vehicles[x] = 0));

        const matchesFilterExcept = (p: Product, skipCategory: string) => {
            // Brand
            if (skipCategory !== "brand" && selectedBrands.length > 0 && !getAttrValues(p, "brand").some(v => selectedBrands.includes(v))) return false;
            // Model
            if (skipCategory !== "model" && selectedModels.length > 0 && !getAttrValues(p, "model").some(v => selectedModels.includes(v))) return false;
            // Size
            if (skipCategory !== "size" && selectedSizes.length > 0 && !getAttrValues(p, "size").some(v => selectedSizes.includes(v))) return false;
            // Inch
            if (skipCategory !== "inch" && selectedInches.length > 0 && !getAttrValues(p, "inch").some(v => selectedInches.includes(v))) return false;
            // Bolt Circle
            if (skipCategory !== "bolt_circle" && selectedBoltCircles.length > 0 && !getAttrValues(p, "bolt_circle").some(v => selectedBoltCircles.includes(v))) return false;
            // Hub
            if (skipCategory !== "hub" && selectedHubs.length > 0 && !getAttrValues(p, "hub").some(v => selectedHubs.includes(v))) return false;
            // ColorType
            if (skipCategory !== "colortype" && selectedColorTypes.length > 0 && !getAttrValues(p, "colortype").some(v => selectedColorTypes.includes(v))) return false;
            // Color
            if (skipCategory !== "color" && selectedColors.length > 0 && !getAttrValues(p, "color").some(v => selectedColors.includes(v))) return false;
            // Pattern
            if (skipCategory !== "pattern" && selectedPatterns.length > 0 && !getAttrValues(p, "pattern").some(v => selectedPatterns.includes(v))) return false;
            // Winter
            if (skipCategory !== "forwinter" && winterOnly) {
                const isWinterValues = getAttrValues(p, "forwinter").map(v => v.toLowerCase());
                const hasWinter = isWinterValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.forwinter === true || p.forwinter === true ||
                    (p.variants && p.variants.some(v => v.metadata?.forwinter === true || v.forwinter === true));
                if (!hasWinter) return false;
            }

            // Tires:
            if (skipCategory !== "width" && selectedWidths.length > 0 && !getAttrValues(p, "width").some(v => selectedWidths.includes(v))) return false;
            if (skipCategory !== "height" && selectedHeights.length > 0 && !getAttrValues(p, "height").some(v => selectedHeights.includes(v))) return false;
            if (skipCategory !== "speed_rating" && selectedSpeeds.length > 0 && !getAttrValues(p, "speed_rating").some(v => selectedSpeeds.includes(v))) return false;
            if (skipCategory !== "season" && selectedSeasons.length > 0) {
                const prodSeasons = getAttrValues(p, "season");
                const hasMatch = prodSeasons.some((s) => {
                    const sLower = s.toLowerCase();
                    return selectedSeasons.some((sel) => {
                        if (sel === "Sommer") return sLower === "summer" || sLower === "sommer";
                        if (sel === "Winter") return sLower === "winter";
                        if (sel === "Allwetter") return sLower.includes("all") || sLower === "allwetter";
                        return false;
                    });
                });
                if (!hasMatch) return false;
            }

            // New dynamic count evaluators
            if (skipCategory !== "load_index" && selectedLoadIndices.length > 0 && !getAttrValues(p, "load_index").some(v => selectedLoadIndices.includes(v))) return false;
            // Wet grip dynamic count evaluator (cumulative)
            if (skipCategory !== "wet_grip" && selectedWetGrips.length > 0) {
                const prodVals = getAttrValues(p, "wet_grip").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C", "D", "E"];
                    const worstSelectedIndex = Math.max(...selectedWetGrips.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }

            // Noise class dynamic count evaluator (cumulative)
            if (skipCategory !== "noise_class" && selectedNoiseClasses.length > 0) {
                const prodVals = getAttrValues(p, "noise_class").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C"];
                    const worstSelectedIndex = Math.max(...selectedNoiseClasses.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }

            // Fuel efficiency dynamic count evaluator (cumulative)
            if (skipCategory !== "fuel_efficiency" && selectedFuelEfficiencies.length > 0) {
                const prodVals = getAttrValues(p, "fuel_efficiency").map(v => v.toUpperCase().trim());
                if (prodVals.length > 0) {
                    const grades = ["A", "B", "C", "D", "E"];
                    const worstSelectedIndex = Math.max(...selectedFuelEfficiencies.map(g => grades.indexOf(g.toUpperCase().trim())));
                    const hasMatch = prodVals.some(v => {
                        const idx = grades.indexOf(v);
                        return idx !== -1 && idx <= worstSelectedIndex;
                    });
                    if (!hasMatch) return false;
                } else {
                    return false;
                }
            }
            if (skipCategory !== "vehicle" && selectedVehicles.length > 0 && !getAttrValues(p, "vehicle").some(v => selectedVehicles.includes(v))) return false;

            if (skipCategory !== "m_s" && msOnly) {
                const isMsValues = getAttrValues(p, "m_s").map(v => v.toLowerCase());
                const hasMs = isMsValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.m_s === true || p.m_s === true ||
                    (p.variants && p.variants.some(v => v.metadata?.m_s === true || v.m_s === true));
                if (!hasMs) return false;
            }

            if (skipCategory !== "snow_condition" && snowConditionOnly) {
                const isSnowValues = getAttrValues(p, "snow_condition").map(v => v.toLowerCase());
                const hasSnow = isSnowValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.snow_condition === true || p.snow_condition === true ||
                    (p.variants && p.variants.some(v => v.metadata?.snow_condition === true || v.snow_condition === true));
                if (!hasSnow) return false;
            }

            if (skipCategory !== "ice_grip" && iceGripOnly) {
                const isIceValues = getAttrValues(p, "ice_grip").map(v => v.toLowerCase());
                const hasIce = isIceValues.some(v => v === "true" || v === "1" || v === "yes") ||
                    p.metadata?.ice_grip === true || p.ice_grip === true ||
                    (p.variants && p.variants.some(v => v.metadata?.ice_grip === true || v.ice_grip === true));
                if (!hasIce) return false;
            }

            // Search Query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const title = p.title.toLowerCase();
                const brandVals = getAttrValues(p, "brand").map(v => v.toLowerCase());
                const modelVals = getAttrValues(p, "model").map(v => v.toLowerCase());
                const sizeVals = getAttrValues(p, "size").map(v => v.toLowerCase());

                const matchesBrand = brandVals.some(v => v.includes(query));
                const matchesModel = modelVals.some(v => v.includes(query));
                const matchesSize = sizeVals.some(v => v.includes(query));

                if (!title.includes(query) && !matchesBrand && !matchesModel && !matchesSize) {
                    return false;
                }
            }

            return true;
        };

        initialProducts.forEach((p) => {
            if (matchesFilterExcept(p, "brand")) {
                getAttrValues(p, "brand").forEach((val) => {
                    if (val) counts.brands[val] = (counts.brands[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "model")) {
                getAttrValues(p, "model").forEach((val) => {
                    if (val) counts.models[val] = (counts.models[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "size")) {
                getAttrValues(p, "size").forEach((val) => {
                    if (val) counts.sizes[val] = (counts.sizes[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "colortype")) {
                getAttrValues(p, "colortype").forEach((val) => {
                    if (val) counts.colorTypes[val] = (counts.colorTypes[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "color")) {
                getAttrValues(p, "color").forEach((val) => {
                    if (val) counts.colors[val] = (counts.colors[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "bolt_circle")) {
                getAttrValues(p, "bolt_circle").forEach((val) => {
                    if (val) counts.boltCircles[val] = (counts.boltCircles[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "hub")) {
                getAttrValues(p, "hub").forEach((val) => {
                    if (val) counts.hubs[val] = (counts.hubs[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "pattern")) {
                getAttrValues(p, "pattern").forEach((val) => {
                    if (val) counts.patterns[val] = (counts.patterns[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "inch")) {
                getAttrValues(p, "inch").forEach((val) => {
                    if (val) counts.inches[val] = (counts.inches[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "width")) {
                getAttrValues(p, "width").forEach((val) => {
                    if (val) counts.widths[val] = (counts.widths[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "height")) {
                getAttrValues(p, "height").forEach((val) => {
                    if (val) counts.heights[val] = (counts.heights[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "speed_rating")) {
                getAttrValues(p, "speed_rating").forEach((val) => {
                    if (val) counts.speeds[val] = (counts.speeds[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "season")) {
                getAttrValues(p, "season").forEach((val) => {
                    if (val) counts.seasons[val] = (counts.seasons[val] || 0) + 1;
                });
            }
            // Count new dynamic values
            if (matchesFilterExcept(p, "load_index")) {
                getAttrValues(p, "load_index").forEach((val) => {
                    if (val) counts.loadIndices[val] = (counts.loadIndices[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "wet_grip")) {
                getAttrValues(p, "wet_grip").forEach((val) => {
                    if (val) counts.wetGrips[val] = (counts.wetGrips[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "noise_class")) {
                getAttrValues(p, "noise_class").forEach((val) => {
                    if (val) counts.noiseClasses[val] = (counts.noiseClasses[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "fuel_efficiency")) {
                getAttrValues(p, "fuel_efficiency").forEach((val) => {
                    if (val) counts.fuelEfficiencies[val] = (counts.fuelEfficiencies[val] || 0) + 1;
                });
            }
            if (matchesFilterExcept(p, "vehicle")) {
                getAttrValues(p, "vehicle").forEach((val) => {
                    if (val) counts.vehicles[val] = (counts.vehicles[val] || 0) + 1;
                });
            }
        });

        return counts;
    }, [
        initialProducts,
        searchQuery,
        selectedBrands,
        selectedModels,
        selectedSizes,
        selectedInches,
        selectedBoltCircles,
        selectedHubs,
        selectedColorTypes,
        selectedColors,
        selectedPatterns,
        winterOnly,
        selectedWidths,
        selectedHeights,
        selectedSpeeds,
        selectedSeasons,
        uniqueSpecs,
    ]);

    const getAggregatedSeasonCount = (target: "Allwetter" | "Sommer" | "Winter"): number => {
        let count = 0;
        Object.keys(specCounts.seasons).forEach((key) => {
            const kLower = key.toLowerCase();
            if (target === "Sommer" && (kLower === "summer" || kLower === "sommer")) {
                count += specCounts.seasons[key];
            } else if (target === "Winter" && kLower === "winter") {
                count += specCounts.seasons[key];
            } else if (target === "Allwetter" && (kLower.includes("all") || kLower === "allwetter")) {
                count += specCounts.seasons[key];
            }
        });
        return count;
    };

    const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
        if (list.includes(val)) {
            setList(list.filter((x) => x !== val));
        } else {
            setList([...list, val]);
        }
    };

    const formatPrice = (calculatedPrice: { calculated_amount?: number | null; currency_code?: string | null }) => {
        const amount = calculatedPrice.calculated_amount;
        const currency = calculatedPrice.currency_code || "EUR";
        if (amount == null) return "";
        return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const getStockQty = (p: Product): number => {
        const variantQty = p.variants?.[0]?.inventory_quantity;
        if (typeof variantQty === "number") {
            return variantQty;
        }

        const metaQty = p.metadata?.quantity || p.metadata?.inventory_quantity;
        if (metaQty !== undefined && metaQty !== null) {
            const q = Number(metaQty);
            if (!isNaN(q)) return q;
        }

        let hash = 0;
        const str = p.id || p.handle || "";
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const options = [4, 8, 12, 16, 20, 24];
        const index = Math.abs(hash) % options.length;
        return options[index];
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 1. Sidebar Spec Filters */}
            <div className="bg-surface-card border border-surface-border p-6 tech-grid tech-border">
                <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
                    <h2 className="font-display text-sm font-bold tracking-wider text-foreground uppercase">
                        {t("filter.title", "SPECIFICATION FILTERS")}
                    </h2>
                    {(selectedBrands.length > 0 ||
                        selectedWidths.length > 0 ||
                        selectedHeights.length > 0 ||
                        selectedInches.length > 0 ||
                        selectedBoltCircles.length > 0 ||
                        selectedHubs.length > 0 ||
                        selectedColors.length > 0 ||
                        selectedSpeeds.length > 0 ||
                        selectedSeasons.length > 0 ||
                        selectedModels.length > 0 ||
                        selectedSizes.length > 0 ||
                        selectedPatterns.length > 0 ||
                        selectedColorTypes.length > 0 ||
                        winterOnly ||
                        searchQuery) && (
                            <button
                                onClick={handleClearFilters}
                                className="text-[10px] font-mono text-primary hover:text-white uppercase tracking-widest cursor-pointer underline transition-colors"
                            >
                                {t("filter.clear", "Reset")}
                            </button>
                        )}
                </div>

                {/* Global Keyword Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={t("filter.searchKeywords", "Search keywords (e.g. AEZ, 265)...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-surface-border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-600 rounded-none transition-colors"
                    />
                </div>

                <div className="space-y-6">
                    {/* A. GLOBAL / WHEEL SPECIFIC: Winter Approved Slide Toggle */}
                    <div className="border border-surface-border bg-surface-deep p-3 rounded-none flex items-center justify-between transition-all hover:border-gray-800">
                        <span className="font-mono text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
                            ❄️ {t("spec.winterApproved", "Winter Approved")}
                        </span>
                        <button
                            onClick={() => setWinterOnly(!winterOnly)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-none border border-surface-border transition-colors duration-200 ease-in-out focus:outline-none ${winterOnly ? "bg-primary" : "bg-background"
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform bg-foreground transition duration-200 ease-in-out ${winterOnly ? "translate-x-5 bg-white" : "translate-x-0 bg-gray-600"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* B. Manufacturer (Brand) Filter - Searchable checklist with Dynamic Counts */}
                    {uniqueSpecs.brands.length > 0 && (
                        <div>
                            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                {t("spec.brand", "Manufacturer")}
                            </h3>
                            <input
                                type="text"
                                placeholder={t("filter.searchBrands", "Search brands...")}
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                            />
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {uniqueSpecs.brands
                                    .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
                                    .map((brand) => {
                                        const count = specCounts.brands[brand] || 0;
                                        if (count === 0) return null;
                                        return (
                                            <label
                                                key={brand}
                                                className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedBrands.includes(brand) ? "text-gray-600" : "text-gray-400"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                                                    className="accent-primary rounded-none cursor-pointer"
                                                />
                                                <span className="truncate">{brand}</span>
                                                <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                            </label>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* C. TIRES SPECIFIC FILTERS */}
                    {isTires && (
                        <>
                            {/* Season Filter */}
                            {/* Season Filter */}
                            <div>
                                <h3 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider mb-3.5 flex items-center justify-between">
                                    <span>{t("spec.season", "Tire Season")}</span>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        {
                                            name: "Allwetter" as const,
                                            label: t("season.allweather", "Allwetter"),
                                        },
                                        {
                                            name: "Sommer" as const,
                                            label: t("season.sommer", "Sommer"),
                                        },
                                        {
                                            name: "Winter" as const,
                                            label: t("season.winter", "Winter"),
                                        }
                                    ].map((opt) => {
                                        const count = getAggregatedSeasonCount(opt.name);
                                        const isSelected = selectedSeasons.includes(opt.name);
                                        const isDisabled = count === 0;

                                        return (
                                            <button
                                                key={opt.name}
                                                disabled={isDisabled}
                                                onClick={() => toggleFilter(selectedSeasons, setSelectedSeasons, opt.name)}
                                                className={`flex flex-col items-center justify-center gap-3.5 p-4 border transition-all duration-300 rounded-xl cursor-pointer w-full aspect-square relative select-none ${isDisabled
                                                    ? "opacity-20 border-surface-border/40 text-gray-700 bg-surface-deep/30 cursor-not-allowed pointer-events-none"
                                                    : isSelected
                                                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,69,0,0.15)]"
                                                        : "border-surface-border bg-surface-card text-gray-400 hover:border-gray-500 hover:text-white hover:shadow-sm"
                                                    }`}
                                            >
                                                <SeasonIcon season={opt.name} size={40} className="stroke-current" />
                                                <span className="font-sans text-xs font-bold tracking-tight">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Width, Height, Inch Dropdowns Side-by-Side */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Width Column */}
                                <div>
                                    <label htmlFor="tire-width-select" className="block font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        {t("spec.width", "Width")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="tire-width-select"
                                            value={selectedWidths[0] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedWidths(val ? [val] : []);
                                            }}
                                            className="w-full bg-surface-deep border border-surface-border text-foreground font-mono text-xs px-2.5 py-2 rounded-md focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 hover:border-gray-500 transition-colors"
                                        >
                                            <option value="">{t("filter.all", "All")}</option>
                                            {uniqueSpecs.widths.map((w) => (
                                                <option key={w} value={w}>
                                                    {w}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Height Column */}
                                <div>
                                    <label htmlFor="tire-height-select" className="block font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        {t("spec.height", "Height")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="tire-height-select"
                                            value={selectedHeights[0] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedHeights(val ? [val] : []);
                                            }}
                                            className="w-full bg-surface-deep border border-surface-border text-foreground font-mono text-xs px-2.5 py-2 rounded-md focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 hover:border-gray-500 transition-colors"
                                        >
                                            <option value="">{t("filter.all", "All")}</option>
                                            {uniqueSpecs.heights.map((h) => (
                                                <option key={h} value={h}>
                                                    {h}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Inch Column */}
                                <div>
                                    <label htmlFor="tire-inch-select" className="block font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        {t("spec.inch", "Inch")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="tire-inch-select"
                                            value={selectedInches[0] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedInches(val ? [val] : []);
                                            }}
                                            className="w-full bg-surface-deep border border-surface-border text-foreground font-mono text-xs px-2.5 py-2 rounded-md focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 hover:border-gray-500 transition-colors"
                                        >
                                            <option value="">{t("filter.all", "All")}</option>
                                            {uniqueSpecs.inches.map((inch) => (
                                                <option key={inch} value={inch}>
                                                    {inch}&quot;
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Speed Rating Filter */}
                            {uniqueSpecs.speeds.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.speedIndex", "Speed Index")}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {uniqueSpecs.speeds.map((s) => {
                                            const count = specCounts.speeds[s] || 0;
                                            if (count === 0) return null;
                                            return (
                                                <label
                                                    key={s}
                                                    className={`flex items-center gap-1 font-mono text-xs cursor-pointer hover:text-foreground transition-colors ${count === 0 && !selectedSpeeds.includes(s) ? "text-gray-600" : "text-gray-400"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSpeeds.includes(s)}
                                                        onChange={() => toggleFilter(selectedSpeeds, setSelectedSpeeds, s)}
                                                        className="accent-primary rounded-none cursor-pointer"
                                                    />
                                                    <span>{s} ({count})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* New Load Index Filter */}
                            {uniqueSpecs.loadIndices.length > 0 && (
                                <div>
                                    <label htmlFor="tire-load-index-select" className="block font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        {t("spec.loadIndex", "Load Index")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="tire-load-index-select"
                                            value={selectedLoadIndices[0] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedLoadIndices(val ? [val] : []);
                                            }}
                                            className="w-full bg-surface-deep border border-surface-border text-foreground font-mono text-xs px-2.5 py-2 rounded-md focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 hover:border-gray-500 transition-colors"
                                        >
                                            <option value="">{t("filter.all", "All")}</option>
                                            {uniqueSpecs.loadIndices.map((li) => {
                                                const count = specCounts.loadIndices[li] || 0;
                                                if (count === 0) return null;
                                                return (
                                                    <option key={li} value={li}>
                                                        {li} ({count})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* New Vehicle Application Filter */}
                            {uniqueSpecs.vehicles.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.vehicle", "Vehicle Application")}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueSpecs.vehicles.map((v) => {
                                            const count = specCounts.vehicles[v] || 0;
                                            if (count === 0) return null;
                                            const isSelected = selectedVehicles.includes(v);
                                            return (
                                                <button
                                                    key={v}
                                                    onClick={() => toggleFilter(selectedVehicles, setSelectedVehicles, v)}
                                                    className={`px-3 py-1.5 font-mono text-xs border rounded-none tracking-wider font-bold transition-all cursor-pointer select-none ${
                                                        isSelected
                                                            ? "border-primary bg-primary/10 text-white shadow-[0_0_10px_rgba(255,69,0,0.1)]"
                                                            : "border-surface-border bg-background text-gray-400 hover:border-gray-500 hover:text-white"
                                                    }`}
                                                >
                                                    {v} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* New Performance & Certifications Markings */}
                            <div className="border border-surface-border bg-surface-deep/40 p-4 space-y-4 rounded-md">
                                <h4 className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-surface-border/50 pb-1.5">
                                    {t("spec.markings", "Markings & Certifications")}
                                </h4>

                                {/* M+S Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                                        🏔️ {t("spec.msRating", "M+S Rated")}
                                    </span>
                                    <button
                                        onClick={() => setMsOnly(!msOnly)}
                                        className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer rounded-none border border-surface-border transition-colors duration-200 ease-in-out focus:outline-none ${
                                            msOnly ? "bg-primary" : "bg-background"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-3 w-3 transform bg-foreground transition duration-200 ease-in-out ${
                                                msOnly ? "translate-x-4 bg-white" : "translate-x-0 bg-gray-600"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Snow Condition Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                                        🏔️❄️ {t("spec.snowCondition", "Snow Approved (3PMSF)")}
                                    </span>
                                    <button
                                        onClick={() => setSnowConditionOnly(!snowConditionOnly)}
                                        className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer rounded-none border border-surface-border transition-colors duration-200 ease-in-out focus:outline-none ${
                                            snowConditionOnly ? "bg-primary" : "bg-background"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-3 w-3 transform bg-foreground transition duration-200 ease-in-out ${
                                                snowConditionOnly ? "translate-x-4 bg-white" : "translate-x-0 bg-gray-600"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Ice Grip Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                                        💎 {t("spec.iceGrip", "Ice Grip Approved")}
                                    </span>
                                    <button
                                        onClick={() => setIceGripOnly(!iceGripOnly)}
                                        className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer rounded-none border border-surface-border transition-colors duration-200 ease-in-out focus:outline-none ${
                                            iceGripOnly ? "bg-primary" : "bg-background"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-3 w-3 transform bg-foreground transition duration-200 ease-in-out ${
                                                iceGripOnly ? "translate-x-4 bg-white" : "translate-x-0 bg-gray-600"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Fuel Efficiency Section */}
                            <div className="border-t border-surface-border/50 pt-5 mt-5">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-sans text-sm font-bold text-foreground uppercase tracking-wide">
                                            {t("spec.fuelEfficiencyTitle", "Fuel efficiency")}
                                        </span>
                                        {/* info circle icon */}
                                        <div className="w-4 h-4 rounded-full bg-surface-border/40 hover:bg-surface-border/80 flex items-center justify-center text-[10px] text-gray-400 cursor-pointer font-bold select-none" title="Tire rolling resistance affects fuel consumption. Class A is the most efficient.">
                                            ?
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFuelCollapsed(!fuelCollapsed)}
                                        className="text-gray-500 hover:text-foreground cursor-pointer text-xs font-mono transition-transform duration-200 select-none"
                                    >
                                        {fuelCollapsed ? "▲" : "▼"}
                                    </button>
                                </div>
                                
                                {!fuelCollapsed && (
                                    <div className="space-y-3.5 mt-4.5 pl-1">
                                        {[
                                            { grade: "A", bgColor: "#1e7b34", textColor: "#ffffff" },
                                            { grade: "B", bgColor: "#8cb900", textColor: "#ffffff" },
                                            { grade: "C", bgColor: "#ffea00", textColor: "#000000" },
                                            { grade: "D", bgColor: "#f3a000", textColor: "#ffffff" },
                                            { grade: "E", bgColor: "#e30613", textColor: "#ffffff" },
                                        ].map((cfg) => {
                                            const count = specCounts.fuelEfficiencies[cfg.grade] || 0;
                                            const isChecked = selectedFuelEfficiencies.includes(cfg.grade);
                                            return (
                                                <label
                                                    key={cfg.grade}
                                                    className="flex items-center gap-3 font-mono text-sm cursor-pointer hover:text-foreground group w-full transition-colors select-none text-gray-400"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedFuelEfficiencies, setSelectedFuelEfficiencies, cfg.grade)}
                                                        className="accent-primary rounded-none cursor-pointer w-4 h-4 bg-background border border-surface-border"
                                                    />
                                                    <div
                                                        className="px-3 py-0.5 text-[11px] font-black font-mono text-center flex items-center justify-center min-w-[28px] relative select-none"
                                                        style={{
                                                            backgroundColor: cfg.bgColor,
                                                            color: cfg.textColor,
                                                            clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
                                                            paddingRight: '8px',
                                                            fontWeight: '900',
                                                        }}
                                                    >
                                                        {cfg.grade}
                                                    </div>
                                                    <span className="text-[12px] text-gray-500 font-mono">
                                                        ({count})
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Wet Grip Section */}
                            <div className="border-t border-surface-border/50 pt-5 mt-5">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-sans text-sm font-bold text-foreground uppercase tracking-wide">
                                            {t("spec.wetGripTitle", "Wet grip")}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-surface-border/40 hover:bg-surface-border/80 flex items-center justify-center text-[10px] text-gray-400 cursor-pointer font-bold select-none" title="Wet grip ratings indicate braking performance on wet roads. Class A is the safest.">
                                            ?
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setWetCollapsed(!wetCollapsed)}
                                        className="text-gray-500 hover:text-foreground cursor-pointer text-xs font-mono transition-transform duration-200 select-none"
                                    >
                                        {wetCollapsed ? "▲" : "▼"}
                                    </button>
                                </div>
                                
                                {!wetCollapsed && (
                                    <div className="space-y-3.5 mt-4.5 pl-1">
                                        {[
                                            { grade: "A", bgColor: "#2f589b", textColor: "#ffffff" },
                                            { grade: "B", bgColor: "#3b7bc4", textColor: "#ffffff" },
                                            { grade: "C", bgColor: "#5a9bd4", textColor: "#ffffff" },
                                            { grade: "D", bgColor: "#7ec1e9", textColor: "#ffffff" },
                                            { grade: "E", bgColor: "#a6e1fa", textColor: "#000000" },
                                        ].map((cfg) => {
                                            const count = specCounts.wetGrips[cfg.grade] || 0;
                                            const isChecked = selectedWetGrips.includes(cfg.grade);
                                            return (
                                                <label
                                                    key={cfg.grade}
                                                    className="flex items-center gap-3 font-mono text-sm cursor-pointer hover:text-foreground group w-full transition-colors select-none text-gray-400"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedWetGrips, setSelectedWetGrips, cfg.grade)}
                                                        className="accent-primary rounded-none cursor-pointer w-4 h-4 bg-background border border-surface-border"
                                                    />
                                                    <div
                                                        className="px-3 py-0.5 text-[11px] font-black font-mono text-center flex items-center justify-center min-w-[28px] relative select-none"
                                                        style={{
                                                            backgroundColor: cfg.bgColor,
                                                            color: cfg.textColor,
                                                            clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
                                                            paddingRight: '8px',
                                                            fontWeight: '900',
                                                        }}
                                                    >
                                                        {cfg.grade}
                                                    </div>
                                                    <span className="text-[12px] text-gray-500 font-mono">
                                                        ({count})
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Noise Emissions Section */}
                            <div className="border-t border-surface-border/50 pt-5 mt-5">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-sans text-sm font-bold text-foreground uppercase tracking-wide">
                                            {t("spec.noiseEmissionsTitle", "Noise emissions")}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-surface-border/40 hover:bg-surface-border/80 flex items-center justify-center text-[10px] text-gray-400 cursor-pointer font-bold select-none" title="Tire noise emissions show external rolling noise in decibels. Class A is the quietest.">
                                            ?
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setNoiseCollapsed(!noiseCollapsed)}
                                        className="text-gray-500 hover:text-foreground cursor-pointer text-xs font-mono transition-transform duration-200 select-none"
                                    >
                                        {noiseCollapsed ? "▲" : "▼"}
                                    </button>
                                </div>
                                
                                {!noiseCollapsed && (
                                    <div className="space-y-3.5 mt-4.5 pl-1">
                                        {["A", "B", "C"].map((grade) => {
                                            const count = specCounts.noiseClasses[grade] || 0;
                                            const isChecked = selectedNoiseClasses.includes(grade);
                                            return (
                                                <label
                                                    key={grade}
                                                    className="flex items-center gap-3 font-mono text-sm cursor-pointer hover:text-foreground group w-full transition-colors select-none text-gray-400"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleFilter(selectedNoiseClasses, setSelectedNoiseClasses, grade)}
                                                        className="accent-primary rounded-none cursor-pointer w-4 h-4 bg-background border border-surface-border"
                                                    />
                                                    <span className="font-mono text-sm font-bold text-foreground tracking-wide flex items-center">
                                                        {grade}
                                                        {(() => {
                                                            const speakerPath = "M6 9v6h3l4 4V5L9 9H6z";
                                                            if (grade === "A") {
                                                                return (
                                                                    <svg className="w-4 h-4 text-foreground stroke-current fill-current ml-1.5" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                                                        <path stroke="none" d={speakerPath} />
                                                                        <path fill="none" d="M16.5 8.5a4.5 4.5 0 0 1 0 7" />
                                                                    </svg>
                                                                );
                                                            }
                                                            if (grade === "B") {
                                                                return (
                                                                    <svg className="w-4 h-4 text-foreground stroke-current fill-current ml-1.5" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                                                        <path stroke="none" d={speakerPath} />
                                                                        <path fill="none" d="M16.5 8.5a4.5 4.5 0 0 1 0 7" />
                                                                        <path fill="none" d="M19 6a9 9 0 0 1 0 12" />
                                                                    </svg>
                                                                );
                                                            }
                                                            return (
                                                                <svg className="w-4 h-4 text-foreground stroke-current fill-current ml-1.5" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                                                    <path stroke="none" d={speakerPath} />
                                                                    <path fill="none" d="M16.5 8.5a4.5 4.5 0 0 1 0 7" />
                                                                    <path fill="none" d="M19 6a9 9 0 0 1 0 12" />
                                                                    <path fill="none" d="M21.5 3.5a13.5 13.5 0 0 1 0 17" />
                                                                </svg>
                                                            );
                                                        })()}
                                                    </span>
                                                    <span className="text-[12px] text-gray-500 font-mono">
                                                        ({count})
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* D. WHEELS/RIMS SPECIFIC FILTERS */}
                    {isWheels && (
                        <>
                            {/* 1. Designation Model - Searchable Checklist with Dynamic Counts */}
                            {uniqueSpecs.models.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.model", "Model Designation")}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder={t("filter.searchModels", "Search models...")}
                                        value={modelSearch}
                                        onChange={(e) => setModelSearch(e.target.value)}
                                        className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                                    />
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.models
                                            .filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()))
                                            .map((model) => {
                                                const count = specCounts.models[model] || 0;
                                                if (count === 0) return null;
                                                return (
                                                    <label
                                                        key={model}
                                                        className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedModels.includes(model) ? "text-gray-600" : "text-gray-400"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModels.includes(model)}
                                                            onChange={() => toggleFilter(selectedModels, setSelectedModels, model)}
                                                            className="accent-primary rounded-none cursor-pointer"
                                                        />
                                                        <span className="truncate">{model}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* 2. Inches Filter - Custom 4-Column Visual Buttons (No dynamic counts inside) */}
                            {uniqueSpecs.inches.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.inch", "Diameter (Zoll)")}
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {uniqueSpecs.inches.map((inch) => {
                                            const isSelected = selectedInches.includes(inch);
                                            const count = specCounts.inches[inch] || 0;
                                            if (count === 0) return null;
                                            return (
                                                <button
                                                    key={inch}
                                                    onClick={() => toggleFilter(selectedInches, setSelectedInches, inch)}
                                                    className={`py-2 text-[11px] font-mono border text-center transition-all cursor-pointer rounded-none font-bold ${isSelected
                                                        ? "border-primary bg-primary/15 text-white shadow-sm"
                                                        : "border-surface-border bg-background text-gray-400 hover:border-gray-500 hover:text-white"
                                                        }`}
                                                >
                                                    {inch}&quot;
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 5. Rim Dimensions/Offset (size) - Searchable Checklist with Dynamic Counts */}
                            {uniqueSpecs.sizes.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.size", "Rim Size / Dimensions")}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder={t("filter.searchSizes", "Search dimensions...")}
                                        value={sizeSearch}
                                        onChange={(e) => setSizeSearch(e.target.value)}
                                        className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                                    />
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.sizes
                                            .filter((s) => s.toLowerCase().includes(sizeSearch.toLowerCase()))
                                            .map((size) => {
                                                const count = specCounts.sizes[size] || 0;
                                                if (count === 0) return null;
                                                return (
                                                    <label
                                                        key={size}
                                                        className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedSizes.includes(size) ? "text-gray-600" : "text-gray-400"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSizes.includes(size)}
                                                            onChange={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                                                            className="accent-primary rounded-none cursor-pointer"
                                                        />
                                                        <span className="truncate">{size}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* 6. Spoke Design/Pattern - Searchable Checklist with Dynamic Counts */}
                            {uniqueSpecs.patterns.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.pattern", "Spoke Pattern")}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder={t("filter.searchPatterns", "Search patterns...")}
                                        value={patternSearch}
                                        onChange={(e) => setPatternSearch(e.target.value)}
                                        className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                                    />
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.patterns
                                            .filter((p) => p.toLowerCase().includes(patternSearch.toLowerCase()))
                                            .map((pattern) => {
                                                const count = specCounts.patterns[pattern] || 0;
                                                if (count === 0) return null;
                                                return (
                                                    <label
                                                        key={pattern}
                                                        className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedPatterns.includes(pattern) ? "text-gray-600" : "text-gray-400"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPatterns.includes(pattern)}
                                                            onChange={() => toggleFilter(selectedPatterns, setSelectedPatterns, pattern)}
                                                            className="accent-primary rounded-none cursor-pointer"
                                                        />
                                                        <span className="truncate">{pattern}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* 7. Color Finish (colortype) - General Colors Searchable Checklist with Dynamic Counts */}
                            {uniqueSpecs.colorTypes.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.colortype", "Color Finish")}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder={t("filter.searchColorTypes", "Search colors...")}
                                        value={colorTypeSearch}
                                        onChange={(e) => setColorTypeSearch(e.target.value)}
                                        className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                                    />
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.colorTypes
                                            .filter((ct) => ct.toLowerCase().includes(colorTypeSearch.toLowerCase()))
                                            .map((ct) => {
                                                const count = specCounts.colorTypes[ct] || 0;
                                                if (count === 0) return null;
                                                return (
                                                    <label
                                                        key={ct}
                                                        className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedColorTypes.includes(ct) ? "text-gray-600" : "text-gray-400"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedColorTypes.includes(ct)}
                                                            onChange={() => toggleFilter(selectedColorTypes, setSelectedColorTypes, ct)}
                                                            className="accent-primary rounded-none cursor-pointer"
                                                        />
                                                        <span className="truncate">{ct}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* 8. Detailed Finishes collapsible accordion - default closed, checklist with sub-search */}
                            {uniqueSpecs.colors.length > 0 && (
                                <div className="border-t border-surface-border/50 pt-4">
                                    <button
                                        onClick={() => setShowDetailedColors(!showDetailedColors)}
                                        className="flex items-center justify-between w-full font-mono text-xs text-gray-400 hover:text-white uppercase tracking-widest mb-2 cursor-pointer py-1.5"
                                    >
                                        <span>{t("spec.detailedColors", "Detailed Finishes")}</span>
                                        <span className="text-[10px] font-mono text-primary transition-transform duration-200">
                                            {showDetailedColors ? "▼" : "►"}
                                        </span>
                                    </button>
                                    {showDetailedColors && (
                                        <div className="space-y-3 mt-2 pl-1">
                                            <input
                                                type="text"
                                                placeholder={t("filter.searchColors", "Search finishes...")}
                                                value={colorSearch}
                                                onChange={(e) => setColorSearch(e.target.value)}
                                                className="w-full bg-background border border-surface-border px-2 py-1 text-[11px] font-mono focus:border-primary focus:outline-none text-foreground placeholder:text-gray-700 rounded-none mb-2 transition-colors"
                                            />
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {uniqueSpecs.colors
                                                    .filter((c) => c.toLowerCase().includes(colorSearch.toLowerCase()))
                                                    .map((c) => {
                                                        const count = specCounts.colors[c] || 0;
                                                        if (count === 0) return null;
                                                        return (
                                                            <label
                                                                key={c}
                                                                className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedColors.includes(c) ? "text-gray-600" : "text-gray-400"
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedColors.includes(c)}
                                                                    onChange={() => toggleFilter(selectedColors, setSelectedColors, c)}
                                                                    className="accent-primary rounded-none cursor-pointer"
                                                                />
                                                                <span className="truncate">{c}</span>
                                                                <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                            </label>
                                                        );
                                                    })}
                                                {uniqueSpecs.colors.filter((c) => c.toLowerCase().includes(colorSearch.toLowerCase())).length === 0 && (
                                                    <p className="text-[10px] text-gray-600 font-mono">{t("filter.noResults", "No finishes found")}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. Bolt Circles (PCD) Filter - Checklist with Dynamic Counts */}
                            {uniqueSpecs.boltCircles.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.boltCircle", "Bolt Circle PCD")}
                                    </h3>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.boltCircles.map((bc) => {
                                            const count = specCounts.boltCircles[bc] || 0;
                                            if (count === 0) return null;
                                            return (
                                                <label
                                                    key={bc}
                                                    className={`flex items-center gap-2 font-mono text-xs cursor-pointer hover:text-foreground w-full transition-colors ${count === 0 && !selectedBoltCircles.includes(bc) ? "text-gray-600" : "text-gray-400"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBoltCircles.includes(bc)}
                                                        onChange={() => toggleFilter(selectedBoltCircles, setSelectedBoltCircles, bc)}
                                                        className="accent-primary rounded-none cursor-pointer"
                                                    />
                                                    <span>{bc}</span>
                                                    <span className="text-[10px] text-gray-600 font-mono ml-auto">({count})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 4. Center Bore Hubs - Beautiful space-saving 2-column checklist layout with counts */}
                            {uniqueSpecs.hubs.length > 0 && (
                                <div>
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2.5">
                                        {t("spec.hub", "Hub Center Bore")}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {uniqueSpecs.hubs.map((hub) => {
                                            const count = specCounts.hubs[hub] || 0;
                                            if (count === 0) return null;
                                            return (
                                                <label
                                                    key={hub}
                                                    className={`flex items-center gap-1.5 font-mono text-xs cursor-pointer hover:text-foreground transition-colors ${count === 0 && !selectedHubs.includes(hub) ? "text-gray-600" : "text-gray-400"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedHubs.includes(hub)}
                                                        onChange={() => toggleFilter(selectedHubs, setSelectedHubs, hub)}
                                                        className="accent-primary rounded-none cursor-pointer"
                                                    />
                                                    <span className="truncate">{hub} mm ({count})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                        </>
                    )}
                </div>
            </div>

            {/* 2. Products Grid Panel */}
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
                    <p className="font-mono text-xs text-gray-500">
                        <span className="text-foreground font-bold font-mono">{filteredProducts.length}</span> {t("search.resultsFound", "compatible products matched")}
                    </p>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-surface-border bg-surface-deep tech-grid">
                        <p className="text-4xl mb-4">🔍</p>
                        <p className="font-mono text-sm text-gray-500 mb-6">{t("product.noProducts", "No products available under selected filters.")}</p>
                        <button
                            onClick={handleClearFilters}
                            className="px-6 py-2.5 font-display text-xs font-bold uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer rounded-none tech-glow-orange"
                        >
                            {t("filter.clear", "Reset Filters")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const brand = getAttr(product, "brand");
                            const model = getAttr(product, "model");
                            const size = getAttr(product, "size");
                            const inch = getAttr(product, "inch");
                            const boltCircle = getAttr(product, "bolt_circle");
                            const hub = getAttr(product, "hub");
                            const width = getAttr(product, "width");
                            const height = getAttr(product, "height");
                            const loadIndex = getAttr(product, "load_index");
                            const speedRating = getAttr(product, "speed_rating");
                            const season = getAttr(product, "season");

                            return (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.handle}`}
                                    className="group block bg-surface-card border rounded-md border-surface-border overflow-hidden relative transition-all duration-300 hover:border-primary hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5 tech-grid"
                                >
                                    {/* Decorative Corner telemetry element */}
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-surface-border group-hover:bg-primary transition-colors duration-300"></div>

                                    {/* Thumbnail */}
                                    <div className="bg-white aspect-square bg-surface-deep border-b border-surface-border relative overflow-hidden flex items-center justify-center p-4">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.title}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                        ) : (
                                            <div className="text-gray-800 text-7xl font-mono opacity-25 group-hover:text-primary transition-colors duration-300">
                                                {isTires ? "🛞" : "⚙️"}
                                            </div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            <span className="px-2 py-0.5 text-[9px] font-mono border border-accent/20 text-accent bg-background/90 tracking-wider">
                                                {brand || "VELOCE"}
                                            </span>
                                            {season && (
                                                <span className="px-2 py-0.5 text-[9px] font-mono border border-surface-border text-gray-400 bg-background/90 tracking-wider flex items-center gap-1">
                                                    <SeasonIcon season={season} size={10} className="text-primary" />
                                                    <span>{season}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body Content */}
                                    <div className="p-4 flex flex-col justify-between h-44">
                                        <div>
                                            <h3 className="font-display text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors tracking-wide text-foreground uppercase">
                                                {model ? `${brand} ${model}` : product.title}
                                            </h3>

                                            {/* Specs Badge Bar */}
                                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                                {isTires && width && height && inch && (
                                                    <span className="px-2 py-1 bg-background text-[10px] font-mono text-gray-300 border border-surface-border">
                                                        {width}/{height} R{inch} {loadIndex}{speedRating}
                                                    </span>
                                                )}
                                                {isWheels && inch && boltCircle && (
                                                    <span className="px-2 py-1 bg-background text-[10px] font-mono text-gray-300 border border-surface-border">
                                                        {inch}&quot; | {boltCircle} | Hub {hub}
                                                    </span>
                                                )}
                                                {!isTires && !isWheels && size && (
                                                    <span className="px-2 py-1 bg-background text-[10px] font-mono text-gray-300 border border-surface-border">
                                                        {size}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Display explicit dimensions details */}
                                            <p className="mt-2 text-[10px] text-gray-500 font-mono line-clamp-2">
                                                {product.description || `High-performance configuration. Confirmed for precision fitment.`}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-surface-border pt-3 mt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-mono text-accent uppercase tracking-wider">
                                                    {t("product.compatibility", "FITMENT MATCH")}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-500 mt-0.5">
                                                    {(() => {
                                                        const qty = getStockQty(product);
                                                        return qty > 0 ? (
                                                            <span className="text-emerald-500 font-bold">{qty} {t("product.inStock", "IN STOCK")}</span>
                                                        ) : (
                                                            <span className="text-rose-500 font-bold">{t("product.outOfStock", "OUT OF STOCK")}</span>
                                                        );
                                                    })()}
                                                </span>
                                            </div>
                                            {product.variants?.[0]?.calculated_price && (
                                                <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {formatPrice(product.variants[0].calculated_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
