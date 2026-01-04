import { Eye, Smile, Scissors, EyeClosed } from 'lucide-react';

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
    colors?: string[];  // Quick access for solid colors
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
                            mask: 'masks/eyeshadow.png'
                        },
                        colors: [
                            '#4A3B32', '#8B5A2B', '#CDAF95', // Nudes
                            '#2F1B1B', '#5C3A3A', '#9E6F6F', // Reds/Pinks
                            '#1A2B3C', '#2F4F4F', '#4682B4', // Blues
                            '#2E0854', '#4B0082', '#8A2BE2'  // Purples
                        ]
                    },
                    {
                        id: 'eyeshadow_pattern',
                        label: 'Style',
                        type: 'pattern',
                        zIndex: 10,
                        defaultValue: 'basic',
                        region: 'upper_lid',
                        options: [
                            { id: 'basic', value: 'basic', label: 'Basic', render: { mask: 'masks/shadow_basic.png' } },
                            { id: 'smokey', value: 'smokey', label: 'Smokey', render: { mask: 'masks/shadow_smokey.png' } },
                            { id: 'crease', value: 'crease', label: 'Cut Crease', render: { mask: 'masks/shadow_crease.png' } },
                            { id: 'winged', value: 'winged', label: 'Winged', render: { mask: 'masks/shadow_winged.png' } }
                        ]
                    },
                    {
                        id: 'eyeshadow_opacity',
                        label: 'Intensity',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.1,
                        defaultValue: 0.8,
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
                            { id: 'thin', value: 'thin', label: 'Thin', render: { mask: 'masks/liner_thin.png' } },
                            { id: 'thick', value: 'thick', label: 'Thick', render: { mask: 'masks/liner_thick.png' } },
                            { id: 'cat_eye', value: 'cat_eye', label: 'Cat Eye', render: { mask: 'masks/liner_cat.png' } },
                            { id: 'double', value: 'double', label: 'Double', render: { mask: 'masks/liner_double.png' } }
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
                        colors: ['#000000', '#3D2B1F', '#1A1A1A', '#000080']
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
                            { id: 'natural', value: 'natural', label: 'Natural', render: { mask: 'masks/mascara_natural.png' } },
                            { id: 'volume', value: 'volume', label: 'Volume', render: { mask: 'masks/mascara_volume.png' } },
                            { id: 'length', value: 'length', label: 'Lengthening', render: { mask: 'masks/mascara_length.png' } }
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
                        colors: ['#634e34', '#2e5c8a', '#3d7a46', '#876c43', '#808080']
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
                            '#F5DEB3', '#E6BC98', '#D2B48C', '#BC8F8F', // Fair/Light
                            '#CD853F', '#8B4513', '#A0522D', '#5D4037'  // Medium/Dark
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
                        colors: ['#FFB6C1', '#FF69B4', '#CD5C5C', '#E9967A', '#DB7093']
                    },
                    {
                        id: 'blush_pattern',
                        label: 'Placement',
                        type: 'pattern',
                        zIndex: 5,
                        defaultValue: 'apples',
                        region: 'cheeks',
                        options: [
                            { id: 'apples', value: 'apples', label: 'Apples', render: { mask: 'masks/blush_apples.png' } },
                            { id: 'lifted', value: 'lifted', label: 'Lifted', render: { mask: 'masks/blush_lifted.png' } },
                            { id: 'sunburn', value: 'sunburn', label: 'Sunkissed', render: { mask: 'masks/blush_sunburn.png' } }
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
                        colors: ['#8B5A2B', '#654321', '#5D4037', '#3E2723']
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
                            '#DC143C', '#B22222', '#800000', // Reds
                            '#FF69B4', '#FF1493', '#C71585', // Pinks
                            '#D2691E', '#8B4513', '#A0522D'  // Nudes/Browns
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
                            { id: 'matte', value: 'matte', label: 'Matte', render : { mask : 'masks/lipstick_matte.png' } },
                            { id: 'satin', value: 'satin', label: 'Satin', render : { mask : 'masks/lipstick_satin.png' } },
                            { id: 'gloss', value: 'gloss', label: 'High Gloss', render : { mask : 'masks/lipstick_gloss.png' } }
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
                        render: { blendMode: 'normal', mask: 'masks/lipliner.png' },
                        colors: ['#8B0000', '#A52A2A', '#800000']
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
                        colors: ['#000000', '#363636', '#594436', '#8B7355']
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
                            { id: 'natural', value: 'natural', label: 'Natural', render: { mask: 'masks/brow_natural.png' } },
                            { id: 'arched', value: 'arched', label: 'Arched', render: { mask: 'masks/brow_arched.png' } },
                            { id: 'straight', value: 'straight', label: 'Straight', render: { mask: 'masks/brow_straight.png' } },
                            { id: 'thin', value: 'thin', label: 'Thin 90s', render: { mask: 'masks/brow_thin.png' } }
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
                            '#000000', '#2C222B', // Black/Dark Brown
                            '#B55239', '#8D4004', // Red/Auburn
                            '#E6CEA8', '#E3C179', // Blonde
                            '#6A0DAD', '#FFC0CB'  // Funky
                        ]
                    }
                ]
            }
        ]
    }
];
