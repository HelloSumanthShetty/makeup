import { Eye, Smile, Scissors, EyeClosed } from 'lucide-react';

import eyeshadowMask from '../assets/eyesshadow/eyeshadow.png';
import shadowBasic from '../assets/eyesshadow/basic.png';
import shadowSmokey from '../assets/eyesshadow/smokey.png';
import shadowCrease from '../assets/eyesshadow/crease.png';
import shadowWinged from '../assets/eyesshadow/winged.png';
import linerThin from '../assets/eyeliner/thin.png';
import linerThick from '../assets/eyeliner/thick.png';
import linerCat from '../assets/eyeliner/cat.png';
import linerDouble from '../assets/eyeliner/double.png';
import mascaraNatural from '../assets/mascara/Natural.png';
import mascaraVolume from '../assets/mascara/volume.png';
import mascaraLength from '../assets/mascara/lightning.png';
import blushApples from '../assets/blush/apples.png';
import blushLifted from '../assets/blush/lifted.png';
import blushSunburn from '../assets/blush/sunkissed.png';
import lipstickMatte from '../assets/lips/matte.png';
import lipstickSatin from '../assets/lips/satin.png';
import lipstickGloss from '../assets/lips/glossy.png';
import liplinerMask from '../assets/lips/lipliner.png';
import browNatural from '../assets/Eyebrows/natural.png';
import browArched from '../assets/Eyebrows/arched.png';
import browStraight from '../assets/Eyebrows/straight.png';
import browThin from '../assets/Eyebrows/thin.png';

export interface RenderConfig {
    blendMode?: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'color' | 'screen';
    opacity?: number; // Base opacity
    mask?: string; // e.g., 'masks/eyeshadow.png'
}

export type MakeupRegion = 'upper_lid' | 'lower_lid' | 'cheeks' | 'lips' | 'brows' | 'face' | 'lashes' | 'iris' | 'hair';

export interface MakeupOption {
    id: string;
    label?: string;
    value: string; // Hex color or asset URL / descriptor 
    thumbnail?: string; // For patterns/shapes
    icon?: any;
    render?: RenderConfig; // Option-specific overrides
}

export interface ColorOption {
    hex: string;
    name: string;
}

export interface MakeupFeature {
    id: string;
    label: string;
    type: 'color' | 'pattern' | 'slider' | 'select' | 'toggle';
    step?: number;      // For sliders (e.g., 0.1 for opacity)
    min?: number;       // For sliders
    max?: number;       // For sliders
    defaultValue: any;  // null implies "natural state"
    zIndex: number;     // Critical for layering
    options?: MakeupOption[];
    colors?: ColorOption[];  // Named colors with hex and name
    render?: RenderConfig; // Default render config for this feature
    region?: MakeupRegion;
}

export interface SubCategory {
    id: string;
    label: string;
    features: MakeupFeature[];
}

export interface MainCategory {
    id: string;
    label: string;
    icon?: any;
    subCategories: SubCategory[];
}

export const MAKEUP_DATA: MainCategory[] = [
    {
        id: 'eyes',
        label: 'Eyes',
        icon: Eye,
        subCategories: [
            {
                id: 'eyeshadow',
                label: 'Eye Shadow',
                features: [
                    {
                        id: 'eyeshadow_color',
                        label: 'Eye Shadow',
                        type: 'color',
                        zIndex: 10,
                        defaultValue: null,
                        region: 'upper_lid',
                        render: {
                            blendMode: 'multiply',
                            mask: eyeshadowMask
                        },
                        colors: [
                            { hex: '#4A3B32', name: 'Cocoa' }, { hex: '#8B5A2B', name: 'Bronze' }, { hex: '#CDAF95', name: 'Nude' },
                            { hex: '#2F1B1B', name: 'Burgundy' }, { hex: '#5C3A3A', name: 'Rosewood' }, { hex: '#9E6F6F', name: 'Blush' },
                            { hex: '#1A2B3C', name: 'Navy' }, { hex: '#2F4F4F', name: 'Teal' }, { hex: '#4682B4', name: 'Sky Blue' },
                            { hex: '#2E0854', name: 'Deep Purple' }, { hex: '#4B0082', name: 'Indigo' }, { hex: '#8A2BE2', name: 'Violet' }
                        ]
                    },
                    {
                        id: 'eyeshadow_pattern',
                        label: 'Style',
                        type: 'pattern',
                        zIndex: 10,
                        defaultValue: null,
                        region: 'upper_lid',
                        options: [
                            { id: 'basic', value: 'basic', label: 'Basic', render: { mask: shadowBasic } },
                            { id: 'smokey', value: 'smokey', label: 'Smokey', render: { mask: shadowSmokey } },
                            { id: 'crease', value: 'crease', label: 'Cut Crease', render: { mask: shadowCrease } },
                            { id: 'winged', value: 'winged', label: 'Winged', render: { mask: shadowWinged } }
                        ]
                    },
                    {
                        id: 'eyeshadow_opacity',
                        label: 'Intensity',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.1,
                        defaultValue: 0.5,
                        zIndex: 10,
                        region: 'upper_lid'
                    }
                ]
            },
            {
                id: 'eyeliner',
                label: 'Eye Liner',
                features: [
                    {
                        id: 'eyeliner_style',
                        label: 'Pattern',
                        type: 'pattern',
                        zIndex: 20,
                        defaultValue: null,
                        region: 'upper_lid',
                        render: { blendMode: 'normal' },
                        options: [
                            { id: 'thin', value: 'thin', label: 'Thin', render: { mask: linerThin } },
                            { id: 'thick', value: 'thick', label: 'Thick', render: { mask: linerThick } },
                            { id: 'cat_eye', value: 'cat_eye', label: 'Cat Eye', render: { mask: linerCat } },
                            { id: 'double', value: 'double', label: 'Double', render: { mask: linerDouble } }
                        ]
                    },
                    {
                        id: 'eyeliner_color',
                        label: 'Color',
                        type: 'color',
                        zIndex: 20,
                        defaultValue: '#000000',
                        region: 'upper_lid',
                        render: { blendMode: 'normal' },
                        colors: [
                            { hex: '#000000', name: 'Black' }, { hex: '#3D2B1F', name: 'Dark Brown' },
                            { hex: '#1A1A1A', name: 'Charcoal' }, { hex: '#000080', name: 'Navy' }
                        ]
                    }
                ]
            },
            {
                id: 'mascara',
                label: 'Mascara',
                features: [
                    {
                        id: 'mascara_style',
                        label: 'Lash Style',
                        type: 'pattern',
                        zIndex: 25,
                        defaultValue: null,
                        region: 'lashes',
                        render: { blendMode: 'multiply' },
                        options: [
                            { id: 'natural', value: 'natural', label: 'Natural', render: { mask: mascaraNatural } },
                            { id: 'volume', value: 'volume', label: 'Volume', render: { mask: mascaraVolume } },
                            { id: 'length', value: 'length', label: 'Lengthening', render: { mask: mascaraLength } }
                        ]
                    }
                ]
            },
            {
                id: 'contacts',
                label: 'Contacts',
                features: [
                    {
                        id: 'contact_color',
                        label: 'Eye Color',
                        type: 'color',
                        zIndex: 30,
                        defaultValue: null,
                        region: 'iris',
                        render: { blendMode: 'overlay', opacity: 0.6 },
                        colors: [
                            { hex: '#634e34', name: 'Hazel' }, { hex: '#2e5c8a', name: 'Ocean Blue' },
                            { hex: '#3d7a46', name: 'Forest Green' }, { hex: '#876c43', name: 'Amber' }, { hex: '#808080', name: 'Gray' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'face',
        label: 'Face',
        icon: Smile,
        subCategories: [
            {
                id: 'foundation',
                label: 'Foundation',
                features: [
                    {
                        id: 'foundation_color',
                        label: 'Shade',
                        type: 'color',
                        zIndex: 1,
                        defaultValue: null,
                        region: 'face',
                        render: { blendMode: 'normal', opacity: 0.4 },
                        colors: [
                            { hex: '#F5DEB3', name: 'Porcelain' }, { hex: '#E6BC98', name: 'Ivory' }, { hex: '#D2B48C', name: 'Sand' }, { hex: '#BC8F8F', name: 'Rosy Beige' },
                            { hex: '#CD853F', name: 'Caramel' }, { hex: '#8B4513', name: 'Mocha' }, { hex: '#A0522D', name: 'Chestnut' }, { hex: '#5D4037', name: 'Espresso' }
                        ]
                    },
                    {
                        id: 'foundation_coverage',
                        label: 'Coverage',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.1,
                        defaultValue: 0.5,
                        zIndex: 1,
                        region: 'face'
                    }
                ]
            },
            {
                id: 'blush',
                label: 'Blush',
                features: [
                    {
                        id: 'blush_color',
                        label: 'Color',
                        type: 'color',
                        zIndex: 5,
                        defaultValue: null,
                        region: 'cheeks',
                        render: { blendMode: 'multiply', opacity: 0.6 },
                        colors: [
                            { hex: '#FFB6C1', name: 'Baby Pink' }, { hex: '#FF69B4', name: 'Hot Pink' },
                            { hex: '#CD5C5C', name: 'Indian Red' }, { hex: '#E9967A', name: 'Coral' }, { hex: '#DB7093', name: 'Dusty Rose' }
                        ]
                    },
                    {
                        id: 'blush_pattern',
                        label: 'Placement',
                        type: 'pattern',
                        zIndex: 5,
                        defaultValue: null,
                        region: 'cheeks',
                        options: [
                            { id: 'apples', value: 'apples', label: 'Apples', render: { mask: blushApples } },
                            { id: 'lifted', value: 'lifted', label: 'Lifted', render: { mask: blushLifted } },
                            { id: 'sunburn', value: 'sunburn', label: 'Sunkissed', render: { mask: blushSunburn } }
                        ]
                    }
                ]
            },
            {
                id: 'contour',
                label: 'Contour',
                features: [
                    {
                        id: 'contour_color',
                        label: 'Shade',
                        type: 'color',
                        zIndex: 4,
                        defaultValue: null,
                        region: 'face',
                        render: { blendMode: 'multiply', opacity: 0.5 },
                        colors: [
                            { hex: '#8B5A2B', name: 'Bronze' }, { hex: '#654321', name: 'Dark Brown' },
                            { hex: '#5D4037', name: 'Cocoa' }, { hex: '#3E2723', name: 'Espresso' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'lips',
        label: 'Lips',
        icon: Smile,
        subCategories: [
            {
                id: 'lipstick',
                label: 'Lipstick',
                features: [
                    {
                        id: 'lipstick_color',
                        label: 'Color',
                        type: 'color',
                        zIndex: 15,
                        defaultValue: null,
                        region: 'lips',
                        render: { blendMode: 'soft-light', opacity: 0.8 },
                        colors: [
                            { hex: '#DC143C', name: 'Crimson' }, { hex: '#B22222', name: 'Firebrick' }, { hex: '#800000', name: 'Maroon' },
                            { hex: '#FF69B4', name: 'Hot Pink' }, { hex: '#FF1493', name: 'Fuchsia' }, { hex: '#C71585', name: 'Magenta' },
                            { hex: '#D2691E', name: 'Nude' }, { hex: '#8B4513', name: 'Chocolate' }, { hex: '#A0522D', name: 'Caramel' }
                        ]
                    },
                    {
                        id: 'lipstick_finish',
                        label: 'Finish',
                        type: 'select',
                        zIndex: 15,
                        defaultValue: 'matte',
                        region: 'lips',
                        options: [
                            { id: 'matte', value: 'matte', label: 'Matte', render: { mask: lipstickMatte } },
                            { id: 'satin', value: 'satin', label: 'Satin', render: { mask: lipstickSatin } },
                            { id: 'gloss', value: 'gloss', label: 'High Gloss', render: { mask: lipstickGloss } }
                        ]
                    }
                ]
            },
            {
                id: 'lipliner',
                label: 'Lip Liner',
                features: [
                    {
                        id: 'lipliner_color',
                        label: 'Color',
                        type: 'color',
                        zIndex: 16,
                        defaultValue: null,
                        region: 'lips',
                        render: { blendMode: 'normal', mask: liplinerMask },
                        colors: [
                            { hex: '#8B0000', name: 'Dark Red' }, { hex: '#A52A2A', name: 'Brown' }, { hex: '#800000', name: 'Maroon' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'brows',
        label: 'Eyebrows',
        icon: EyeClosed,
        subCategories: [
            {
                id: 'eyebrow_color',
                label: 'Eyebrow Color',
                features: [
                    {
                        id: 'brow_color',
                        label: 'Eyebrow Color',
                        type: 'color',
                        zIndex: 18,
                        defaultValue: null,
                        region: 'brows',
                        render: { blendMode: 'multiply', opacity: 0.7 },
                        colors: [
                            { hex: '#000000', name: 'Black' }, { hex: '#363636', name: 'Charcoal' },
                            { hex: '#594436', name: 'Dark Brown' }, { hex: '#8B7355', name: 'Medium Brown' }
                        ]
                    }
                ]
            },
            {
                id: 'eyebrow_shape',
                label: 'Eyebrow Shape',
                features: [
                    {
                        id: 'brow_shape',
                        label: 'Style',
                        type: 'pattern',
                        zIndex: 18,
                        defaultValue: 'natural',
                        region: 'brows',
                        options: [
                            { id: 'natural', value: 'natural', label: 'Natural', render: { mask: browNatural } },
                            { id: 'arched', value: 'arched', label: 'Arched', render: { mask: browArched } },
                            { id: 'straight', value: 'straight', label: 'Straight', render: { mask: browStraight } },
                            { id: 'thin', value: 'thin', label: 'Thin 90s', render: { mask: browThin } }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'hair',
        label: 'Hair',
        icon: Scissors,
        subCategories: [
            {
                id: 'hair_color',
                label: 'Hair Color',
                features: [
                    {
                        id: 'hair_base_color',
                        label: 'Dye',
                        type: 'color',
                        zIndex: 50,
                        defaultValue: null,
                        region: 'hair',
                        render: { blendMode: 'soft-light', opacity: 0.5 },
                        colors: [
                            { hex: '#000000', name: 'Jet Black' }, { hex: '#2C222B', name: 'Dark Brown' },
                            { hex: '#B55239', name: 'Auburn' }, { hex: '#8D4004', name: 'Copper' },
                            { hex: '#E6CEA8', name: 'Platinum' }, { hex: '#E3C179', name: 'Golden Blonde' },
                            { hex: '#6A0DAD', name: 'Purple' }, { hex: '#FFC0CB', name: 'Pink' }
                        ]
                    }
                ]
            }
        ]
    }
];
